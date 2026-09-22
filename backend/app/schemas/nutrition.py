"""Esquemas de catálogos nutricionales (comidas + conocimiento general)."""
from pydantic import BaseModel, ConfigDict


class MealCatalogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    meal_types: list
    kcal: float | None
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    ingredients: list | None
    prep: str | None
    note: str | None
    allergens: list | None
    tag: str | None


class CatalogEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: str
    key: str
    data: dict | None
