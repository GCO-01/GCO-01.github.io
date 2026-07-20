"""Repositorio de leads — persistencia en Postgres (Supabase) vía asyncpg."""

from app.core.db import get_pool
from app.domain.models import Lead, LeadCreate
from app.repositories.base import Repository

_INSERT = """
INSERT INTO leads (name, email, grams, gap, goal, age, training, activity, gender, age_range, client_ts)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
RETURNING id, created_at, name, email
"""


class LeadRepository(Repository[Lead]):
    async def add(self, entity: LeadCreate) -> Lead:  # type: ignore[override]
        pool = get_pool()
        if pool is None:
            raise RuntimeError("DB pool no inicializado (DATABASE_URL vacío).")
        row = await pool.fetchrow(
            _INSERT,
            entity.name, entity.email, entity.grams, entity.gap, entity.goal,
            entity.age, entity.training, entity.activity, entity.gender,
            entity.age_range, entity.client_ts,
        )
        return Lead(id=row["id"], created_at=row["created_at"], name=row["name"], email=row["email"])
