// T1.8 — captura de leads. POST no bloqueante a la Supabase Edge Function
// (Camino C), que persiste en Postgres. La URL viene de una variable de build:
// VITE_LEADS_ENDPOINT (ej. https://<ref>.supabase.co/functions/v1/leads).
// El mismo contrato sirve para el backend FastAPI (Camino B) si se migra.
//
// Seguridad/CSP: la función habilita CORS al origen del frontend. Si el sitio se
// sirve por el nginx de backend/deploy, ampliar `connect-src` al dominio destino
// (en GitHub Pages no hay CSP restrictiva por defecto).
const ENDPOINT = import.meta.env.VITE_LEADS_ENDPOINT;

export function captureLead(payload) {
  if (!ENDPOINT) return; // sin endpoint configurado todavía: no-op seguro
  try {
    // No bloqueante (no await); keepalive para que sobreviva al cambio de fase.
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* nunca bloquear la UX por un fallo de captura */
  }
}
