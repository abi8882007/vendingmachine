import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { X, Clock, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function PaymentModal({
  orderData,
  paymentEvent,
  onPaymentSuccess,
  onClose
}) {
  const { transactionId, totalAmount, payment, items = [] } = orderData;
  const qrCanvasRef = useRef(null);

  const totalTimeout = payment?.timeoutSeconds || 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalTimeout);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const onCloseRef = useRef(onClose);
  const onPaymentSuccessRef = useRef(onPaymentSuccess);

  useEffect(() => {
    onCloseRef.current = onClose;
    onPaymentSuccessRef.current = onPaymentSuccess;
  }, [onClose, onPaymentSuccess]);

  const targetUpiId = payment?.upiId || 'abikrishnakb@okicici';
  const targetPayeeName = payment?.payeeName || 'Abi Krishna';
  const formattedAmount = Number(totalAmount || 0).toFixed(2);

  // Dynamic real-world NPCI UPI URL (Compatible with Google Pay, PhonePe, Paytm, BHIM, CRED)
  const upiPayload = payment?.qrPayload && payment.qrPayload.includes(targetUpiId)
    ? payment.qrPayload
    : `upi://pay?pa=${targetUpiId}&pn=${encodeURIComponent(targetPayeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(`Order_${transactionId}`)}&tr=${transactionId}`;

  // Helper to handle successful payment auto-detection
  const handlePaymentConfirmed = useCallback(() => {
    if (isPaymentConfirmed) return;
    setIsPaymentConfirmed(true);
    setIsProcessingPayment(true);
    sounds.playPaymentSuccess();

    setTimeout(() => {
      onPaymentSuccessRef.current?.({
        transactionId,
        totalAmount,
        items,
        method: 'UPI'
      });
    }, 900);
  }, [isPaymentConfirmed, transactionId, totalAmount, items]);

  // 1. Real-Time WebSocket Event Detection
  useEffect(() => {
    if (!paymentEvent) return;
    if (
      paymentEvent.type === 'PAYMENT_RECEIVED' &&
      paymentEvent.payload?.transaction_id === transactionId
    ) {
      console.log('[Kiosk Payment] ⚡ Auto-detected payment via WebSocket:', paymentEvent.payload);
      handlePaymentConfirmed();
    }
  }, [paymentEvent, transactionId, handlePaymentConfirmed]);

  // 2. Continuous High-Frequency Auto-Polling (1.2s intervals)
  useEffect(() => {
    if (isPaymentConfirmed || isExpired) return;

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/payment/status/${transactionId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.transaction?.payment_status === 'PAID') {
          console.log('[Kiosk Payment] ⚡ Auto-detected payment via status polling:', data.transaction);
          handlePaymentConfirmed();
        }
      } catch (err) {
        // Ignore network glitch during polling
      }
    };

    const pollInterval = setInterval(pollStatus, 1200);
    return () => clearInterval(pollInterval);
  }, [transactionId, isPaymentConfirmed, isExpired, handlePaymentConfirmed]);

  // Generate crisp high-resolution UPI QR Code
  useEffect(() => {
    if (qrCanvasRef.current && upiPayload) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        upiPayload,
        {
          width: 260,
          margin: 2,
          errorCorrectionLevel: 'M',
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
  }, [upiPayload]);

  // High-precision, drift-free Countdown Timer
  useEffect(() => {
    if (isPaymentConfirmed) return;

    const startTime = Date.now();
    const endTime = startTime + totalTimeout * 1000;

    setSecondsRemaining(totalTimeout);
    setIsExpired(false);

    const timer = setInterval(() => {
      const now = Date.now();
      const diffMs = endTime - now;
      const secs = Math.max(0, Math.ceil(diffMs / 1000));

      setSecondsRemaining(secs);

      if (secs <= 0) {
        clearInterval(timer);
        setIsExpired(true);
        setTimeout(() => {
          onCloseRef.current?.();
        }, 1200);
      }
    }, 250);

    return () => clearInterval(timer);
  }, [totalTimeout, isPaymentConfirmed]);

  // Handle instant manual payment confirmation (Express Simulator trigger)
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
        handlePaymentConfirmed();
      } else {
        alert(`Payment error: ${data.message || data.error}`);
        setIsProcessingPayment(false);
      }
    } catch (err) {
      console.error('Payment webhook error:', err);
      setIsProcessingPayment(false);
    }
  };

  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / totalTimeout) * 100));

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
        <div style={{ height: '5px', background: '#E2E8F0', width: '100%', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: secondsRemaining <= 10 ? '#EF4444' : secondsRemaining <= 20 ? '#F59E0B' : '#0066FF',
            transition: 'width 0.25s linear, background-color 0.3s ease'
          }} />
        </div>

        {/* Modal Body: QR code + Payment Details */}
        <div style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          {/* QR Container */}
          <div style={{
            position: 'relative',
            background: '#FFFFFF',
            padding: '16px',
            borderRadius: '20px',
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0, 102, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <canvas ref={qrCanvasRef} style={{ display: 'block', borderRadius: '12px', opacity: isExpired ? 0.3 : 1, transition: 'opacity 0.3s' }} />

            {isExpired && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255, 255, 255, 0.94)',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '2rem' }}>⏱️</span>
                <span style={{ fontWeight: 800, color: '#EF4444', fontSize: '1.1rem' }}>QR Code Expired</span>
                <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Closing payment window...</span>
              </div>
            )}
          </div>

          {/* Real-World Payee Identification Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            padding: '8px 18px',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            color: '#15803D',
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.12)'
          }}>
            <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.5} />
            <span>Paying: <strong>{targetPayeeName}</strong> (<span style={{ fontFamily: 'monospace', color: '#0F172A' }}>{targetUpiId}</span>)</span>
          </div>

          {/* Amount Box */}
          <div style={{
            width: '100%',
            background: isPaymentConfirmed ? '#ECFDF5' : '#F1F6FD',
            border: isPaymentConfirmed ? '1.5px solid #10B981' : '1px solid transparent',
            borderRadius: '16px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.3s ease'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: isPaymentConfirmed ? '#047857' : '#64748B', fontWeight: 600 }}>Amount to Pay</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: isPaymentConfirmed ? '#065F46' : '#0F172A' }}>
                ₹{totalAmount}
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              color: isPaymentConfirmed ? '#059669' : (secondsRemaining <= 10 ? '#EF4444' : secondsRemaining <= 20 ? '#D97706' : '#0066FF'),
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: '10px',
              background: isPaymentConfirmed ? '#D1FAE5' : (secondsRemaining <= 10 ? '#FEE2E2' : secondsRemaining <= 20 ? '#FEF3C7' : '#EFF6FF'),
              transition: 'all 0.25s ease'
            }}>
              {isPaymentConfirmed ? <CheckCircle2 size={16} /> : <Clock size={16} />}
              <span>{isPaymentConfirmed ? 'PAID' : isExpired ? 'Expired' : `${secondsRemaining}s remaining`}</span>
            </div>
          </div>

          {/* Live Auto-Detection Status Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.82rem',
            color: isPaymentConfirmed ? '#059669' : '#0284C7',
            fontWeight: 700,
            background: isPaymentConfirmed ? '#ECFDF5' : '#F0F9FF',
            border: isPaymentConfirmed ? '1px solid #A7F3D0' : '1px solid #BAE6FD',
            padding: '6px 14px',
            borderRadius: '9999px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isPaymentConfirmed ? '#10B981' : '#0284C7',
              boxShadow: isPaymentConfirmed ? '0 0 10px #10B981' : '0 0 8px #0284C7'
            }} />
            <span>
              {isPaymentConfirmed
                ? '⚡ Payment Detected! Dispensing items immediately...'
                : '🟢 Auto-Detection Active: Listening for live UPI credit...'}
            </span>
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
              background: isPaymentConfirmed ? '#10B981' : '#0066FF',
              border: 'none',
              borderRadius: '14px',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: isPaymentConfirmed ? '0 4px 14px rgba(16, 185, 129, 0.4)' : '0 4px 14px rgba(0, 102, 255, 0.3)',
              transition: 'background-color 0.3s ease'
            }}
          >
            {isPaymentConfirmed ? (
              <>
                <CheckCircle2 size={20} />
                <span>Payment Verified! Dispensing...</span>
              </>
            ) : isProcessingPayment ? (
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
