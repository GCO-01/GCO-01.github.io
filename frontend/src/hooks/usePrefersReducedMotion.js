import { useMemo, useCallback, useSyncExternalStore } from 'react';

// Detecta `prefers-reduced-motion: reduce` de forma reactiva y SSR-safe.
// Mismo patrón que useIsMobile (matchMedia + useSyncExternalStore).
export function usePrefersReducedMotion() {
  const mq = useMemo(
    () =>
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null,
    []
  );

  const subscribe = useCallback(
    (onChange) => {
      if (!mq) return () => {};
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    [mq]
  );

  return useSyncExternalStore(subscribe, () => mq?.matches ?? false, () => false);
}
