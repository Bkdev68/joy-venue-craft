import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimeoutOptions {
  timeout: number; // in milliseconds
  onIdle: () => void;
  enabled?: boolean;
}

export function useIdleTimeout({ timeout, onIdle, enabled = true }: UseIdleTimeoutOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onIdleRef = useRef(onIdle);

  // Keep onIdle ref updated
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const resetTimer = useCallback(() => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onIdleRef.current();
    }, timeout);
  }, [timeout, enabled]);

  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetTimer();
    };

    // Start the timer
    resetTimer();

    // Listen to activity events
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, resetTimer]);

  return { resetTimer };
}

