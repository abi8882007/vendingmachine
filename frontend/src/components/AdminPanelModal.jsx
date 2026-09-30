import React, { useState, useEffect } from 'react';
import { X, RefreshCw, AlertTriangle, ShieldCheck, Database, Cpu, Wrench } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function AdminPanelModal({
  onClose,
  onCatalogRefresh
}) {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [selectedSlotForJam, setSelectedSlotForJam] = useState('7');

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/system/health');
      const data = await res.json();
      if (data.success) {
        setHealthData(data);
      }
    } catch (err) {
      console.error('Failed to fetch system health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleRestockAll = async () => {
    sounds.playTap();
    try {
      const res = await fetch('/api/system/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 12 })
      });
      const data = await res.json();
      setActionMessage(data.message || 'Restocked successfully');
      fetchHealth();
      if (onCatalogRefresh) onCatalogRefresh();
    } catch (err) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  const handleToggleJam = async () => {
    sounds.playTap();
    try {
      const res = await fetch('/api/system/simulate-jam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_id: selectedSlotForJam })
      });
      const data = await res.json();
      setActionMessage(data.message);
      fetchHealth();
    } catch (err) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="kiosk-modal-backdrop" onClick={onClose}>
      <div
        className="kiosk-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wrench size={24} color="#10B981" />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                Kiosk Maintenance & Hardware Diagnostics
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                Operator Service Mode (Slot 1–32)
              </p>
            </div>
          </div>

          <button
            className="stepper-btn touch-btn"
            onClick={onClose}
            style={{ width: '44px', height: '44px' }}
          >
            <X size={20} color="#64748B" />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {actionMessage && (
            <div style={{
              background: '#ECFDF5',
              border: '1px solid #10B981',
              color: '#059669',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: 700
            }}>
              {actionMessage}
            </div>
          )}

          {/* Diagnostics Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {/* Database Card */}
            <div style={{
              background: '#F8FAFC',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#0284C7' }}>
                <Database size={18} />
                <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>SQLite Database</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>Engine: <strong>{healthData?.database?.engine || 'WAL Enabled'}</strong></div>
                <div>Configured Slots: <strong>{healthData?.database?.totalSlots || 32}</strong></div>
                <div>Empty Slots: <strong style={{ color: '#DC2626' }}>{healthData?.database?.emptyCount || 0}</strong></div>
                <div>Low Stock (&le; 2): <strong style={{ color: '#D97706' }}>{healthData?.database?.lowStockCount || 0}</strong></div>
              </div>
            </div>

            {/* Hardware Serial Bridge Card */}
            <div style={{
              background: '#F8FAFC',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#059669' }}>
                <Cpu size={18} />
                <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>ESP32 Serial Bridge</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>Mode: <strong>{healthData?.hardware?.isMock ? 'Mock Hardware Emulator' : 'Physical ESP32 COM'}</strong></div>
                <div>Port: <strong>{healthData?.hardware?.activePort || 'None'}</strong></div>
                <div>Queue Depth: <strong>{healthData?.hardware?.queueLength || 0} batches</strong></div>
                <div>Baud Rate: <strong>{healthData?.hardware?.baudRate || 115200} bps</strong></div>
              </div>
            </div>
          </div>

          {/* Quick Operator Actions */}
          <div style={{
            background: '#F8FAFC',
            padding: '18px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
              Maintenance Actions
            </h4>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="touch-btn"
                onClick={handleRestockAll}
                style={{
                  flex: 1,
                  minHeight: '52px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                }}
              >
                <RefreshCw size={18} />
                <span>Restock All 32 Slots to 12</span>
              </button>

              <button
                className="touch-btn"
                onClick={fetchHealth}
                style={{
                  minHeight: '52px',
                  padding: '0 20px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: 'var(--radius-md)',
                  color: '#0F172A',
                  fontWeight: 700
                }}
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Testing / Simulation Control */}
          <div style={{
            background: '#FFFBEB',
            border: '1.5px dashed #F59E0B',
            padding: '18px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706', fontWeight: 700 }}>
              <AlertTriangle size={18} />
              <span>Hardware Jam Error Simulation</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
              Test how the kiosk handles a physical motor jam / drop sensor timeout on an active slot.
            </p>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                value={selectedSlotForJam}
                onChange={(e) => setSelectedSlotForJam(e.target.value)}
                style={{
                  minHeight: '48px',
                  padding: '0 16px',
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: 'var(--radius-sm)',
                  color: '#0F172A',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600
                }}
              >
                {Array.from({ length: 32 }, (_, i) => i + 1).map((s) => (
                  <option key={s} value={s}>Slot #{String(s).padStart(2, '0')}</option>
                ))}
              </select>

              <button
                className="touch-btn"
                onClick={handleToggleJam}
                style={{
                  flex: 1,
                  minHeight: '48px',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  boxShadow: '0 3px 10px rgba(245, 158, 11, 0.25)'
                }}
              >
                Simulate Jam on Slot #{selectedSlotForJam}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
