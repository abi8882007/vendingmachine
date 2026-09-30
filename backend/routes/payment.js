import { Router } from 'express';
import { db } from '../db.js';
import { serialManager } from '../hardware/serialManager.js';
import { broadcastEvent } from '../server.js';

const router = Router();

/**
 * Reusable function to confirm and trigger hardware dispensing for a transaction
 */
export async function processPaymentConfirmation({ transaction_id, payment_method = 'UPI', upi_ref = null, raw_note = null }) {
  const txn = db.prepare('SELECT * FROM transactions WHERE transaction_id = ?').get(transaction_id);
  if (!txn) {
    throw new Error(`Transaction ${transaction_id} not found`);
  }

  if (txn.payment_status === 'PAID') {
    return { success: true, message: 'Transaction already marked as PAID', transaction_id };
  }

  // Update transaction to PAID & DISPENSING
  db.prepare(`
    UPDATE transactions 
    SET payment_status = 'PAID', payment_method = ?, dispense_status = 'DISPENSING' 
    WHERE transaction_id = ?
  `).run(payment_method, transaction_id);

  // Fetch items for this transaction
  const items = db.prepare(`
    SELECT ti.slot_id, ti.quantity, s.product_name, s.stock_qty, s.price
    FROM transaction_items ti
    JOIN slots s ON ti.slot_id = s.slot_id
    WHERE ti.transaction_id = ?
  `).all(transaction_id);

  // Deduct stock in database
  const updateStock = db.prepare('UPDATE slots SET stock_qty = MAX(0, stock_qty - ?) WHERE slot_id = ?');
  for (const item of items) {
    updateStock.run(item.quantity, item.slot_id);
    const updatedSlot = db.prepare('SELECT * FROM slots WHERE slot_id = ?').get(item.slot_id);

    // Notify clients of live stock change
    broadcastEvent('SLOT_UPDATED', { slot: updatedSlot });
    if (updatedSlot.stock_qty === 0) {
      broadcastEvent('SLOT_EMPTY', { slotId: item.slot_id, productName: item.product_name });
    }
  }

  // Broadcast instant payment confirmation event to kiosk
  broadcastEvent('PAYMENT_RECEIVED', {
    transaction_id,
    amount: txn.total_amount,
    payment_method,
    upi_ref,
    itemsCount: items.reduce((acc, it) => acc + it.quantity, 0)
  });

  // Trigger sequential motor dispensing via hardware queue
  const formattedQueueItems = items.map((it) => ({
    slotId: it.slot_id,
    productName: it.product_name,
    quantity: it.quantity
  }));

  serialManager.enqueueDispenseItems(formattedQueueItems, transaction_id)
    .then((dispenseResult) => {
      db.prepare("UPDATE transactions SET dispense_status = 'COMPLETED' WHERE transaction_id = ?").run(transaction_id);
      db.prepare("UPDATE transaction_items SET status = 'DISPENSED' WHERE transaction_id = ?").run(transaction_id);
      console.log(`[Payment] Order ${transaction_id} fully dispensed!`);
      broadcastEvent('DISPENSE_COMPLETE', {
        transactionId: transaction_id,
        success: true,
        itemsCount: items.length
      });
    })
    .catch((dispenseError) => {
      console.error(`[Payment] Dispense failure on order ${transaction_id}:`, dispenseError.message);
      db.prepare("UPDATE transactions SET dispense_status = 'PARTIAL_FAIL' WHERE transaction_id = ?").run(transaction_id);
      broadcastEvent('DISPENSE_ERROR', {
        transactionId: transaction_id,
        error: dispenseError.message
      });
    });

  return {
    success: true,
    message: 'Payment confirmed & sequential motor dispensing started!',
    transaction_id,
    amount: txn.total_amount
  };
}

