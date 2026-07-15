"""Caso de uso: registrar un lead (stub).

Orquesta validación de dominio + persistencia. A futuro también dispararía
el envío de email / integración con CRM (hoy inexistente).
"""

from app.domain.models import Lead, LeadCreate
from app.repositories.lead_repository import LeadRepository


class LeadService:
    def __init__(self, repository: LeadRepository) -> None:
        self._repository = repository

    async def register(self, data: LeadCreate) -> Lead:
        return await self._repository.add(data)
