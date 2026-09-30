import { Router } from 'express';
import { db } from '../db.js';
import { serialManager } from '../hardware/serialManager.js';
import { broadcastEvent } from '../server.js';

const router = Router();

// POST /api/payment/webhook
// Simulates or processes payment gateway callback (UPI / Card reader / Cash validator)
router.post('/webhook', async (req, res) => {
  const { transaction_id, status = 'PAID', payment_method = 'UPI' } = req.body;

  if (!transaction_id) {
    return res.status(400).json({ success: false, error: 'transaction_id is required' });
  }

  try {
    const txn = db.prepare('SELECT * FROM transactions WHERE transaction_id = ?').get(transaction_id);
    if (!txn) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    if (txn.payment_status === 'PAID') {
      return res.json({ success: true, message: 'Transaction already paid and processing' });
    }

    if (status !== 'PAID') {
      db.prepare('UPDATE transactions SET payment_status = ? WHERE transaction_id = ?').run(status, transaction_id);
      broadcastEvent('PAYMENT_FAILED', { transaction_id, status });
      return res.json({ success: false, message: 'Payment was marked failed' });
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

    // Broadcast payment confirmation to kiosk
    broadcastEvent('PAYMENT_RECEIVED', {
      transaction_id,
      amount: txn.total_amount,
      payment_method,
      itemsCount: items.reduce((acc, it) => acc + it.quantity, 0)
    });

    // Respond immediately so payment gateway / webhook doesn't hang
    res.json({
      success: true,
      message: 'Payment verified successfully. Sequential dispensing queued.',
      transaction_id
    });

    // Trigger sequential motor dispensing via hardware queue
    const formattedQueueItems = items.map(it => ({
      slotId: it.slot_id,
      productName: it.product_name,
      quantity: it.quantity
    }));

    // Run asynchronously through the serial manager
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

  } catch (err) {
    console.error('Payment webhook processing error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
