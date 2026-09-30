import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/catalog
// Returns all slots with stock & operational status
router.get('/', (req, res) => {
  try {
    const slots = db.prepare(`
      SELECT 
        slot_id, 
        product_name, 
        category, 
        price, 
        stock_qty, 
        image_url, 
        is_active 
      FROM slots 
      ORDER BY slot_id ASC
    `).all();

    res.json({
      success: true,
      totalSlots: slots.length,
      slots
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/catalog/:slotId
router.get('/:slotId', (req, res) => {
  try {
    const slotId = parseInt(req.params.slotId, 10);
    const slot = db.prepare('SELECT * FROM slots WHERE slot_id = ?').get(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, error: `Slot #${slotId} not found` });
    }
    res.json({ success: true, slot });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
