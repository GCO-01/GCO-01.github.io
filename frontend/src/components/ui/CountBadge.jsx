import styles from './CountBadge.module.css';

// Contador rojo del carrito. Mismo lenguaje visual en Header, FAB y
// carrusel; ajustes por contexto (color de borde, offset) vía className.
export function CountBadge({ count, className = '' }) {
  return (
    <span className={`${styles.badge} ${className}`} aria-hidden="true">
      {count}
    </span>
  );
}
