import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { sounds } from '../utils/soundEffects';
import { LayoutGrid, Cookie } from 'lucide-react';

const CATEGORIES = [
  { id: 'All', label: 'All', icon: 'all' },
  { id: 'Chips', label: 'Chips', icon: 'chips' },
  { id: 'Chocolates', label: 'Chocolates', icon: 'chocolates' },
  { id: 'Biscuits', label: 'Biscuits', icon: 'biscuits' },
  { id: 'Drinks', label: 'Drinks', icon: 'drinks' }
];

export default function CatalogGrid({
  slots,
  cartItems,
  onAddToCart,
  onIncrement,
  onDecrement
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleSelectCategory = (catId) => {
    sounds.playTap();
    setSelectedCategory(catId);
  };

  const getCartQuantityForSlot = (slotId) => {
    const item = cartItems.find((it) => it.slot_id === slotId);
    return item ? item.quantity : 0;
  };

  const filteredSlots = slots.filter((slot) => {
    if (selectedCategory === 'All') return true;
    return slot.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Render Category Icon
  const renderCategoryIcon = (iconType, isActive) => {
    const strokeColor = isActive ? '#FFFFFF' : '#475569';

    if (iconType === 'all') {
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="2" y="2" width="3.5" height="3.5" rx="1" fill={strokeColor} />
          <rect x="7.25" y="2" width="3.5" height="3.5" rx="1" fill={strokeColor} />
          <rect x="12.5" y="2" width="3.5" height="3.5" rx="1" fill={strokeColor} />
          <rect x="2" y="7.25" width="3.5" height="3.5" rx="1" fill={strokeColor} />
          <rect x="7.25" y="7.25" width="3.5" height="3.5" rx="1" fill={strokeColor} />
          <rect x="12.5" y="7.25" width="3.5" height="3.5" rx="1" fill={strokeColor} />
          <rect x="2" y="12.5" width="3.5" height="3.5" rx="1" fill={strokeColor} />
          <rect x="7.25" y="12.5" width="3.5" height="3.5" rx="1" fill={strokeColor} />
          <rect x="12.5" y="12.5" width="3.5" height="3.5" rx="1" fill={strokeColor} />
        </svg>
      );
    }
    if (iconType === 'chips') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12l2 18H4L6 3z" />
          <path d="M10 10c1 1 3 1 4 0" />
        </svg>
      );
    }
    if (iconType === 'chocolates') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="15" y1="3" x2="15" y2="21" />
        </svg>
      );
    }
    if (iconType === 'biscuits') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <circle cx="9" cy="9" r="1" fill={strokeColor} />
          <circle cx="15" cy="9" r="1" fill={strokeColor} />
          <circle cx="12" cy="15" r="1" fill={strokeColor} />
          <circle cx="15" cy="15" r="1" fill={strokeColor} />
          <circle cx="9" cy="15" r="1" fill={strokeColor} />
        </svg>
      );
    }
    if (iconType === 'drinks') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2h8v4H8z" />
          <path d="M6 6h12v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6z" />
          <line x1="6" y1="11" x2="18" y2="11" />
        </svg>
      );
    }
    return <LayoutGrid size={18} color={strokeColor} />;
  };

  return (
    <div className="snackspot-catalog-section">
      {/* Category Filter Pills Bar */}
      <div className="snackspot-category-tabs">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              className={`category-tab-btn touch-btn ${isActive ? 'tab-active' : ''}`}
              onClick={() => handleSelectCategory(cat.id)}
            >
              {renderCategoryIcon(cat.icon, isActive)}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 6-Column Responsive Product Grid */}
      <div className="snackspot-products-grid-container">
        <div className="snackspot-6col-grid">
          {filteredSlots.map((slot) => (
            <ProductCard
              key={slot.slot_id}
              slot={slot}
              cartQuantity={getCartQuantityForSlot(slot.slot_id)}
              onAddToCart={onAddToCart}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
            />
          ))}
        </div>

        {filteredSlots.length === 0 && (
          <div className="no-products-view">
            <p>No products available in this category.</p>
            <button
              className="category-tab-btn tab-active touch-btn"
              onClick={() => setSelectedCategory('All')}
              style={{ marginTop: '12px' }}
            >
              Show All Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
