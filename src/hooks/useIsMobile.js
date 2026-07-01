import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint = 768) {
  const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
  const [isMobile, setIsMobile] = useState(mq.matches);
  useEffect(() => {
    const handler = e => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}
