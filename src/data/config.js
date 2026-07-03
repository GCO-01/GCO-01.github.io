// Precios y métricas del producto. Ver sitio/CONTENIDO.md para la guía de edición.
export const PRICE = 2299;
export const OLD_PRICE = 4179.99;
export const STOCK = 12;
export const RATING = 4.9;
export const REVIEW_COUNT = 237;

// Derivados del precio — nunca escribirlos a mano en componentes.
export const SAVINGS = OLD_PRICE - PRICE;
export const DISCOUNT_PCT = Math.round((1 - PRICE / OLD_PRICE) * 100);

export function formatMoney(n) {
  return 'S/ ' + n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Monto sin decimales para badges compactos (ej. "Ahorras S/ 1,880").
export function formatMoneyRound(n) {
  return 'S/ ' + Math.floor(n).toLocaleString('es-PE');
}
