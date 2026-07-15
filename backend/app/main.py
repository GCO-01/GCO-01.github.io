"""Punto de entrada de la API VAGGO (scaffold).

Clean Architecture: api -> services -> repositories -> domain.
Hoy solo expone /health y el router de leads (stub). Sin lógica de negocio.
"""

from fastapi import FastAPI

from app.api.v1 import leads
from app.core.config import settings

app = FastAPI(title=settings.app_name, version=settings.version)

app.include_router(leads.router, prefix="/api/v1")


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    """Liveness check."""
    return {"status": "ok"}
