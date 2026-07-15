"""Router de leads (stub).

`POST /api/v1/leads` es el futuro endpoint de captura de la calculadora.
Hoy devuelve 501 porque no hay persistencia implementada.
"""

from fastapi import APIRouter, HTTPException, status

from app.domain.models import Lead, LeadCreate

router = APIRouter(prefix="/leads", tags=["leads"])


@router.post("", response_model=Lead, status_code=status.HTTP_201_CREATED)
async def create_lead(payload: LeadCreate) -> Lead:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Captura de leads aún no implementada",
    )
