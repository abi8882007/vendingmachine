import { Router } from 'express';
import { db } from '../db.js';
import { serialManager } from '../hardware/serialManager.js';
import { broadcastEvent } from '../server.js';

const router = Router();

// GET /api/system/health
router.get('/health', (req, res) => {
  try {
    const totalSlots = db.prepare('SELECT COUNT(*) as count FROM slots').get().count;
    const lowStockSlots = db.prepare('SELECT slot_id, product_name, stock_qty FROM slots WHERE stock_qty <= 2 AND is_active = 1').all();
    const emptySlots = db.prepare('SELECT slot_id, product_name FROM slots WHERE stock_qty = 0').all();
    const disabledSlots = db.prepare('SELECT slot_id, product_name FROM slots WHERE is_active = 0').all();

    const recentTxns = db.prepare(`
      SELECT transaction_id, total_amount, payment_status, dispense_status, created_at 
      FROM transactions 
      ORDER BY created_at DESC 
      LIMIT 5
    `).all();

    const hardwareStatus = serialManager.getStatus();

    res.json({
      success: true,
      status: 'ONLINE',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: {
        engine: 'SQLite (WAL Mode)',
        totalSlots,
        lowStockCount: lowStockSlots.length,
        emptyCount: emptySlots.length,
        disabledCount: disabledSlots.length
      },
      hardware: hardwareStatus,
      alerts: {
        lowStock: lowStockSlots,
        empty: emptySlots,
        disabled: disabledSlots
      },
      recentTransactions: recentTxns
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/system/restock
// Allows machine operator to replenish stock
router.post('/restock', (req, res) => {
  const { slot_id, quantity = 10 } = req.body;

  try {
    if (slot_id) {
      db.prepare('UPDATE slots SET stock_qty = ?, is_active = 1 WHERE slot_id = ?').run(quantity, slot_id);
      const slot = db.prepare('SELECT * FROM slots WHERE slot_id = ?').get(slot_id);
      broadcastEvent('SLOT_UPDATED', { slot });
    } else {
      // Restock all slots to 12
      db.prepare('UPDATE slots SET stock_qty = 12, is_active = 1').run();
      const allSlots = db.prepare('SELECT * FROM slots').all();
      broadcastEvent('CATALOG_RESTOCKED', { count: allSlots.length });
    }

    res.json({ success: true, message: slot_id ? `Slot #${slot_id} restocked to ${quantity}` : 'All slots restocked to full capacity' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/system/toggle-active
router.post('/toggle-active', (req, res) => {
  const { slot_id } = req.body;
  try {
    const slot = db.prepare('SELECT is_active FROM slots WHERE slot_id = ?').get(slot_id);
    if (!slot) return res.status(404).json({ success: false, error: 'Slot not found' });

    const newStatus = slot.is_active === 1 ? 0 : 1;
    db.prepare('UPDATE slots SET is_active = ? WHERE slot_id = ?').run(newStatus, slot_id);
    const updated = db.prepare('SELECT * FROM slots WHERE slot_id = ?').get(slot_id);
    broadcastEvent('SLOT_UPDATED', { slot: updated });

    res.json({ success: true, slot: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/system/simulate-jam
router.post('/simulate-jam', (req, res) => {
  const { slot_id } = req.body;
  serialManager.setForceJam(slot_id ? parseInt(slot_id, 10) : null);
  res.json({
    success: true,
    forceJamSlot: serialManager.forceJamSlot,
    message: serialManager.forceJamSlot ? `Slot #${serialManager.forceJamSlot} will simulate motor jam on next dispense` : 'Jam simulation cleared'
  });
});

export default router;
