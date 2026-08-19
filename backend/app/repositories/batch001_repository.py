"""Repositorio de aplicaciones al Founding Batch #001 — persistencia en Postgres (Supabase) vía asyncpg."""

from app.core.db import get_pool
from app.domain.models import BatchApplication, BatchApplicationCreate
from app.repositories.base import Repository

_INSERT = """
INSERT INTO batch_001_applications (
    full_name, age, gender, address, email, lifestyle, goal, goal_other, expectations,
    commit_consume_week, commit_whatsapp_checkins, commit_final_survey, commit_honest_feedback,
    commit_terms_accepted, client_ts
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
RETURNING id, created_at, full_name, email
"""


class BatchApplicationRepository(Repository[BatchApplication]):
    async def add(self, entity: BatchApplicationCreate) -> BatchApplication:  # type: ignore[override]
        pool = get_pool()
        if pool is None:
            raise RuntimeError("DB pool no inicializado (DATABASE_URL vacío).")
        row = await pool.fetchrow(
            _INSERT,
            entity.full_name, entity.age, entity.gender, entity.address, entity.email,
            entity.lifestyle, entity.goal, entity.goal_other, entity.expectations,
            entity.commit_consume_week, entity.commit_whatsapp_checkins, entity.commit_final_survey,
            entity.commit_honest_feedback, entity.commit_terms_accepted, entity.client_ts,
        )
        return BatchApplication(
            id=row["id"], created_at=row["created_at"], full_name=row["full_name"], email=row["email"]
        )
