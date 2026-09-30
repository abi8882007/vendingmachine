import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CatalogGrid from './components/CatalogGrid';
import CartSidebar from './components/CartSidebar';
import NumberPadModal from './components/NumberPadModal';
import PaymentModal from './components/PaymentModal';
import DispenseModal from './components/DispenseModal';
import OrderCompleteModal from './components/OrderCompleteModal';
import AdminPanelModal from './components/AdminPanelModal';
import { useWebSocket } from './hooks/useWebSocket';
import { useInactivityTimer } from './hooks/useInactivityTimer';
import { sounds } from './utils/soundEffects';
import { FALLBACK_SLOTS } from './utils/fallbackCatalog';

export default function App() {
  const [slots, setSlots] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // 'NUMPAD' | 'PAYMENT' | 'DISPENSING' | 'ORDER_COMPLETE' | 'ADMIN'
  const [numpadItem, setNumpadItem] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [dispenseEvent, setDispenseEvent] = useState(null);

  // Real-time WebSocket connection
  const { isConnected, lastMessage, hardwareStatus } = useWebSocket();

  // Fetch 32 Slots Catalog
  const fetchCatalog = useCallback(async () => {
    try {
      const res = await fetch('/api/catalog');
      const data = await res.json();
      if (data.success && data.slots) {
        setSlots(data.slots);
      } else {
        setSlots(FALLBACK_SLOTS);
      }
    } catch (err) {
      console.warn('Backend API unreachable, using standalone kiosk catalog:', err);
      setSlots(FALLBACK_SLOTS);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Handle Inactivity Timer (45-second touch idle reset for cart on main screen)
  const handleInactivityReset = useCallback(() => {
    if (cartItems.length > 0) {
      console.log('[Kiosk] 45s Inactivity reached. Auto-resetting cart.');
      setCartItems([]);
    }
  }, [cartItems.length]);

  useInactivityTimer({
    timeoutSeconds: 45,
    isActive: activeModal === null && cartItems.length > 0,
    onTimeout: handleInactivityReset
  });

  // Handle Real-Time WebSocket Events
  useEffect(() => {
    if (!lastMessage) return;

    const { type, payload } = lastMessage;

    if (type === 'SLOT_UPDATED' && payload?.slot) {
      setSlots((prev) =>
        prev.map((s) => (s.slot_id === payload.slot.slot_id ? payload.slot : s))
      );
      // Synchronize cart item stock limits if currently in cart
      setCartItems((prev) =>
        prev.map((it) =>
          it.slot_id === payload.slot.slot_id
            ? { ...it, stock_qty: payload.slot.stock_qty, quantity: Math.min(it.quantity, payload.slot.stock_qty) }
            : it
        ).filter((it) => it.quantity > 0)
      );
    } else if (type === 'CATALOG_RESTOCKED') {
      fetchCatalog();
    } else if (
      type === 'DISPENSING_PROGRESS' ||
      type === 'DISPENSE_STEP_COMPLETE' ||
      type === 'DISPENSE_COMPLETE'
    ) {
      setDispenseEvent(lastMessage);
    }
  }, [lastMessage, fetchCatalog]);

  // Cart Operations
  const handleAddToCart = (slot) => {
    setCartItems((prev) => {
      const existing = prev.find((it) => it.slot_id === slot.slot_id);
      if (existing) {
        if (existing.quantity >= slot.stock_qty) return prev;
        return prev.map((it) =>
          it.slot_id === slot.slot_id ? { ...it, quantity: it.quantity + 1 } : it
        );
      }
      return [
        ...prev,
        {
          slot_id: slot.slot_id,
          product_name: slot.product_name,
          price: slot.price,
          stock_qty: slot.stock_qty,
          image_url: slot.image_url,
          quantity: 1
        }
      ];
    });
  };

  const handleIncrement = (slotId) => {
    setCartItems((prev) =>
      prev.map((it) => {
        if (it.slot_id === slotId && it.quantity < it.stock_qty) {
          return { ...it, quantity: it.quantity + 1 };
        }
        return it;
      })
    );
  };

  const handleDecrement = (slotId) => {
    setCartItems((prev) =>
      prev
        .map((it) => {
          if (it.slot_id === slotId) {
            return { ...it, quantity: it.quantity - 1 };
          }
          return it;
        })
        .filter((it) => it.quantity > 0)
    );
  };

  const handleOpenNumpad = (item) => {
    setNumpadItem(item);
    setActiveModal('NUMPAD');
  };

  const handleConfirmNumpad = (slotId, newQuantity) => {
    setCartItems((prev) =>
      prev.map((it) => (it.slot_id === slotId ? { ...it, quantity: newQuantity } : it))
    );
    setActiveModal(null);
    setNumpadItem(null);
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Express 1-Click Direct Pay Action
  const handleDirectPay = async (slot) => {
    try {
      const res = await fetch('/api/order/direct-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_id: slot.slot_id })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentOrder(data);
        setActiveModal('PAYMENT');
      } else {
        alert(data.error || 'Failed to initiate direct payment');
      }
    } catch (err) {
      console.error('Direct-pay error:', err);
    }
  };

  // Standard Multi-Item Checkout Flow
  const handleProceedToCheckout = async () => {
    if (cartItems.length === 0) return;

    try {
      const itemsPayload = cartItems.map((it) => ({
        slot_id: it.slot_id,
        quantity: it.quantity
      }));

      const res = await fetch('/api/order/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsPayload })
      });

      const data = await res.json();
      if (data.success) {
        setCurrentOrder(data);
        setActiveModal('PAYMENT');
      } else {
        alert(data.error || 'Failed to create order');
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  // Payment Confirmation Transition
  const handlePaymentSuccess = useCallback((confirmedOrder) => {
    setActiveModal('DISPENSING');
  }, []);

  // Dispensing Complete Transition
  const handleDispenseComplete = useCallback(() => {
    setCartItems([]);
    setActiveModal('ORDER_COMPLETE');
    fetchCatalog();
  }, [fetchCatalog]);

  const handleClosePayment = useCallback(() => {
    setActiveModal(null);
    setCurrentOrder(null);
  }, []);

  const handleCloseNumpad = useCallback(() => {
    setActiveModal(null);
    setNumpadItem(null);
  }, []);

  const handleDismissOrderComplete = useCallback(() => {
    setActiveModal(null);
    setCurrentOrder(null);
  }, []);

  const handleCloseAdmin = useCallback(() => {
    setActiveModal(null);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Kiosk Header */}
      <Header
        isOnline={isConnected}
        hardwareStatus={hardwareStatus}
        onOpenAdmin={() => setActiveModal('ADMIN')}
      />

      {/* Split-View Layout (Catalog Left ~70%, Cart Right ~30%) */}
      <main className="kiosk-main-container">
        <CatalogGrid
          slots={slots}
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
        />

        <CartSidebar
          cartItems={cartItems}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onOpenNumpad={handleOpenNumpad}
          onClearCart={handleClearCart}
          onProceedToCheckout={handleProceedToCheckout}
        />
      </main>

      {/* On-Screen Touch Numpad Modal */}
      {activeModal === 'NUMPAD' && numpadItem && (
        <NumberPadModal
          item={numpadItem}
          onConfirm={handleConfirmNumpad}
          onClose={handleCloseNumpad}
        />
      )}

      {/* Payment Gateway & Dynamic QR Modal */}
      {activeModal === 'PAYMENT' && currentOrder && (
        <PaymentModal
          orderData={currentOrder}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={handleClosePayment}
        />
      )}

      {/* Hardware Dispensing Simulation / Live Progress Modal */}
      {activeModal === 'DISPENSING' && currentOrder && (
        <DispenseModal
          orderData={currentOrder}
          dispenseEvent={dispenseEvent}
          onDispenseComplete={handleDispenseComplete}
        />
      )}

      {/* Order Complete / Pick-Up Tray Callout */}
      {activeModal === 'ORDER_COMPLETE' && (
        <OrderCompleteModal
          onDismiss={handleDismissOrderComplete}
        />
      )}

      {/* Operator Diagnostics & Maintenance Modal */}
      {activeModal === 'ADMIN' && (
        <AdminPanelModal
          onClose={handleCloseAdmin}
          onCatalogRefresh={fetchCatalog}
        />
      )}
    </div>
  );
}
