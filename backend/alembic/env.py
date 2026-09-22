"""Entorno Alembic — usa la URL de app.core.config (DATABASE_URL del .env).

Soporta sync (alembic migrate) sobre SQLite y PostgreSQL. La conexión
asíncrona de la app no es compatible con Alembic directamente, así que
traducimos el driver asíncrono a su homólogo síncrono:
  sqlite+aiosqlite  → sqlite
  postgresql+psycopg (async) → postgresql+psycopg (sync driver psycopg)
"""
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

from app.core.config import settings
from app.core.database import Base

# Importa los modelos para que queden registrados en Base.metadata
from app import models  # noqa: F401

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def _sync_url(url: str) -> str:
    """Devuelve una URL de BD síncrona equivalente (para Alembic)."""
    if url.startswith("sqlite+aiosqlite"):
        return url.replace("sqlite+aiosqlite", "sqlite")
    if url.startswith("postgresql+"):
        # psycopg3 sirve igual en async y sync
        return url
    return url


def run_migrations_offline() -> None:
    url = _sync_url(settings.DATABASE_URL)
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = _sync_url(settings.DATABASE_URL)
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()