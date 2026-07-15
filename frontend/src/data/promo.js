// ─── Promociones y urgencia ──────────────────────────────────────────
// ⚠️ AVISO LEGAL (Indecopi, D.L. 1044 / Código de Protección al Consumidor):
// los precios tachados, descuentos, contadores de stock y timers deben
// reflejar ofertas REALES y verificables. Publicidad con urgencia ficticia
// (timer que se reinicia por visitante, stock inventado, % de descuento
// sin precio anterior real) es sancionable y daña la confianza.
// Estos valores están centralizados aquí para que el negocio los mantenga
// verdaderos y actualizados.

export const ANNOUNCEMENT =
  '⚡ Early Access — 50% de descuento en primera compra · Envío gratis a Lima Metropolitana · Solo 12 unidades';

export const DISCOUNT_CODE = 'SHAKE50';

// Duración del timer de oferta (hoy: 23h 47m 12s desde la primera visita).
export const TIMER_DURATION_S = 23 * 3600 + 47 * 60 + 12;

export const URGENCY_NOTE = '⚡ Solo quedan {stock} unidades · Early Access · Envío gratis a Lima';
export const URGENCY_NOTE_MOBILE = '⚡ Solo quedan {stock} unidades — Early Access';

// Reemplaza {stock} por el stock real (data/config.js → STOCK).
export function withStock(template, stock) {
  return template.replace('{stock}', stock);
}