// POST /api/payment/webhook (Manual or Gateway callback)
router.post('/webhook', async (req, res) => {
  const { transaction_id, status = 'PAID', payment_method = 'UPI', upi_ref } = req.body;

  if (!transaction_id) {
    return res.status(400).json({ success: false, error: 'transaction_id is required' });
  }

  try {
    if (status !== 'PAID') {
      db.prepare('UPDATE transactions SET payment_status = ? WHERE transaction_id = ?').run(status, transaction_id);
      broadcastEvent('PAYMENT_FAILED', { transaction_id, status });
      return res.json({ success: false, message: 'Payment was marked failed' });
    }

    const result = await processPaymentConfirmation({ transaction_id, payment_method, upi_ref });
    res.json(result);
  } catch (err) {
    console.error('Payment webhook error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/payment/upi-sms-webhook
// Receives raw SMS text or Android push notification payload from forwarder app (MacroDroid / SMS Forwarder / Tasker / GPay)
router.post('/upi-sms-webhook', async (req, res) => {
  try {
    const rawBody = req.body;
    const text = typeof rawBody === 'string' ? rawBody : (rawBody.text || rawBody.message || rawBody.body || rawBody.notification || JSON.stringify(rawBody));
    console.log(`[UPI Auto-Detect] Received incoming payment notification:`, text);

    // 1. Try to find an exact transaction ID in the SMS/Notification (e.g. TXN_MU0A7LNT_UX20)
    const txnMatch = text.match(/TXN_[A-Z0-9_]+/i);
    let matchedTxnId = txnMatch ? txnMatch[0].toUpperCase() : null;

    // 2. Try to extract amount from text (e.g. "credited by Rs. 100.00", "received ₹100", "credited with Rs 40")
    let extractedAmount = null;
    if (rawBody.amount && !isNaN(Number(rawBody.amount))) {
      extractedAmount = Number(rawBody.amount);
    } else {
      const amtMatch = text.match(/(?:(?:Rs\.?|INR|₹)\s*|credited\s+(?:with\s+)?(?:Rs\.?|INR|₹)?\s*|received\s+(?:Rs\.?|INR|₹)?\s*)([0-9]+(?:\.[0-9]{1,2})?)/i);
      if (amtMatch) {
        extractedAmount = parseFloat(amtMatch[1]);
      }
    }

    // 3. Extract 12-digit UPI UTR reference number if present
    const utrMatch = text.match(/(?:UPI\s*(?:Ref|Reference|UTR)?\s*(?:No|Number)?[:\s/]*|\b)([0-9]{12})\b/i);
    const upiRef = utrMatch ? utrMatch[1] : (rawBody.ref || rawBody.utr || null);

    // 4. Resolve Target Transaction
    let targetTxn = null;

    if (matchedTxnId) {
      targetTxn = db.prepare("SELECT * FROM transactions WHERE transaction_id = ? AND payment_status = 'PENDING'").get(matchedTxnId);
    }

    // If no exact TXN ID in SMS, match the most recent PENDING order matching the exact amount
    if (!targetTxn && extractedAmount !== null) {
      targetTxn = db.prepare(`
        SELECT * FROM transactions 
        WHERE payment_status = 'PENDING' 
          AND ABS(total_amount - ?) < 0.01
        ORDER BY created_at DESC
        LIMIT 1
      `).get(extractedAmount);
    }

    // If still no match and only one pending transaction exists
    if (!targetTxn) {
      const pendingTxns = db.prepare("SELECT * FROM transactions WHERE payment_status = 'PENDING' ORDER BY created_at DESC").all();
      if (pendingTxns.length === 1) {
        targetTxn = pendingTxns[0];
      }
    }

    if (!targetTxn) {
      console.warn(`[UPI Auto-Detect] No matching pending transaction found for Amount: ${extractedAmount}, TxnId: ${matchedTxnId}`);
      return res.status(200).json({
        success: false,
        message: 'Notification received but no matching pending transaction found in kiosk database',
        extractedAmount,
        matchedTxnId,
        upiRef
      });
    }

    console.log(`[UPI Auto-Detect] ✅ Matched payment to Transaction: ${targetTxn.transaction_id} (Amount: ₹${targetTxn.total_amount})`);
    const result = await processPaymentConfirmation({
      transaction_id: targetTxn.transaction_id,
      payment_method: 'UPI',
      upi_ref: upiRef,
      raw_note: text
    });

    res.json({
      success: true,
      autoDetected: true,
      matchedTransactionId: targetTxn.transaction_id,
      amount: targetTxn.total_amount,
      ...result
    });
  } catch (err) {
    console.error('[UPI Auto-Detect] Webhook processing error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/payment/status/:transactionId
router.get('/status/:transactionId', (req, res) => {
  try {
    const { transactionId } = req.params;
    const txn = db.prepare('SELECT transaction_id, total_amount, payment_method, payment_status, dispense_status, created_at FROM transactions WHERE transaction_id = ?').get(transactionId);
    if (!txn) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    res.json({ success: true, transaction: txn });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
