"""Entrada de catálogo genérico (conocimiento nutricional del portal).

Almacena todas las estructuras de datos del portal que no son "comidas"
en sí: menús semanales (WEEKS/WEIGHT_WEEKS), base de reconocimiento de
alimentos (FOOD_DB), grupos de sustitución, listas de la compra, planes de
dieta, alérgenos, planes de precio, y metadata (GROUP_NAMES, MEAL_LABELS…).
"""
from sqlalchemy import JSON, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CatalogEntry(Base):
    __tablename__ = "catalog_entries"
    __table_args__ = (UniqueConstraint("category", "key", name="uq_catalog_cat_key"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    category: Mapped[str] = mapped_column(String(60), index=True, nullable=False)
    key: Mapped[str] = mapped_column(String(200), nullable=False)
    data: Mapped[dict | None] = mapped_column(JSON, default=dict)
