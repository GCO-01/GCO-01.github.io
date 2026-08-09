// VAGGO — Captura de leads de la calculadora (Camino C: Supabase Edge Function).
// Recibe el POST del frontend (frontend/src/lib/leads.js) e inserta en la tabla
// `leads` (ver backend/db/schema.sql) usando el service_role key (privado, del
// lado servidor). SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los inyecta Supabase.
//
// Deploy: supabase functions deploy leads --no-verify-jwt   (endpoint público)
// Anti-abuso: CORS + honeypot + validación + rate-limit por IP + cap de tamaño.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED = (Deno.env.get("FRONTEND_ORIGINS") ?? "http://localhost:5173")
  .split(",").map((s) => s.trim());
const RATE_LIMIT = Number(Deno.env.get("RATE_LIMIT_PER_MIN") ?? "10"); // máx POST por IP/min
const WINDOW_MS = 60_000;
const MAX_BODY = 8 * 1024; // 8 KB: un lead legítimo pesa < 1 KB

function cors(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED.includes(origin) ? origin : ALLOWED[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  };
}
const json = (b: unknown, status: number, h: Record<string, string>) =>
  new Response(JSON.stringify(b), { status, headers: { ...h, "Content-Type": "application/json" } });

const strOrNull = (v: unknown) => (v == null ? null : String(v).slice(0, 200));
const intOrNull = (v: unknown) => (v == null || v === "" || isNaN(Number(v)) ? null : Math.trunc(Number(v)));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
}

// deno-lint-ignore no-explicit-any
async function rateAllow(supabase: any, ip: string): Promise<boolean> {
  // Contador compartido en Postgres (ver backend/db/rate_limit.sql). Fail-open:
  // si el limitador falla (o el SQL no está aplicado aún), dejamos pasar el lead.
  try {
    const { data, error } = await supabase.rpc("rate_limit_hit", {
      p_key: ip, p_max: RATE_LIMIT, p_window_secs: WINDOW_MS / 1000,
    });
    if (error) return true;
    return data === true;
  } catch {
    return true;
  }
}

Deno.serve(async (req) => {
  const h = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405, h);

  // Cap de tamaño (DoS por JSON gigante) antes de parsear.
  if (Number(req.headers.get("content-length") ?? "0") > MAX_BODY) {
    return json({ error: "payload too large" }, 413, h);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Rate-limit por IP (contador compartido en la DB).
  if (!(await rateAllow(supabase, clientIp(req)))) {
    return json({ error: "rate limited" }, 429, h);
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "invalid json" }, 400, h); }

  // Honeypot: campo trampa lleno → bot. Fingimos éxito sin guardar.
  if (body.website) return json({ ok: true }, 201, h);

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  if (name.length < 2 || !EMAIL_RE.test(email)) {
    return json({ error: "nombre o email inválido" }, 422, h);
  }

  const { error } = await supabase.from("leads").insert({
    name: name.slice(0, 120),
    email: email.slice(0, 200),
    grams: intOrNull(body.grams),
    gap: intOrNull(body.gap),
    goal: strOrNull(body.goal),
    age: strOrNull(body.age),
    training: strOrNull(body.training),
    activity: strOrNull(body.activity),
    gender: strOrNull(body.gender),
    age_range: strOrNull(body.age_range),
    client_ts: strOrNull(body.client_ts),
  });

  if (error) return json({ error: "db error" }, 500, h);
  return json({ ok: true }, 201, h); // sin id: no revelar el conteo de leads
});
