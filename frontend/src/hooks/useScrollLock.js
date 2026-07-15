import { useEffect } from 'react';

// Bloquea el scroll del body mientras un overlay (drawer/modal) está abierto.
export function useScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLocked]);
}
