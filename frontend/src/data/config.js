// Capa de compatibilidad sobre la entidad PRODUCT (data/product.js).
// Los montos están en CÉNTIMOS enteros; formatMoney hace la conversión.
// Ver sitio/CONTENIDO.md para la guía de edición.
import { PRODUCT } from './product';

export const PRICE = PRODUCT.priceCents;
export const OLD_PRICE = PRODUCT.oldPriceCents;
export const STOCK = PRODUCT.stock;
export const RATING = PRODUCT.rating;
export const REVIEW_COUNT = PRODUCT.reviewCount;

// Derivados del precio — nunca escribirlos a mano en componentes.
export const SAVINGS = OLD_PRICE - PRICE;
export const DISCOUNT_PCT = Math.round((1 - PRICE / OLD_PRICE) * 100);

export function formatMoney(cents) {
  return (
    'S/ ' +
    (cents / 100).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

// Monto sin decimales para badges compactos (ej. "Ahorras S/ 1,880").
export function formatMoneyRound(cents) {
  return 'S/ ' + Math.floor(cents / 100).toLocaleString('es-PE');
}
