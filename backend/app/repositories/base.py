"""Interfaz Repository (scaffold).

Define el contrato de persistencia; las implementaciones concretas
(SQLAlchemy/PostgreSQL, etc.) se agregan cuando exista backend real.
"""

from abc import ABC, abstractmethod
from typing import Generic, TypeVar

T = TypeVar("T")


class Repository(ABC, Generic[T]):
    @abstractmethod
    async def add(self, entity: T) -> T:
        """Persiste una entidad y devuelve la versión almacenada."""
        raise NotImplementedError
