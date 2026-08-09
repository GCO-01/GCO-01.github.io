# VAGGO — Backend

API en **FastAPI** (Clean Architecture) que captura los leads de la calculadora y
los persiste en **Supabase Postgres**. Hosting: **Google Cloud Run**.

> ⚠️ **Estado: archivado (no en uso).** La captura de leads corre hoy por una
> **Supabase Edge Function** (Camino C, ver [`../supabase/README.md`](../supabase/README.md)) —
> más simple, sin hosting. Este backend FastAPI es el **destino de migración** (Camino B)
> si se necesita un backend propio: mismo esquema (`db/schema.sql`) y mismo contrato
> `POST /api/v1/leads`. Migrar = desplegar (abajo) y cambiar `VITE_LEADS_ENDPOINT`.

👉 **Puesta en marcha (si/cuando se migre a FastAPI): [SETUP.md](SETUP.md)**

## Estructura

```
app/
├── main.py                # FastAPI + CORS + lifespan del pool + /health
├── api/v1/leads.py        # POST /api/v1/leads (honeypot + rate-limit)
├── services/lead_service  # caso de uso: registrar lead
├── repositories/          # Repository + LeadRepository (INSERT asyncpg)
├── domain/models.py       # LeadCreate / Lead
└── core/                  # config, db (pool asyncpg), ratelimit
db/schema.sql              # tabla leads (correr en Supabase)
deploy/                    # Docker/nginx que sirve el FRONTEND estático (no la API)
```

> Nota: `backend/deploy/` contiene la infraestructura Docker/nginx que hoy sirve
> al **frontend** estático. Se agrupó aquí por decisión de organización del repo.

## Desarrollo

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
uvicorn app.main:app --reload      # http://localhost:8000/health
```

## Contexto

El frontend (`../frontend`) captura nombre + email + datos de la calculadora en el
gate y los envía a `POST /api/v1/leads` (ver `frontend/src/lib/leads.js`). El backend
valida (Pydantic), aplica anti-abuso básico (CORS + rate-limit + honeypot) y persiste
en Supabase. `gender` y `age_range` quedan opcionales, listos para el rediseño del
formulario. A futuro, este mismo servicio alojará la integración con Shopify.
