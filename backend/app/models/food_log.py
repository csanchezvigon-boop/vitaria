"""Modelo FoodLog — registro diario de alimentos consumidos por el usuario.

Fuente: manual (buscar en catálogo), escaneo de código de barras (barcode)
o escaneo cámara de la app. Se persiste por usuario + fecha + comida.
"""
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class FoodLog(Base):
    __tablename__ = "food_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    meal_type: Mapped[str] = mapped_column(String(20), default="snack")  # desayuno|comida|merienda|cena|snack
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    barcode: Mapped[str | None] = mapped_column(String(20), index=True)  # EAN-13
    source: Mapped[str] = mapped_column(String(20), default="manual")  # manual|barcode|ocr
    portion: Mapped[str] = mapped_column(String(40), default="100g")
    quantity: Mapped[float] = mapped_column(Float, default=100)  # gramos o unidades
    kcal: Mapped[float] = mapped_column(Float, default=0)
    protein_g: Mapped[float] = mapped_column(Float, default=0)
    carbs_g: Mapped[float] = mapped_column(Float, default=0)
    fat_g: Mapped[float] = mapped_column(Float, default=0)

    user: Mapped["User"] = relationship(back_populates="food_logs")  # noqa: F821

    def __repr__(self) -> str:
        return f"<FoodLog {self.date:%Y-%m-%d} {self.name} {self.kcal} kcal>"