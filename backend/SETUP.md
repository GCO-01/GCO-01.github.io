# VAGGO Backend — Puesta en marcha (Camino B: FastAPI + Supabase + Cloud Run)

Captura de leads de la calculadora: el frontend hace `POST` a este backend FastAPI,
que persiste en un Postgres de **Supabase**. Hosting: **Google Cloud Run** (corre el
`Dockerfile`, escala a cero, despierta rápido). Mismo servicio servirá mañana los
webhooks/Admin API de **Shopify** sin re-armar infraestructura.

## 1. Supabase (base de datos)

1. Crear un proyecto en [supabase.com](https://supabase.com) (anota la password del proyecto).
2. **SQL Editor → New query** → pegar y correr el contenido de [`db/schema.sql`](db/schema.sql) (crea la tabla `leads` + índices).
3. **Settings → Database → Connection string → "Transaction pooler"** (puerto **6543**). Copiar la cadena y reemplazar `[PASSWORD]`. Se ve así:
   `postgresql://postgres.xxxx:[PASSWORD]@aws-0-<region>.pooler.supabase.com:6543/postgres`
   > Usar el **pooler** (no la conexión directa 5432): Cloud Run abre muchas conexiones. El código ya setea `statement_cache_size=0` (requerido por pgbouncer).

## 2. Probar local (opcional pero recomendado)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env      # pegar DATABASE_URL real en .env
uvicorn app.main:app --reload
# En otra terminal:
curl localhost:8000/health
curl -X POST localhost:8000/api/v1/leads -H 'Content-Type: application/json' \
  -d '{"name":"Prueba","email":"test@example.com","grams":125,"gap":65,"goal":"recomp","age":"under65"}'
# → 201 + fila nueva en la tabla leads de Supabase
```

## 3. Deploy a Cloud Run

Requiere cuenta GCP (con tarjeta; no cobra en free tier) y `gcloud` instalado.

```bash
gcloud auth login
gcloud config set project TU_PROYECTO_GCP

# Desde la carpeta backend/ (build + deploy en un paso, source-based):
gcloud run deploy vaggo-api \
  --source backend \
  --region us-east1 \
  --allow-unauthenticated \
  --set-env-vars "FRONTEND_ORIGINS=https://gco-01.github.io,http://localhost:5173,RATE_LIMIT_PER_MIN=20" \
  --set-secrets "DATABASE_URL=vaggo-db-url:latest"
```

Antes, guardar la connection string como **secret** (no como env var en texto):

```bash
printf 'postgresql://...pooler.supabase.com:6543/postgres' | \
  gcloud secrets create vaggo-db-url --data-file=-
# dar acceso al service account de Cloud Run al secret (una vez)
```

Cloud Run devuelve una URL tipo `https://vaggo-api-xxxx.a.run.app`. El endpoint de leads es esa URL + `/api/v1/leads`. Verificar: `curl https://vaggo-api-xxxx.a.run.app/health`.

## 4. Conectar el frontend

- **Local:** en `frontend/.env.local` →
  `VITE_LEADS_ENDPOINT=https://vaggo-api-xxxx.a.run.app/api/v1/leads` y reiniciar `npm run dev`.
- **Producción (GitHub Pages):** agregar el secret de repo `VITE_LEADS_ENDPOINT` y ajustar `.github/workflows/deploy.yml` para inyectarlo en el build:
  ```yaml
  - run: npm run build
    working-directory: frontend
    env:
      VITE_LEADS_ENDPOINT: ${{ secrets.VITE_LEADS_ENDPOINT }}
  ```

## 5. CSP (solo si sirves el frontend por Docker/nginx)

En GitHub Pages no hay CSP restrictiva, funciona directo. Si servís por
`backend/deploy/nginx.conf`, ampliar `connect-src` al dominio de la API:
`connect-src 'self' https://vaggo-api-xxxx.a.run.app;`

## Anti-abuso (básico, ya incluido)

- **CORS** limitado a `FRONTEND_ORIGINS`.
- **Rate-limit** por IP (`RATE_LIMIT_PER_MIN`, en memoria — aproximado con varias instancias).
- **Honeypot**: campo oculto `website`; si llega lleno, se descarta como bot. (El form del rediseño debe incluir ese input oculto.)

## Notas de esquema

`gender` y `age_range` (edad granular) ya existen en la tabla y el modelo como
**opcionales** — se llenarán cuando el rediseño del formulario los capture, sin
migración adicional. Hoy el frontend envía: `name, email, grams, gap, goal, age,
training, activity, client_ts`.
