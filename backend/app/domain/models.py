"""Entidades de dominio.

`Lead` modela la captura de la calculadora de proteína. Campos actuales del
formulario + campos del rediseño (gender, age_range) declarados como opcionales
para que el esquema no cambie cuando se implementen. `website` es un honeypot.
"""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class LeadCreate(BaseModel):
    """Payload entrante desde el gate de la calculadora."""

    name: str = Field(min_length=2, max_length=120)
    email: EmailStr

    # Resultado de la calculadora
    grams: int | None = None
    gap: int | None = None
    goal: str | None = Field(default=None, max_length=40)
    age: str | None = Field(default=None, max_length=20)       # bucket actual (under65/over65)

    # Segmentación
    training: str | None = Field(default=None, max_length=40)
    activity: str | None = Field(default=None, max_length=40)
    gender: str | None = Field(default=None, max_length=20)    # rediseño (aún no capturado)
    age_range: str | None = Field(default=None, max_length=20)  # rediseño (edad granular)

    client_ts: str | None = Field(default=None, max_length=40)  # timestamp del cliente

    # Honeypot anti-bot: un campo oculto en el form; si llega lleno, es un bot.
    website: str | None = Field(default=None, max_length=200)


class Lead(BaseModel):
    """Entidad persistida (respuesta)."""

    id: int
    created_at: datetime
    name: str
    email: EmailStr
