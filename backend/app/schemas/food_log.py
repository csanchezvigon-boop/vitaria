"""Schemas de FoodLog y barcode scan."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FoodLogCreate(BaseModel):
    meal_type: str = Field(default="snack", max_length=20)
    name: str = Field(max_length=160)
    barcode: str | None = None
    source: str = Field(default="manual", max_length=20)
    portion: str = "100g"
    quantity: float = 100
    kcal: float = 0
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0


class FoodLogOut(FoodLogCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    date: datetime


class BarcodeResult(BaseModel):
    """Resultado de búsqueda de un código de barras (propio o Open Food Facts)."""
    barcode: str
    name: str
    brand: str | None = None
    kcal_per_100g: float | None = None
    protein_per_100g: float | None = None
    carbs_per_100g: float | None = None
    fat_per_100g: float | None = None
    image_url: str | None = None
    source: str = "local"  # local | openfoodfacts