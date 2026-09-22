"""Modelo Plan (plan semanal de alimentación)."""
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    objective: Mapped[str] = mapped_column(String(40), default="reset_build")  # reset_build|regular_weight|...
    diet_type: Mapped[str] = mapped_column(String(40), default="equilibrada")  # equilibrada|sin_gluten|...
    week_start: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    notes: Mapped[str | None] = mapped_column(Text)

    user: Mapped["User"] = relationship(back_populates="plans")
    meals: Mapped[list["Meal"]] = relationship(
        back_populates="plan",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
