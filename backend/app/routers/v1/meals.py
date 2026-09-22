"""Endpoints de catálogo de comidas (solo lectura)."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select

from app.core.database import AsyncSession, get_session
from app.models.meal_catalog import MealCatalog
from app.schemas.nutrition import MealCatalogOut

router = APIRouter(prefix="/meals", tags=["meals"])

DbSession = Depends(get_session)


def _escape_like(value: str) -> str:
    """Escapa wildcards para ILIKE (evita abuso de % y _ en la búsqueda)."""
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


@router.get("", response_model=list)
async def list_meals(
    db: AsyncSession = DbSession,
    meal_type: str | None = Query(None, description="desayuno|comida|cena"),
    q: str | None = Query(None, description="Buscar por nombre"),
    limit: int = Query(100, ge=1, le=300),
    offset: int = Query(0, ge=0),
):
    stmt = select(MealCatalog)
    if q:
        stmt = stmt.where(MealCatalog.name.ilike(f"%{_escape_like(q)}%", escape="\\"))
    if meal_type:
        # meal_types es JSON; filtramos en Python tras la consulta (catálogo acotado)
        stmt = stmt.limit(300)
    else:
        stmt = stmt.limit(limit).offset(offset)
    result = await db.scalars(stmt)
    meals = result.all()
    if meal_type:
        meals = [m for m in meals if meal_type in (m.meal_types or [])][offset:offset + limit]
    return [MealCatalogOut.model_validate(m).model_dump() for m in meals]


@router.get("/{name}", response_model=dict)
async def get_meal(name: str, db: AsyncSession = DbSession):
    # Igualdad insensible a mayúsculas (con escape de wildcards para robustez)
    meal = await db.scalar(
        select(MealCatalog).where(MealCatalog.name.ilike(_escape_like(name), escape="\\"))
    )
    if not meal:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Comida no encontrada")
    return MealCatalogOut.model_validate(meal).model_dump()
