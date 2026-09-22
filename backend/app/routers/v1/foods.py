"""Endpoints de catálogo de alimentos (solo lectura para el usuario final)."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select

from app.core.database import AsyncSession, get_session
from app.models.food import Food
from app.schemas.catalog import FoodOut

router = APIRouter(prefix="/foods", tags=["foods"])

DbSession = Depends(get_session)


@router.get("", response_model=list[FoodOut])
async def list_foods(
    db: AsyncSession = DbSession,
    q: str | None = Query(None, description="Búsqueda por nombre"),
    category: str | None = Query(None, description="Filtrar por categoría"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    stmt = select(Food)
    if q:
        stmt = stmt.where(Food.name.ilike(f"%{q}%"))
    if category:
        stmt = stmt.where(Food.category == category)
    stmt = stmt.order_by(Food.name).limit(limit).offset(offset)
    result = await db.scalars(stmt)
    return [FoodOut.model_validate(f).model_dump() for f in result.all()]


@router.get("/categories", response_model=list[str])
async def list_food_categories(db: AsyncSession = DbSession):
    result = await db.scalars(select(Food.category).distinct().order_by(Food.category))
    return result.all()


@router.get("/{food_id}", response_model=FoodOut)
async def get_food(food_id: int, db: AsyncSession = DbSession):
    food = await db.get(Food, food_id)
    if not food:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Alimento no encontrado")
    return food
