// Iconos SVG compartidos. Color vía `stroke` (default currentColor,
// se hereda del color CSS del contenedor) y tamaño vía `size`.

export const CartIcon = ({ size = 22, strokeWidth = 1.8, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

export const CloseIcon = ({ size = 20, strokeWidth = 2.2, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export const MenuIcon = ({ size = 20, strokeWidth = 2.2, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round">
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
);

export const TrashIcon = ({ size = 16, strokeWidth = 2, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

export const ArrowRightIcon = ({ size = 14, strokeWidth = 2.5, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
