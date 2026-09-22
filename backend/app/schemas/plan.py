"""Esquemas de planes y comidas."""
from pydantic import BaseModel, ConfigDict, Field


class MealBase(BaseModel):
    day: int = Field(ge=1, le=7, default=1)
    type: str  # desayuno|almuerzo|cena|snack
    name: str
    description: str | None = None
    kcal: int | None = None
    protein_g: float | None = None
    carbs_g: float | None = None
    fat_g: float | None = None


class MealOut(MealBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    plan_id: int


class PlanBase(BaseModel):
    objective: str = "reset_build"
    diet_type: str = "equilibrada"
    notes: str | None = None


class PlanCreate(PlanBase):
    pass


class PlanOut(PlanBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    meals: list[MealOut] = []


class PlanGenerateIn(BaseModel):
    """Entrada para el generador de planes (servicio de negocio)."""
    objective: str = "reset_build"
    diet_type: str = "equilibrada"
    days: int = Field(ge=1, le=7, default=7)
