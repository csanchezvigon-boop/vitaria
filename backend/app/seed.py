"""Seed CLI portátil — puebla la DB (dev SQLite o prod PostgreSQL/Supabase).

Uso (desde backend/):
  python -m app.seed          # crea tablas (si no existen) + seeds
  DATABASE_URL=postgresql+psycopg://... python -m app.seed

Idempotente: se puede ejecutar varias veces sin duplicar datos.
"""
import asyncio

from app.core.database import AsyncSessionLocal, Base, engine
from app.services.seed import seed_catalogs
from app.services.seed_nutrition import seed_nutrition
from app.services.seed_scale import seed_scale


async def main() -> None:
    print(">> Creando tablas (si no existen)...")
    from app import models  # noqa: F401
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print(">> Sembrando catálogos (alimentos, ejercicios)...")
    await seed_catalogs()
    print(">> Sembrando nutrición (meal_catalog)...")
    await seed_nutrition()
    print(">> Sembrando escala (alimentos extra, sustituciones)...")
    await seed_scale()

    # Resumen
    from sqlalchemy import func, select
    from app.models.catalog import CatalogEntry
    from app.models.meal_catalog import MealCatalog
    async with AsyncSessionLocal() as session:
        meals = await session.scalar(select(func.count()).select_from(MealCatalog))
        entries = await session.scalar(select(func.count()).select_from(CatalogEntry))
        print(f">> OK: {meals} comidas, {entries} entradas de catálogo.")


if __name__ == "__main__":
    asyncio.run(main())