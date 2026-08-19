// Founding Batch #001 — envío no bloqueante del formulario de aplicación al
// backend FastAPI. Mismo contrato de fire-and-forget que leads.js (T1.8),
// pero apunta al backend propio en vez del webhook de leads.
// La URL viene de VITE_API_BASE_URL (ver .env.example). Sin esa variable,
// el envío es un no-op seguro (no rompe la UX ni bloquea el submit).
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENDPOINT = BASE_URL ? `${BASE_URL}/api/v1/batch-001` : null;

export function submitBatchApplication(payload) {
  if (!ENDPOINT) return; // sin endpoint configurado todavía: no-op seguro
  try {
    // No bloqueante (no await); keepalive para que sobreviva a la navegación.
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* nunca bloquear la UX por un fallo de envío */
  }
}
