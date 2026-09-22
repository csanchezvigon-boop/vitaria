"""Upsert portable entre SQLite y PostgreSQL (para seeds idempotentes).

SQLite usa INSERT ... ON CONFLICT DO NOTHING (dialect sqlite).
PostgreSQL usa el mismo ON CONFLICT (dialect postgresql).

Esta utilidad elige el dialect correcto según DATABASE_URL y devuelve
un statement listo para `session.execute()`.
"""
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert

from app.core.config import settings


def portable_insert(model, values: list[dict], conflict_cols: list[str]):
    """Devuelve INSERT ... ON CONFLICT DO NOTHING portable."""
    if settings.DATABASE_URL.startswith("postgresql"):
        stmt = pg_insert(model).values(values)
        return stmt.on_conflict_do_nothing(index_elements=conflict_cols)
    # Default: SQLite (dev)
    stmt = sqlite_insert(model).values(values)
    return stmt.on_conflict_do_nothing(index_elements=conflict_cols)