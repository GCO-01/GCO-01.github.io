"""Repositorio de leads (stub).

Implementación pendiente: hoy no persiste nada. Cuando exista base de datos,
implementar `add` contra la tabla `leads`.
"""

from app.domain.models import Lead, LeadCreate
from app.repositories.base import Repository


class LeadRepository(Repository[Lead]):
    async def add(self, entity: LeadCreate) -> Lead:  # type: ignore[override]
        raise NotImplementedError("Persistencia de leads aún no implementada")
