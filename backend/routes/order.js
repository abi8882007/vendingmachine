import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

function generateTransactionId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TXN_${ts}_${rand}`;
}

// POST /api/order/create
// Body: { items: [{ slot_id: 1, quantity: 2 }, ...] }
router.post('/create', (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Items array is required' });
  }

  try {
    let totalAmount = 0;
    const validatedItems = [];

    // Check each requested item against SQLite inventory
    for (const item of items) {
      const slotId = parseInt(item.slot_id, 10);
      const qty = parseInt(item.quantity, 10);

      if (isNaN(slotId) || slotId < 1 || slotId > 32) {
        return res.status(400).json({ success: false, error: `Invalid slot ID: ${item.slot_id}` });
      }
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ success: false, error: `Invalid quantity for slot #${slotId}` });
      }

      const slot = db.prepare('SELECT * FROM slots WHERE slot_id = ?').get(slotId);
      if (!slot) {
        return res.status(404).json({ success: false, error: `Slot #${slotId} does not exist` });
      }
      if (slot.is_active !== 1) {
        return res.status(400).json({ success: false, error: `${slot.product_name} (Slot #${slotId}) is currently inactive/disabled` });
      }
      if (slot.stock_qty < qty) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${slot.product_name}. Requested: ${qty}, Available: ${slot.stock_qty}`
        });
      }

      const subtotal = slot.price * qty;
      totalAmount += subtotal;
      validatedItems.push({
        slotId: slot.slot_id,
        productName: slot.product_name,
        quantity: qty,
        unitPrice: slot.price,
        subtotal
      });
    }

    const transactionId = generateTransactionId();

    // Insert transaction
    db.prepare(`
      INSERT INTO transactions (transaction_id, total_amount, payment_method, payment_status, dispense_status)
      VALUES (?, ?, ?, 'PENDING', 'PENDING')
    `).run(transactionId, totalAmount, 'UPI');

    // Insert items
    const insertItem = db.prepare(`
      INSERT INTO transaction_items (transaction_id, slot_id, quantity, unit_price, status)
      VALUES (?, ?, ?, ?, 'PENDING')
    `);

    for (const item of validatedItems) {
      insertItem.run(transactionId, item.slotId, item.quantity, item.unitPrice);
    }

    // Dynamic real-world UPI QR string for abikrishnakb@okicici
    const payeeVpa = process.env.UPI_ID || 'abikrishnakb@okicici';
    const payeeName = process.env.UPI_PAYEE_NAME || 'Abi Krishna';
    const upiString = `upi://pay?pa=${payeeVpa}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order_${transactionId}`)}&tr=${transactionId}`;

    res.json({
      success: true,
      transactionId,
      totalAmount,
      currency: 'INR',
      items: validatedItems,
      payment: {
        method: 'UPI',
        upiId: payeeVpa,
        payeeName,
        qrPayload: upiString,
        timeoutSeconds: 60
      }
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/order/direct-pay
// Body: { slot_id: 7 }
// Express single-item instant checkout
router.post('/direct-pay', (req, res) => {
  const { slot_id } = req.body;
  const slotId = parseInt(slot_id, 10);

  if (isNaN(slotId) || slotId < 1 || slotId > 32) {
    return res.status(400).json({ success: false, error: 'Valid slot_id between 1 and 32 is required' });
  }

  try {
    const slot = db.prepare('SELECT * FROM slots WHERE slot_id = ?').get(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, error: `Slot #${slotId} not found` });
    }
    if (slot.is_active !== 1) {
      return res.status(400).json({ success: false, error: `${slot.product_name} (Slot #${slotId}) is currently inactive` });
    }
    if (slot.stock_qty < 1) {
      return res.status(400).json({ success: false, error: `${slot.product_name} is currently out of stock` });
    }

    const transactionId = generateTransactionId();
    const totalAmount = slot.price;

    db.prepare(`
      INSERT INTO transactions (transaction_id, total_amount, payment_method, payment_status, dispense_status)
      VALUES (?, ?, 'UPI', 'PENDING', 'PENDING')
    `).run(transactionId, totalAmount);

    db.prepare(`
      INSERT INTO transaction_items (transaction_id, slot_id, quantity, unit_price, status)
      VALUES (?, ?, 1, ?, 'PENDING')
    `).run(transactionId, slot.slot_id, slot.price);

    // Dynamic real-world UPI QR string for abikrishnakb@okicici
    const payeeVpa = process.env.UPI_ID || 'abikrishnakb@okicici';
    const payeeName = process.env.UPI_PAYEE_NAME || 'Abi Krishna';
    const upiString = `upi://pay?pa=${payeeVpa}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`DirectPay_${transactionId}`)}&tr=${transactionId}`;

    res.json({
      success: true,
      isDirectPay: true,
      transactionId,
      totalAmount,
      currency: 'INR',
      item: {
        slotId: slot.slot_id,
        productName: slot.product_name,
        price: slot.price,
        quantity: 1
      },
      payment: {
        method: 'UPI',
        upiId: payeeVpa,
        payeeName,
        qrPayload: upiString,
        timeoutSeconds: 60
      }
    });
  } catch (err) {
    console.error('Direct-pay error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/order/status/:transactionId
router.get('/status/:transactionId', (req, res) => {
  try {
    const { transactionId } = req.params;
    const txn = db.prepare('SELECT * FROM transactions WHERE transaction_id = ?').get(transactionId);
    if (!txn) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    const items = db.prepare('SELECT * FROM transaction_items WHERE transaction_id = ?').all(transactionId);
    res.json({ success: true, transaction: txn, items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
