import {useCallback, useEffect, useRef} from 'react';

export function useWakeLock() {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const externalSuspendRef = useRef(false);

  const releaseWakeLock = useCallback(async (markExternalSuspend = false) => {
    if (markExternalSuspend) {
      externalSuspendRef.current = true;
    }
    const sentinel = sentinelRef.current;
    sentinelRef.current = null;
    if (sentinel && !sentinel.released) {
      try {
        await sentinel.release();
      } catch {
        // Ignore release errors when browser already released the lock
      }
    }
  }, []);

  const acquireWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator) || !navigator.wakeLock) return;
    if (document.visibilityState !== 'visible') return;
    if (externalSuspendRef.current) return;
    if (sentinelRef.current && !sentinelRef.current.released) return;

    try {
      const sentinel = await navigator.wakeLock.request('screen');
      sentinelRef.current = sentinel;
      sentinel.addEventListener('release', () => {
        if (sentinelRef.current === sentinel) {
          sentinelRef.current = null;
        }
      });
    } catch {
      // Ignore Wake Lock denial (e.g., low battery mode or iframe permissions)
    }
  }, []);

  useEffect(() => {
    void acquireWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        externalSuspendRef.current = false;
        void acquireWakeLock();
      } else {
        void releaseWakeLock(false);
      }
    };

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        externalSuspendRef.current = false;
        void acquireWakeLock();
      }
    };

    const handleBlur = () => {
      void releaseWakeLock(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      void releaseWakeLock(false);
    };
  }, [acquireWakeLock, releaseWakeLock]);

  const releaseForExternalApp = useCallback(() => {
    void releaseWakeLock(true);
  }, [releaseWakeLock]);

  return {
    releaseForExternalApp,
  };
}
