import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function ProductCard({
  slot,
  cartQuantity = 0,
  onAddToCart,
  onIncrement,
  onDecrement
}) {
  const {
    slot_id,
    product_name,
    price,
    stock_qty,
    image_url,
    is_active
  } = slot;

  const isOutOfStock = stock_qty <= 0;
  const isJammedOrDisabled = is_active !== 1;
  const isAvailable = !isOutOfStock && !isJammedOrDisabled;
  const remainingStock = Math.max(0, stock_qty - cartQuantity);

  const handleIncrementClick = (e) => {
    e.stopPropagation();
    if (!isAvailable || remainingStock <= 0) return;

    sounds.playAddToCart();
    if (cartQuantity === 0) {
      onAddToCart(slot);
    } else {
      onIncrement(slot_id);
    }
  };

  const handleDecrementClick = (e) => {
    e.stopPropagation();
    if (cartQuantity <= 0) return;

    sounds.playTap();
    onDecrement(slot_id);
  };

  const handleCardTap = () => {
    if (!isAvailable || remainingStock <= 0) return;

    sounds.playAddToCart();
    if (cartQuantity === 0) {
      onAddToCart(slot);
    } else {
      onIncrement(slot_id);
    }
  };

  return (
    <div
      className={`snack-product-card touch-btn ${!isAvailable ? 'card-disabled' : ''}`}
      onClick={handleCardTap}
    >
      {/* Product Packaging Image */}
      <div className="product-image-container">
        <img
          src={image_url}
          alt={product_name}
          className="product-packaging-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/assets/products/coke.svg';
          }}
        />

        {/* Out of stock badge if zero stock */}
        {!isAvailable && (
          <div className="card-sold-out-badge">
            {isOutOfStock ? 'Sold Out' : 'Unavailable'}
          </div>
        )}
      </div>

      {/* Product Details (Title & Price) */}
      <div className="product-info-block">
        <h4 className="product-title" title={product_name}>
          {product_name}
        </h4>
        <div className="product-price-tag">
          ₹{price}
        </div>
      </div>

      {/* Stepper Bar at bottom: [-] [qty] [+] */}
      <div className="card-stepper-bar">
        <button
          type="button"
          className="card-stepper-minus touch-btn"
          disabled={cartQuantity <= 0}
          onClick={handleDecrementClick}
          aria-label="Decrease quantity"
        >
          <Minus size={15} strokeWidth={2.5} />
        </button>

        <span className="card-stepper-qty">
          {cartQuantity}
        </span>

        <button
          type="button"
          className="card-stepper-plus touch-btn"
          disabled={!isAvailable || remainingStock <= 0}
          onClick={handleIncrementClick}
          aria-label="Increase quantity"
        >
          <Plus size={16} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
