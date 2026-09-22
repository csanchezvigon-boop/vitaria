"""Esquemas de catálogos: alimentos y ejercicios."""
from pydantic import BaseModel, ConfigDict, Field


# ---------- Food ----------
class FoodBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    category: str = Field(max_length=60)
    portion: str = Field(max_length=40)
    kcal: float = Field(ge=0)
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    fiber_g: float = 0
    notes: str | None = None


class FoodCreate(FoodBase):
    pass


class FoodOut(FoodBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- Exercise ----------
class ExerciseBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    type: str = Field(max_length=40)
    muscle_group: str | None = None
    kcal_per_min: float = 0
    intensity: str = "media"
    instructions: str | None = None


class ExerciseCreate(ExerciseBase):
    pass


class ExerciseOut(ExerciseBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
