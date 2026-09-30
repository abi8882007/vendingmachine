import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useInactivityTimer:
 * Monitors kiosk touchscreen touch events and runs a 45-second countdown.
 * Resets whenever the screen is touched.
 * Calls onTimeout when the timer reaches 0.
 */
export function useInactivityTimer({
  timeoutSeconds = 45,
  isActive = true,
  onTimeout
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(timeoutSeconds);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    setSecondsRemaining(timeoutSeconds);
  }, [timeoutSeconds]);

  useEffect(() => {
    if (!isActive) return;

    // Listen to all touch and interaction events across the entire window
    const events = ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown', 'click'];
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((evt) => {
      window.addEventListener(evt, handleActivity, { passive: true });
    });

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (onTimeout) onTimeout();
          return timeoutSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleActivity);
      });
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeoutSeconds, onTimeout, resetTimer]);

  return { secondsRemaining, resetTimer };
}
