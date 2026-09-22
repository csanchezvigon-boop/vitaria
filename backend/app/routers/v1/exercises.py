"""Endpoints de catálogo de ejercicios (solo lectura para el usuario final)."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select

from app.core.database import AsyncSession, get_session
from app.models.exercise import Exercise
from app.schemas.catalog import ExerciseOut

router = APIRouter(prefix="/exercises", tags=["exercises"])

DbSession = Depends(get_session)


@router.get("", response_model=list[ExerciseOut])
async def list_exercises(
    db: AsyncSession = DbSession,
    q: str | None = Query(None, description="Búsqueda por nombre"),
    type: str | None = Query(None, description="Filtrar por tipo: cardio/fuerza/flexibilidad/movilidad"),
    muscle_group: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    stmt = select(Exercise)
    if q:
        stmt = stmt.where(Exercise.name.ilike(f"%{q}%"))
    if type:
        stmt = stmt.where(Exercise.type == type)
    if muscle_group:
        stmt = stmt.where(Exercise.muscle_group == muscle_group)
    stmt = stmt.order_by(Exercise.name).limit(limit).offset(offset)
    result = await db.scalars(stmt)
    return [ExerciseOut.model_validate(e).model_dump() for e in result.all()]


@router.get("/{exercise_id}", response_model=ExerciseOut)
async def get_exercise(exercise_id: int, db: AsyncSession = DbSession):
    ex = await db.get(Exercise, exercise_id)
    if not ex:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Ejercicio no encontrado")
    return ex
