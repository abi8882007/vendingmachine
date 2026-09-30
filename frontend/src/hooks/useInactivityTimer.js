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
  const onTimeoutRef = useRef(onTimeout);
  const timerRef = useRef(null);
  const endTimeRef = useRef(Date.now() + timeoutSeconds * 1000);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const resetTimer = useCallback(() => {
    endTimeRef.current = Date.now() + timeoutSeconds * 1000;
    setSecondsRemaining(timeoutSeconds);
  }, [timeoutSeconds]);

  useEffect(() => {
    if (!isActive) return;

    resetTimer();

    // Listen to all touch and interaction events across the entire window
    const events = ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown', 'click'];
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((evt) => {
      window.addEventListener(evt, handleActivity, { passive: true });
    });

    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        onTimeoutRef.current?.();
        resetTimer();
      }
    }, 500);

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleActivity);
      });
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeoutSeconds, resetTimer]);

  return { secondsRemaining, resetTimer };
}
