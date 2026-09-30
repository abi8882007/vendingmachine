import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function CartSidebar({
  cartItems,
  onIncrement,
  onDecrement,
  onClearCart,
  onProceedToCheckout
}) {
  const totalItemsCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);
  const totalAmount = cartItems.reduce((acc, it) => acc + it.price * it.quantity, 0);

  const handleClear = () => {
    sounds.playTap();
    onClearCart();
  };

  const handleCheckout = () => {
    sounds.playTap();
    onProceedToCheckout();
  };

  const handleRemoveItem = (slotId) => {
    sounds.playTap();
    // Decrement until 0 or remove
    const item = cartItems.find((it) => it.slot_id === slotId);
    if (item) {
      for (let i = 0; i < item.quantity; i++) {
        onDecrement(slotId);
      }
    }
  };

  return (
    <aside className="snackspot-cart-panel">
      {/* 1. Header: Shopping Cart Icon + Your Cart (N) + Clear All Button */}
      <div className="cart-panel-header">
        <div className="cart-header-title">
          <ShoppingCart size={24} color="#0066FF" strokeWidth={2.5} />
          <h3>Your Cart ({totalItemsCount})</h3>
        </div>

        {cartItems.length > 0 && (
          <button
            className="cart-clear-all-btn touch-btn"
            onClick={handleClear}
            title="Clear all items from cart"
          >
            <Trash2 size={15} color="#475569" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* 2. Scrollable Cart Items List */}
      <div className="cart-items-scroll-list">
        {cartItems.length === 0 ? (
          <div className="cart-empty-state">
            <div className="empty-cart-icon">
              <ShoppingCart size={40} color="#94A3B8" strokeWidth={1.5} />
            </div>
            <p className="empty-title">Your cart is empty</p>
            <p className="empty-subtitle">Select snacks on the left to add them to your cart</p>
          </div>
        ) : (
          cartItems.map((item) => {
            const itemSubtotal = item.price * item.quantity;
            const isAtMax = item.quantity >= item.stock_qty;

            return (
              <div key={item.slot_id} className="cart-item-row-card">
                {/* Product Thumbnail */}
                <div className="cart-item-img-box">
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/assets/products/coke.svg';
                    }}
                  />
                </div>

                {/* Middle Details: Name, Unit Price, Stepper */}
                <div className="cart-item-middle-info">
                  <div className="cart-item-name">{item.product_name}</div>
                  <div className="cart-item-unit-price">₹{item.price}</div>

                  {/* Inline Stepper: [-] [qty] [+] */}
                  <div className="cart-item-stepper">
                    <button
                      type="button"
                      className="cart-stepper-btn minus touch-btn"
                      onClick={() => { sounds.playTap(); onDecrement(item.slot_id); }}
                    >
                      <Minus size={13} strokeWidth={2.5} />
                    </button>

                    <span className="cart-stepper-number">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      className="cart-stepper-btn plus touch-btn"
                      disabled={isAtMax}
                      onClick={() => { sounds.playAddToCart(); onIncrement(item.slot_id); }}
                    >
                      <Plus size={13} strokeWidth={3} />
                    </button>
                  </div>
                </div>

                {/* Right Column: Red Trash Icon & Subtotal */}
                <div className="cart-item-right-col">
                  <button
                    className="cart-delete-item-btn touch-btn"
                    onClick={() => handleRemoveItem(item.slot_id)}
                    title="Remove item"
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </button>

                  <div className="cart-item-subtotal-price">
                    ₹{itemSubtotal}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Footer Section: Total Box, Pay Now (UPI-only), and Big Blue CTA */}
      <div className="cart-panel-footer">
        {/* Total Summary Row Container */}
        <div className="cart-total-summary-box">
          <span className="total-label">Total</span>
          <span className="total-value">₹{totalAmount}</span>
        </div>

        {/* Pay Now Section — Exclusively UPI per user requirement */}
        <div className="pay-now-section">
          <div className="pay-now-heading">Pay Now</div>

          <div className="payment-options-grid-upi-only">
            {/* Active Selected UPI Option */}
            <div className="upi-payment-card active-upi">
              {/* Official UPI Triangle Colors (Green and Orange) */}
              <svg width="34" height="24" viewBox="0 0 34 24" fill="none">
                <path d="M12 4L4 18H10L15 8L12 4Z" fill="#00833F" />
                <path d="M18 4L13 13L16 18L24 4H18Z" fill="#ED7026" />
                <path d="M22 18L26 11L28 15L25 18H22Z" fill="#00833F" />
              </svg>
              <span className="upi-text-label">UPI</span>
            </div>
          </div>
        </div>

        {/* Big Blue CTA: Pay ₹XXX → */}
        <button
          className="snackspot-checkout-btn touch-btn"
          disabled={cartItems.length === 0}
          onClick={handleCheckout}
        >
          <span>Pay ₹{totalAmount}</span>
          <ArrowRight size={22} strokeWidth={2.5} />
        </button>
      </div>
    </aside>
  );
}
