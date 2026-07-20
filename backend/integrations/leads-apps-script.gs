/**
 * VAGGO — Captura de leads de la calculadora (T1.8).
 * Google Apps Script vinculado a un Google Sheet: recibe el POST del frontend
 * (frontend/src/lib/leads.js) y agrega una fila por lead.
 *
 * El frontend envía JSON como text/plain con mode 'no-cors' → llega en
 * e.postData.contents. Payload: { name, email, grams, gap, goal, age, timestamp }.
 *
 * Deploy: Implementar → Nueva implementación → Aplicación web →
 *   Ejecutar como: Yo · Con acceso: Cualquiera. Copiar la URL /exec a
 *   VITE_LEADS_ENDPOINT en el frontend.
 *
 * Seguridad:
 *  - Anti-inyección de fórmulas (CSV/Sheets injection): todo texto que empiece con
 *    = + - @ o tab/CR se prefija con comilla simple para que la hoja NO lo ejecute.
 *  - Límite de longitud por campo para evitar payloads abusivos.
 *  - El endpoint es público por diseño (POST desde el navegador). No pongas aquí
 *    datos sensibles ni asumas que el emisor es confiable: validá/sanitizá siempre.
 */

var HEADERS = ['recibido_en', 'nombre', 'email', 'grams', 'gap', 'goal', 'age', 'ts_cliente'];
var MAX_LEN = 200; // longitud máxima por campo de texto

/** Neutraliza inyección de fórmulas y recorta longitud. */
function safeText(value) {
  var s = String(value == null ? '' : value).slice(0, MAX_LEN);
  if (/^[=+\-@\t\r]/.test(s)) {
    s = "'" + s; // fuerza a texto literal en Sheets
  }
  return s;
}

/** Convierte a número finito o devuelve '' (los numéricos no necesitan escaping). */
function safeNum(value) {
  var n = Number(value);
  return isFinite(n) ? n : '';
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // evita filas pisadas en envíos concurrentes
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Crea el encabezado la primera vez.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    sheet.appendRow([
      new Date(),               // recibido_en (hora del servidor)
      safeText(data.name),
      safeText(data.email),
      safeNum(data.grams),
      safeNum(data.gap),
      safeText(data.goal),
      safeText(data.age),
      safeText(data.timestamp), // ts_cliente
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/** Prueba manual desde el editor (Ejecutar → doGet) para confirmar acceso al Sheet. */
function doGet() {
  return ContentService.createTextOutput('VAGGO leads endpoint OK');
}
