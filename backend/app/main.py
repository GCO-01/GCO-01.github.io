"""Punto de entrada de la API VAGGO.

Clean Architecture: api -> services -> repositories -> domain.
Expone /health y POST /api/v1/leads (captura de la calculadora, persistido en Supabase).
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import batch001, leads
from app.core.config import settings
from app.core.db import close_pool, init_pool


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_pool()
    yield
    await close_pool()


app = FastAPI(title=settings.app_name, version=settings.version, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
    allow_credentials=False,
)

app.include_router(leads.router, prefix="/api/v1")
app.include_router(batch001.router, prefix="/api/v1")


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    """Liveness check."""
    return {"status": "ok"}
