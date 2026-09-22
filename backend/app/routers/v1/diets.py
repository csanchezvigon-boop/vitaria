"""Endpoints de dietas generadas desde la base de datos (solo lectura)."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.core.database import AsyncSession, get_session
from app.services.diet_generator import DIET_TYPES, generate_diet

router = APIRouter(prefix="/diets", tags=["diets"])

DbSession = Depends(get_session)


class DietGenerateIn(BaseModel):
    tipo: str = Field(description="Tipo de dieta (ver /diets/types)")
    objetivo: str = "regular"
    alergias: list[str] = []
    semana: int = Query(0, ge=0, le=3)
    n_days: int = 7


@router.get("/types", response_model=list[str])
async def diet_types():
    return DIET_TYPES


@router.get("/{tipo}", response_model=dict)
async def get_diet(
    tipo: str,
    db: AsyncSession = DbSession,
    objetivo: str = "regular",
    alergias: str | None = Query(None, description="Coma-separadas"),
    semana: int = Query(0, ge=0, le=3),
):
    if tipo not in DIET_TYPES and tipo not in ("mediterranea", "vegano", "vegetariano", "ceto", "keto", "sin_gluten"):
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Tipo de dieta no soportado: {tipo}")
    al = [a.strip() for a in (alergias.split(",") if alergias else []) if a.strip()]
    return await generate_diet(tipo, objetivo=objetivo, alergias=al, semana=semana, db=db)


@router.post("/generate", response_model=dict)
async def generate(data: DietGenerateIn, db: AsyncSession = DbSession):
    return await generate_diet(
        data.tipo, objetivo=data.objetivo, alergias=data.alergias,
        semana=data.semana, n_days=data.n_days, db=db,
    )