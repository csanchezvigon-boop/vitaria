"""Configuración central vía pydantic-settings.

Lee variables de entorno (o .env). En dev usa SQLite; en prod override DATABASE_URL.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    PROJECT_NAME: str = "Vitaria"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    # Security
    SECRET_KEY: str = "change-me-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 días

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./vitaria.db"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "https://vitaria.com"]

    # Stripe (placeholder hasta configurar)
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
