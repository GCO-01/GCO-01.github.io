import { useMemo, useCallback, useSyncExternalStore } from 'react';

export function useIsMobile(breakpoint = 768) {
  const mq = useMemo(
    () => (typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${breakpoint}px)`) : null),
    [breakpoint]
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
