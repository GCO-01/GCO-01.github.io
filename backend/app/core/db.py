"""Pool de conexiones asyncpg hacia Supabase Postgres.

Se inicializa/cierra en el lifespan de la app (main.py). `statement_cache_size=0`
es obligatorio con el pooler de Supabase (pgbouncer en modo transaction).
"""

import asyncpg

from app.core.config import settings

_pool: asyncpg.Pool | None = None


async def init_pool() -> None:
    global _pool
    if settings.database_url and _pool is None:
        _pool = await asyncpg.create_pool(
            dsn=settings.database_url,
            min_size=1,
            max_size=5,
            statement_cache_size=0,  # requerido por pgbouncer (Supabase pooler)
        )


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


def get_pool() -> asyncpg.Pool | None:
    return _pool
