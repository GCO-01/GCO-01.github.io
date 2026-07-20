"""Router de leads — captura de la calculadora (Camino B: FastAPI + Supabase).

POST /api/v1/leads persiste el lead. Anti-abuso básico: honeypot + rate-limit por IP.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request, status

from app.core.ratelimit import allow
from app.domain.models import Lead, LeadCreate
from app.repositories.lead_repository import LeadRepository
from app.services.lead_service import LeadService

router = APIRouter(prefix="/leads", tags=["leads"])
_service = LeadService(LeadRepository())


@router.post("", response_model=Lead, status_code=status.HTTP_201_CREATED)
async def create_lead(payload: LeadCreate, request: Request) -> Lead:
    # Honeypot: si el campo trampa viene lleno, es un bot → fingimos éxito sin guardar.
    if payload.website:
        return Lead(id=0, created_at=datetime.now(timezone.utc), name=payload.name, email=payload.email)

    ip = request.client.host if request.client else "unknown"
    if not allow(ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Demasiadas solicitudes. Intenta de nuevo en un momento.",
        )

    return await _service.register(payload)
