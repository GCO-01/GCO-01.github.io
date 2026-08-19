"""Caso de uso: registrar una aplicación al Founding Batch #001 (stub).

Orquesta validación de dominio + persistencia. A futuro también dispararía
el envío de email / integración con CRM (hoy inexistente).
"""

from app.domain.models import BatchApplication, BatchApplicationCreate
from app.repositories.batch001_repository import BatchApplicationRepository


class BatchApplicationService:
    def __init__(self, repository: BatchApplicationRepository) -> None:
        self._repository = repository

    async def register(self, data: BatchApplicationCreate) -> BatchApplication:
        return await self._repository.add(data)
