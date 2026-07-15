import { useState, useEffect, useRef } from 'react';

export function useIntersection(options = { threshold: 0 }) {
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  // Las options solo se leen al montar; cambiarlas después no re-observa.
  const optionsRef = useRef(options);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => setIsIntersecting(e.isIntersecting),
      optionsRef.current
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, isIntersecting];
}
