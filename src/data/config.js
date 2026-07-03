export const PRICE = 2299;
export const OLD_PRICE = 4179.99;
export const STOCK = 12;
export const RATING = 4.9;
export const REVIEW_COUNT = 237;
export const TIMER_DURATION_S = 23 * 3600 + 47 * 60 + 12;

export function formatMoney(n) {
  return 'S/ ' + n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const NAV_LINKS = [
  { label: 'Tienda',      href: '/#product-section' },
  { label: 'Calculadora', href: '/calculadora' },
];
