import { useState, useEffect, useRef } from 'react';

export function useIntersection(options = { threshold: 0 }) {
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(true);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => setIsIntersecting(e.isIntersecting), options);
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, isIntersecting];
}
