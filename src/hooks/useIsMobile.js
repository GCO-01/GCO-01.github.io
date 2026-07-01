import { useState, useEffect, useMemo } from 'react';

export function useIsMobile(breakpoint = 768) {
  const mq = useMemo(
    () => (typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${breakpoint}px)`) : null),
    [breakpoint]
  );

  const [isMobile, setIsMobile] = useState(() => mq?.matches ?? false);

  useEffect(() => {
    if (!mq) return;
    setIsMobile(mq.matches);
    const handler = e => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mq]);

  return isMobile;
}
