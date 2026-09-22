"""Endpoints de catálogo genérico (conocimiento nutricional del portal)."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select

from app.core.database import AsyncSession, get_session
from app.models.catalog import CatalogEntry

router = APIRouter(prefix="/catalog", tags=["catalog"])

DbSession = Depends(get_session)


@router.get("/{category}", response_model=list)
async def list_category(
    category: str,
    db: AsyncSession = DbSession,
    limit: int = Query(200, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    result = await db.scalars(
        select(CatalogEntry).where(CatalogEntry.category == category).limit(limit).offset(offset)
    )
    rows = result.all()
    if not rows:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Catálogo '{category}' vacío o inexistente")
    return [{"key": r.key, "data": r.data} for r in rows]


@router.get("/{category}/{key}", response_model=dict)
async def get_entry(category: str, key: str, db: AsyncSession = DbSession):
    entry = await db.scalar(
        select(CatalogEntry).where(CatalogEntry.category == category, CatalogEntry.key == key)
    )
    if not entry:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Entrada no encontrada")
    return {"key": entry.key, "data": entry.data}
