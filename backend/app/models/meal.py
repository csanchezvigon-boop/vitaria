"""Modelo Meal (comida de un plan)."""
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Meal(Base):
    __tablename__ = "meals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    plan_id: Mapped[int] = mapped_column(ForeignKey("plans.id", ondelete="CASCADE"), index=True)
    day: Mapped[int] = mapped_column(Integer, default=1)  # 1-7
    type: Mapped[str] = mapped_column(String(20))  # desayuno|almuerzo|cena|snack
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    kcal: Mapped[int | None] = mapped_column(Integer)
    protein_g: Mapped[float | None] = mapped_column()
    carbs_g: Mapped[float | None] = mapped_column()
    fat_g: Mapped[float | None] = mapped_column()

    plan: Mapped["Plan"] = relationship(back_populates="meals")
