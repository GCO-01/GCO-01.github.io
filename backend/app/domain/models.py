"""Entidades de dominio (scaffold).

`Lead` modela la captura de la calculadora de proteína del frontend:
hoy el frontend recoge nombre + email pero NO los envía a ningún lado
(ver docs/calculadora-logica.md). Este es el futuro punto de integración.
"""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class LeadCreate(BaseModel):
    """Payload entrante desde el gate de la calculadora."""

    name: str = Field(min_length=2)
    email: EmailStr
    # Snapshot opcional del resultado de la calculadora (grams, goal, etc.).
    calc_payload: dict | None = None


class Lead(LeadCreate):
    """Entidad persistida."""

    id: int
    created_at: datetime
