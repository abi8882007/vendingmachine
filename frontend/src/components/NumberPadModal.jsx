import React, { useState } from 'react';
import { X, Check, Delete, ArrowLeft } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function NumberPadModal({
  item,
  onConfirm,
  onClose
}) {
  const [val, setVal] = useState(String(item.quantity || 1));
  const maxStock = item.stock_qty || 10;

  const handleDigit = (digit) => {
    sounds.playKeypress();
    setVal((prev) => {
      if (prev === '0') return String(digit);
      const next = prev + String(digit);
      const num = parseInt(next, 10);
      if (isNaN(num)) return prev;
      if (num > maxStock) return String(maxStock);
      return String(num);
    });
  };

  const handleClear = () => {
    sounds.playKeypress();
    setVal('0');
  };

  const handleBackspace = () => {
    sounds.playKeypress();
    setVal((prev) => {
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
  };

  const handleConfirm = () => {
    sounds.playTap();
    let num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) num = 1;
    if (num > maxStock) num = maxStock;
    onConfirm(item.slot_id, num);
  };

  return (
    <div className="kiosk-modal-backdrop" onClick={onClose}>
      <div className="kiosk-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
              Set Quantity
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
              {item.product_name} • Max: {maxStock} units
            </p>
          </div>
          <button
            className="stepper-btn touch-btn"
            onClick={onClose}
            style={{ width: '44px', height: '44px' }}
          >
            <X size={20} color="#64748B" />
          </button>
        </div>

        {/* Display Screen */}
        <div style={{
          padding: '24px',
          background: '#F1F5F9',
          textAlign: 'center',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '3.5rem',
            fontWeight: 800,
            color: '#059669',
            letterSpacing: '2px'
          }}>
            {val}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600, marginTop: '4px' }}>
            Subtotal: ₹{((parseInt(val, 10) || 0) * item.price).toFixed(2)}
          </div>
        </div>

        {/* 3x4 Touch Numpad Grid */}
        <div className="numpad-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              className="numpad-key touch-btn"
              onClick={() => handleDigit(digit)}
            >
              {digit}
            </button>
          ))}

          <button
            className="numpad-key action-clear touch-btn"
            onClick={handleClear}
          >
            CLR
          </button>

          <button
            className="numpad-key touch-btn"
            onClick={() => handleDigit(0)}
          >
            0
          </button>

          <button
            className="numpad-key touch-btn"
            onClick={handleBackspace}
          >
            <Delete size={26} color="#94A3B8" />
          </button>
        </div>

        {/* Bottom Confirm Action */}
        <div style={{ padding: '0 24px 24px 24px' }}>
          <button
            className="checkout-cta-btn touch-btn"
            onClick={handleConfirm}
          >
            <Check size={24} strokeWidth={3} />
            <span>Confirm Quantity</span>
          </button>
        </div>
      </div>
    </div>
  );
}
