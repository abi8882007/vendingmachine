import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, Wrench } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function Header({
  isOnline,
  hardwareStatus,
  onOpenAdmin
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) sounds.playTap();
  };

  const handleToggleFullscreen = () => {
    sounds.playTap();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Format: 02:34 PM
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Format: Mon, 22 Sep 2025
  const formattedDate = currentTime.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="snackspot-header">
      {/* 1. Left Brand Section: SNACK SPOT + Vending Machine Icon */}
      <div className="snackspot-brand">
        {/* Vending Machine Vector Graphic */}
        <div className="vending-icon-wrapper">
          <svg width="44" height="48" viewBox="0 0 44 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="40" height="44" rx="8" stroke="#0066FF" strokeWidth="2.5" fill="#FFFFFF"/>
            {/* Display Window */}
            <rect x="7" y="7" width="20" height="24" rx="4" stroke="#0066FF" strokeWidth="2" fill="#EBF4FF"/>
            {/* Shelves & Items */}
            <line x1="8" y1="14" x2="26" y2="14" stroke="#0066FF" strokeWidth="1.5"/>
            <rect x="10" y="9" width="4" height="4" rx="1" fill="#0066FF"/>
            <rect x="16" y="9" width="4" height="4" rx="1" fill="#0066FF"/>
            <rect x="22" y="9" width="3" height="4" rx="1" fill="#0066FF"/>
            <line x1="8" y1="22" x2="26" y2="22" stroke="#0066FF" strokeWidth="1.5"/>
            <rect x="10" y="16" width="4" height="5" rx="1" fill="#0066FF"/>
            <rect x="16" y="16" width="4" height="5" rx="1" fill="#0066FF"/>
            <rect x="22" y="16" width="3" height="5" rx="1" fill="#0066FF"/>
            {/* Keypad & Coin Slot */}
            <rect x="31" y="9" width="6" height="3" rx="1" fill="#0066FF"/>
            <rect x="31" y="15" width="6" height="8" rx="1.5" stroke="#0066FF" strokeWidth="1.5" fill="#FFFFFF"/>
            <circle cx="33" cy="18" r="0.8" fill="#0066FF"/>
            <circle cx="35" cy="18" r="0.8" fill="#0066FF"/>
            <circle cx="33" cy="20.5" r="0.8" fill="#0066FF"/>
            <circle cx="35" cy="20.5" r="0.8" fill="#0066FF"/>
            {/* Drop Delivery Chute */}
            <rect x="7" y="34" width="30" height="8" rx="3" stroke="#0066FF" strokeWidth="2" fill="#D0E4FF"/>
          </svg>
        </div>

        {/* Text Logo with Sparkles */}
        <div className="brand-text-block">
          <div className="brand-title-wrap">
            <span className="brand-word-snack">SNACK</span>
            <span className="brand-word-spot">SPOT</span>
            {/* Sparkle burst icon */}
            <svg className="sparkle-burst" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L10.8 7.5L16 5.5L12.5 10L17.5 11.5L12 13L13.5 18L9.5 14.5L7 19L7 13.5L2 14L5.5 10L1 7L6.5 7.5L6 2L10 6.5L10 2Z" fill="#0066FF" opacity="0.85"/>
            </svg>
          </div>
          <div className="brand-tagline">
            GRAB &bull; SNACK &bull; ENJOY
          </div>
        </div>
      </div>

      {/* 2. Center Banner: "Good Snacks, Brighter Days" with Wave and Snack Art */}
      <div className="snackspot-center-banner">
        <div className="banner-content">
          <div className="banner-text">
            <div className="good-snacks">Good Snacks</div>
            <div className="brighter-days">
              <span>Brighter Days</span>
              {/* Blue smiling curved stroke */}
              <svg width="60" height="12" viewBox="0 0 60 12" fill="none" className="smile-arc">
                <path d="M 4 2 Q 30 14 56 2" stroke="#0066FF" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Floating snack illustrations on the right of banner */}
          <div className="banner-snacks-graphics">
            {/* Lay's Yellow Chip Bag */}
            <img
              src="/assets/products/lays-classic.svg"
              alt="Lays"
              className="banner-floating-item lays-float"
            />
            {/* KitKat Chocolate */}
            <img
              src="/assets/products/kitkat.svg"
              alt="KitKat"
              className="banner-floating-item kitkat-float"
            />
            {/* Coca-Cola Can */}
            <img
              src="/assets/products/coke.svg"
              alt="Coke"
              className="banner-floating-item coke-float"
            />
            {/* Popcorn / Chip kernels */}
            <div className="crisp-flake flake-1">&#127871;</div>
            <div className="crisp-flake flake-2">&#10024;</div>
          </div>
        </div>
      </div>

      {/* 3. Right Status & Clock Section */}
      <div className="snackspot-header-right">
        {/* Digital Clock matching image */}
        <div className="snackspot-clock-display">
          <div className="clock-time">{formattedTime}</div>
          <div className="clock-date">{formattedDate}</div>
        </div>

        {/* Discreet Operator / Audio Controls */}
        <div className="header-utility-actions">
          <button
            className="mini-icon-btn touch-btn"
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={17} color="#EF4444" /> : <Volume2 size={17} color="#0066FF" />}
          </button>

          <button
            className="mini-icon-btn touch-btn"
            onClick={handleToggleFullscreen}
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={17} color="#64748B" /> : <Maximize2 size={17} color="#64748B" />}
          </button>

          <button
            className="mini-icon-btn touch-btn"
            onClick={() => { sounds.playTap(); onOpenAdmin(); }}
            title="Operator Panel"
          >
            <Wrench size={17} color="#64748B" />
          </button>
        </div>
      </div>
    </header>
  );
}
