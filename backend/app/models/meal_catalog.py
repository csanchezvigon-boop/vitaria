"""Catálogo de comidas (platos) de Vitaria.

Unifica la info nutricional del portal: macros (NDATA), detalle de receta
(MEAL_DETAILS / W_MEAL_DETAILS), alérgenos (ALLERGENS), ingredientes
(INGREDIENTS) y en qué tipos de comida aparece (MEALS).
"""
from sqlalchemy import JSON, Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class MealCatalog(Base):
    __tablename__ = "meal_catalog"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160), unique=True, index=True, nullable=False)
    meal_types: Mapped[list] = mapped_column(JSON, default=list)  # desayuno/comida/cena
    kcal: Mapped[float | None] = mapped_column(Float)
    protein_g: Mapped[float] = mapped_column(Float, default=0)
    carbs_g: Mapped[float] = mapped_column(Float, default=0)
    fat_g: Mapped[float] = mapped_column(Float, default=0)
    fiber_g: Mapped[float] = mapped_column(Float, default=0)
    ingredients: Mapped[list | None] = mapped_column(JSON)
    prep: Mapped[str | None] = mapped_column(Text)
    note: Mapped[str | None] = mapped_column(Text)
    allergens: Mapped[list | None] = mapped_column(JSON)
    tag: Mapped[str | None] = mapped_column(String(60))
