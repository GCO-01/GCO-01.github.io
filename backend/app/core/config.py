"""Configuración de la aplicación (scaffold).

Lee variables de entorno; ver .env.example. Sin secretos hardcodeados.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "VAGGO API"
    version: str = "0.1.0"
    # CORS: origen del frontend (GitHub Pages / dev). Ajustar al desplegar la API.
    frontend_origin: str = "http://localhost:5173"
    database_url: str = ""


settings = Settings()
