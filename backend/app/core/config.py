"""Configuración de la aplicación. Lee variables de entorno; ver .env.example."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "VAGGO API"
    version: str = "0.1.0"

    # Postgres de Supabase. Usar la connection string del POOLER (transaction,
    # puerto 6543). El código setea statement_cache_size=0 por pgbouncer.
    database_url: str = ""

    # CORS: orígenes permitidos, separados por coma (frontend Pages + dev).
    frontend_origins: str = "http://localhost:5173"

    # Anti-abuso básico: máximo de requests por IP por minuto.
    rate_limit_per_min: int = 20

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.frontend_origins.split(",") if o.strip()]


settings = Settings()
