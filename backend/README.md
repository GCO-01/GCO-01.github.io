# VAGGO — Backend

Scaffold de la API en **FastAPI** siguiendo Clean Architecture. **Aún sin lógica
de negocio**: los endpoints y repositorios son stubs listos para implementar.

## Estructura

```
app/
├── main.py            # FastAPI app + /health + router de leads
├── api/v1/leads.py    # POST /api/v1/leads (stub 501) — futuro lead-capture de la calculadora
├── services/          # casos de uso (LeadService)
├── repositories/      # contrato Repository + stub de persistencia
├── domain/models.py   # entidades (Lead)
└── core/config.py     # settings (env vars)
deploy/                # infra Docker/nginx que sirve el frontend (ver deploy/README no aplica)
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

El frontend (`../frontend`) captura nombre + email en la calculadora de proteína
pero hoy no los envía a ningún lado. El endpoint `POST /api/v1/leads` es el punto
de integración previsto para persistir ese lead cuando se implemente.
