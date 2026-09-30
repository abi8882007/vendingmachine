import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function DispenseModal({
  orderData,
  dispenseEvent,
  onDispenseComplete
}) {
  const { transactionId, items = [] } = orderData;
  const [activeSlotId, setActiveSlotId] = useState(null);
  const [activeState, setActiveState] = useState('ROTATING'); // 'ROTATING', 'DROPPING', 'DROPPED', 'JAMMED'
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [totalStepsCount, setTotalStepsCount] = useState(items.reduce((acc, it) => acc + it.quantity, 0));
  const [completedSteps, setCompletedSteps] = useState([]);

  // Flatten items for step-by-step progress tracking
  const allUnits = [];
  items.forEach((item) => {
    for (let i = 0; i < item.quantity; i++) {
      allUnits.push({
        slotId: item.slot_id || item.slotId,
        productName: item.product_name || item.productName,
        price: item.price || item.unitPrice,
        unitIndex: i + 1,
        totalInGroup: item.quantity
      });
    }
  });

  // Listen to WebSocket hardware dispense updates
  useEffect(() => {
    if (!dispenseEvent) return;

    if (dispenseEvent.type === 'DISPENSING_PROGRESS') {
      const { slotId, state, step, total } = dispenseEvent.payload;
      setActiveSlotId(slotId);
      setActiveState(state || 'ROTATING');
      if (step) setCurrentStepIndex(step);
      if (total) setTotalStepsCount(total);

      if (state === 'ROTATING') {
        sounds.playCoilMotor();
      } else if (state === 'DROPPED') {
        sounds.playDropThump();
      }
    } else if (dispenseEvent.type === 'DISPENSE_STEP_COMPLETE') {
      const { slotId, stepIndex, success } = dispenseEvent.payload;
      setCompletedSteps((prev) => [...prev, { slotId, stepIndex, success }]);
    } else if (dispenseEvent.type === 'DISPENSE_COMPLETE') {
      sounds.playPaymentSuccess();
      setTimeout(() => {
        onDispenseComplete();
      }, 1200);
    }
  }, [dispenseEvent, onDispenseComplete]);

  // Fallback initial slot
  const currentUnit = allUnits[currentStepIndex - 1] || allUnits[0] || {};

  return (
    <div
      className="kiosk-modal-backdrop"
      style={{
        zIndex: 200,
        touchAction: 'none',
        pointerEvents: 'all',
        cursor: 'wait'
      }}
    >
      <div
        className="kiosk-modal-card"
        style={{
          maxWidth: '560px',
          textAlign: 'center',
          border: '2px solid #10B981',
          boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)'
        }}
      >
        {/* Header Alert Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: '#FFFFFF',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <ShieldCheck size={24} />
          <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.5px' }}>
            DISPENSING IN PROGRESS — PLEASE WAIT
          </span>
        </div>

        {/* Coil Rotation Visualizer */}
        <div className="coil-animation-container">
          <div style={{
            position: 'relative',
            width: '180px',
            height: '180px',
            margin: '0 auto 16px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Outer Spiral Gear Track */}
            <svg
              className={`spiral-coil ${activeState === 'ROTATING' ? 'rotating' : ''}`}
              viewBox="0 0 100 100"
              width="160"
              height="160"
            >
              <circle cx="50" cy="50" r="44" stroke="#E2E8F0" strokeWidth="6" fill="none" />
              {/* Spiral Spring Geometry */}
              <path
                d="M 50 10 A 40 40 0 0 1 85 70 A 30 30 0 0 1 30 75 A 20 20 0 0 1 50 35 A 10 10 0 0 1 55 52"
                stroke="#10B981"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="50" cy="10" r="5" fill="#10B981" />
            </svg>

            {/* Center Product Icon / Drop Beam State */}
            <div style={{
              position: 'absolute',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '2px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: activeState === 'DROPPED' ? '0 0 20px rgba(16, 185, 129, 0.4)' : '0 2px 10px rgba(0, 0, 0, 0.05)'
            }}>
              {activeState === 'DROPPED' ? (
                <CheckCircle2 size={40} color="#10B981" />
              ) : activeState === 'JAMMED' ? (
                <AlertTriangle size={40} color="#EF4444" />
              ) : (
                <Loader2 size={36} color="#0284C7" className="animate-spin" />
              )}
            </div>
          </div>

          {/* Current Step Description */}
          <div style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: '#0F172A',
            marginTop: '8px'
          }}>
            Dispensing Slot #{String(currentUnit.slotId || activeSlotId || 1).padStart(2, '0')}
          </div>

          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0284C7', marginTop: '4px' }}>
            {currentUnit.productName}
          </div>

          {/* Sensor Status Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: activeState === 'DROPPED' ? '#ECFDF5' : '#FFFBEB',
            border: activeState === 'DROPPED' ? '1px solid #A7F3D0' : '1px solid #FDE68A',
            padding: '6px 16px',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: activeState === 'DROPPED' ? '#059669' : '#D97706',
            marginTop: '12px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: activeState === 'DROPPED' ? '#10B981' : '#F59E0B'
            }} />
            <span>
              {activeState === 'ROTATING' && '12V Spiral Motor Engaged...'}
              {activeState === 'DROPPING' && 'Item Falling Past IR Beam...'}
              {activeState === 'DROPPED' && 'Drop Sensor Confirmed Item in Tray!'}
              {activeState === 'JAMMED' && 'Motor Jam Detected. Safe Cooldown.'}
            </span>
          </div>

          {/* Multi-Item Dispensing Step Progress */}
          <div style={{
            width: '100%',
            maxWidth: '460px',
            background: '#F8FAFC',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            marginTop: '20px',
            border: '1px solid #E2E8F0',
            textAlign: 'left'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#64748B',
              marginBottom: '10px'
            }}>
              <span>Dispense Progress</span>
              <span>Unit {currentStepIndex} of {totalStepsCount}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {allUnits.map((u, idx) => {
                const isDone = idx < currentStepIndex - 1 || (idx === currentStepIndex - 1 && activeState === 'DROPPED');
                const isCurrent = idx === currentStepIndex - 1 && activeState !== 'DROPPED';

                return (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.9rem',
                    color: isDone ? '#059669' : isCurrent ? '#0F172A' : '#94A3B8',
                    fontWeight: isCurrent ? 700 : 500
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isDone ? (
                        <CheckCircle2 size={16} color="#10B981" />
                      ) : isCurrent ? (
                        <Loader2 size={16} color="#0284C7" className="animate-spin" />
                      ) : (
                        <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1.5px solid #CBD5E1', display: 'inline-block' }} />
                      )}
                      <span>Slot #{String(u.slotId).padStart(2, '0')}: {u.productName}</span>
                    </span>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {isDone ? 'READY' : isCurrent ? 'DISPENSING' : 'QUEUED'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginTop: '16px' }}>
            Touch inputs locked during motor rotation for hardware safety.
          </div>
        </div>
      </div>
    </div>
  );
}
