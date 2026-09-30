import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { ShoppingBag, ArrowDownCircle, CheckCircle, Sparkles } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function OrderCompleteModal({
  onDismiss
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(7);

  useEffect(() => {
    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDismiss]);

  const handleDone = () => {
    sounds.playTap();
    onDismiss();
  };

  return (
    <div className="kiosk-modal-backdrop" onClick={handleDone}>
      <div
        className="kiosk-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '540px',
          textAlign: 'center',
          padding: '40px 30px',
          border: '2px solid #10B981',
          boxShadow: '0 0 50px rgba(16, 185, 129, 0.4)'
        }}
      >
        {/* Animated Tray Collection Icon */}
        <div style={{
          width: '110px',
          height: '110px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.2)',
          border: '3px solid #10B981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.5)'
        }}>
          <ArrowDownCircle size={64} color="#10B981" />
        </div>

        <h2 style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: '#0F172A',
          lineHeight: 1.2,
          marginBottom: '12px'
        }}>
          Please Collect Your Items
        </h2>

        <p style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#059669',
          marginBottom: '24px'
        }}>
          from the Tray Below ⬇️
        </p>

        {/* Tray Illustration Glow Box */}
        <div style={{
          background: '#ECFDF5',
          border: '2px dashed #10B981',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          marginBottom: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{ fontSize: '1rem', color: '#065F46', fontWeight: 700 }}>
            Bottom Dispenser Door Unlocked
          </div>
          <div style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 600 }}>
            Push the flap gently to retrieve your items
          </div>
        </div>

        <button
          className="checkout-cta-btn touch-btn"
          onClick={handleDone}
        >
          <CheckCircle size={24} strokeWidth={2.5} />
          <span>I've Collected My Items ({secondsRemaining}s)</span>
        </button>
      </div>
    </div>
  );
}
