import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Clock, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function PaymentModal({
  orderData,
  onPaymentSuccess,
  onClose
}) {
  const { transactionId, totalAmount, payment, items = [] } = orderData;
  const qrCanvasRef = useRef(null);

  const [secondsRemaining, setSecondsRemaining] = useState(payment?.timeoutSeconds || 60);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Generate crisp high-resolution UPI QR Code
  useEffect(() => {
    if (qrCanvasRef.current && payment?.qrPayload) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        payment.qrPayload,
        {
          width: 260,
          margin: 1,
          color: {
            dark: '#0F172A',
            light: '#FFFFFF'
          }
        },
        (error) => {
          if (error) console.error('QR code generation error:', error);
        }
      );
    }
  }, [payment?.qrPayload]);

  // 60-second Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose(); // Auto dismiss on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  // Handle instant payment confirmation (Webhook simulation / trigger)
  const handleTriggerPayment = async () => {
    try {
      setIsProcessingPayment(true);
      sounds.playTap();

      const res = await fetch('/api/payment/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: transactionId,
          status: 'PAID',
          payment_method: 'UPI'
        })
      });

      const data = await res.json();
      if (data.success) {
        sounds.playPaymentSuccess();
        onPaymentSuccess({
          transactionId,
          totalAmount,
          items,
          method: 'UPI'
        });
      } else {
        alert(`Payment error: ${data.message || data.error}`);
        setIsProcessingPayment(false);
      }
    } catch (err) {
      console.error('Payment webhook error:', err);
      setIsProcessingPayment(false);
    }
  };

  const progressPercent = (secondsRemaining / (payment?.timeoutSeconds || 60)) * 100;

  return (
    <div className="kiosk-modal-backdrop" onClick={onClose}>
      <div
        className="kiosk-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', borderRadius: '24px', overflow: 'hidden' }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#F0F7FF',
              border: '1.5px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* UPI Logo */}
              <svg width="28" height="20" viewBox="0 0 34 24" fill="none">
                <path d="M12 4L4 18H10L15 8L12 4Z" fill="#00833F" />
                <path d="M18 4L13 13L16 18L24 4H18Z" fill="#ED7026" />
                <path d="M22 18L26 11L28 15L25 18H22Z" fill="#00833F" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                Scan &amp; Pay with UPI
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Txn: <span style={{ fontFamily: 'monospace', color: '#0066FF', fontWeight: 700 }}>{transactionId}</span>
              </p>
            </div>
          </div>

          <button
            className="stepper-btn touch-btn"
            onClick={onClose}
            disabled={isProcessingPayment}
            style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#F8FAFC' }}
          >
            <X size={20} color="#64748B" />
          </button>
        </div>

        {/* 60s Timeout Progress Bar */}
        <div style={{ height: '4px', background: '#E2E8F0', width: '100%' }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: progressPercent > 20 ? '#0066FF' : '#EF4444',
            transition: 'width 1s linear'
          }} />
        </div>

        {/* Modal Body: QR code + Payment Details */}
        <div style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          {/* QR Container */}
          <div style={{
            background: '#FFFFFF',
            padding: '16px',
            borderRadius: '20px',
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0, 102, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <canvas ref={qrCanvasRef} style={{ display: 'block', borderRadius: '12px' }} />
          </div>

          {/* Amount Box */}
          <div style={{
            width: '100%',
            background: '#F1F6FD',
            borderRadius: '16px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Amount to Pay</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A' }}>
                ₹{totalAmount}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#0066FF', fontWeight: 700 }}>
              <Clock size={16} />
              <span>{secondsRemaining}s remaining</span>
            </div>
          </div>

          {/* Supported Apps Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginRight: '4px' }}>Scan with:</span>
            {['GPay', 'PhonePe', 'Paytm', 'BHIM', 'CRED', 'Any UPI App'].map((app) => (
              <span key={app} style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#334155'
              }}>
                {app}
              </span>
            ))}
          </div>
        </div>

        {/* Modal Footer with Express Simulator for Testing */}
        <div style={{
          padding: '18px 28px',
          background: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <button
            className="touch-btn"
            disabled={isProcessingPayment}
            onClick={onClose}
            style={{
              height: '52px',
              padding: '0 20px',
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              color: '#475569',
              fontWeight: 700,
              fontSize: '0.95rem'
            }}
          >
            Cancel
          </button>

          {/* Instant Simulator Button */}
          <button
            className="touch-btn"
            disabled={isProcessingPayment}
            onClick={handleTriggerPayment}
            style={{
              flex: 1,
              height: '52px',
              background: '#0066FF',
              border: 'none',
              borderRadius: '14px',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 102, 255, 0.3)'
            }}
          >
            {isProcessingPayment ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Verifying UPI Payment...</span>
              </>
            ) : (
              <>
                <Zap size={20} fill="#FFFFFF" />
                <span>⚡ Simulate Payment Received</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
