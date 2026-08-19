"""Router de batch-001 — aplicación al Founding Batch #001 (Camino B: FastAPI + Supabase).

POST /api/v1/batch-001 persiste la aplicación. Anti-abuso básico: honeypot + rate-limit por IP.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request, status

from app.core.ratelimit import allow
from app.domain.models import BatchApplication, BatchApplicationCreate
from app.repositories.batch001_repository import BatchApplicationRepository
from app.services.batch001_service import BatchApplicationService

router = APIRouter(prefix="/batch-001", tags=["batch-001"])
_service = BatchApplicationService(BatchApplicationRepository())


@router.post("", response_model=BatchApplication, status_code=status.HTTP_201_CREATED)
async def create_batch_application(payload: BatchApplicationCreate, request: Request) -> BatchApplication:
    # Honeypot: si el campo trampa viene lleno, es un bot → fingimos éxito sin guardar.
    if payload.website:
        return BatchApplication(
            id=0, created_at=datetime.now(timezone.utc), full_name=payload.full_name, email=payload.email
        )

    ip = request.client.host if request.client else "unknown"
    if not allow(ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Demasiadas solicitudes. Intenta de nuevo en un momento.",
        )

    return await _service.register(payload)
