"""Modelo Exercise: catálogo de referencia de ejercicios (kcal quemadas, grupo)."""
from sqlalchemy import Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(40), nullable=False, index=True)  # cardio, fuerza, flexibilidad, movilidad
    muscle_group: Mapped[str | None] = mapped_column(String(60))  # pierna, pecho, full-body...
    kcal_per_min: Mapped[float] = mapped_column(Float, default=0)  # estimación kcal/min persona 70kg
    intensity: Mapped[str] = mapped_column(String(20), default="media")  # baja/media/alta
    instructions: Mapped[str | None] = mapped_column(Text)

    def __repr__(self) -> str:
        return f"<Exercise {self.name} ({self.type})>"
