# VAGGO — Supabase (Camino C, captura de leads)

La captura de leads de la calculadora corre como **Edge Function** (`functions/leads`),
que inserta en la tabla `leads` de Supabase. Sin hosting propio. El scaffold FastAPI
(`../backend`) queda como **destino de migración** si más adelante hace falta un backend
propio (reusa la misma tabla).

## Puesta en marcha

1. **Proyecto + tabla:** crear proyecto en [supabase.com](https://supabase.com) y correr
   [`../backend/db/schema.sql`](../backend/db/schema.sql) en el **SQL Editor** (crea `leads`).
2. **Supabase CLI:**
   ```bash
   npm i -g supabase
   supabase login
   supabase link --project-ref TU_PROJECT_REF
   ```
3. **Deploy de la función** (endpoint público, sin JWT — es un form del navegador):
   ```bash
   supabase functions deploy leads --no-verify-jwt
   ```
4. **Orígenes permitidos (CORS)** como secret de la función:
   ```bash
   supabase secrets set FRONTEND_ORIGINS="https://gco-01.github.io,http://localhost:5173"
   ```
   (`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` los inyecta Supabase automáticamente.)
5. **URL de la función:** `https://TU_PROJECT_REF.supabase.co/functions/v1/leads`

## Conectar el frontend

- Local: en `frontend/.env.local` →
  `VITE_LEADS_ENDPOINT=https://TU_PROJECT_REF.supabase.co/functions/v1/leads` y reiniciar `npm run dev`.
- Producción (GitHub Pages): agregar el secret de repo `VITE_LEADS_ENDPOINT` e inyectarlo
  en el step de build de `.github/workflows/deploy.yml`:
  ```yaml
  - run: npm run build
    working-directory: frontend
    env:
      VITE_LEADS_ENDPOINT: ${{ secrets.VITE_LEADS_ENDPOINT }}
  ```

## Probar

```bash
curl -X POST https://TU_PROJECT_REF.supabase.co/functions/v1/leads \
  -H 'Content-Type: application/json' \
  -d '{"name":"Prueba","email":"test@example.com","grams":125,"gap":65,"goal":"recomp"}'
# → 201 {"ok":true,"id":...} y fila nueva en la tabla leads
```

## Anti-abuso

Incluido: **CORS** (a `FRONTEND_ORIGINS`), **honeypot** (campo oculto `website`) y
**validación** (nombre + email). Pendiente/opcional: **rate-limit por IP** (vía Upstash
Redis o una columna `ip` + conteo de recientes) — se agrega cuando el volumen lo pida.

## Migración futura a FastAPI (Camino B)

El código FastAPI equivalente ya existe en `../backend` (mismo esquema, mismo contrato
`POST /api/v1/leads`). Migrar = desplegarlo (ver `../backend/SETUP.md`) y cambiar
`VITE_LEADS_ENDPOINT`. Nada más del frontend cambia.
