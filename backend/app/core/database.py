"""Conexión a base de datos (async) y utilidades de sesión."""
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# En prod, DATABASE_URL apunta a postgresql+psycopg://...
connect_args = (
    {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)

engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG, future=True, connect_args=connect_args)

AsyncSessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
)


class Base(DeclarativeBase):
    """Base declarativa para todos los modelos."""


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency de FastAPI: inyecta una sesión async por request."""
    async with AsyncSessionLocal() as session:
        yield session


async def init_db() -> None:
    """Crea las tablas (solo dev/sqlite; en prod usar Alembic)."""
    # Importa los modelos para registrarlos en el metadata de Base
    from app import models  # noqa: F401
    from app.services.seed import seed_catalogs
    from app.services.seed_nutrition import seed_nutrition
    from app.services.seed_scale import seed_scale

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed de catálogos (alimentos/ejercicios) si están vacíos
    await seed_catalogs()
    # Seed de conocimiento nutricional migrado desde el portal
    await seed_nutrition()
    # Seed de escala: más contenido (alimentos, comidas, grupos de sustitución, tags)
    await seed_scale()
