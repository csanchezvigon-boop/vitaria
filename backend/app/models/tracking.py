"""Modelo Tracking (seguimiento diario: agua, calorías, peso)."""
from sqlalchemy import DateTime, ForeignKey, Integer, Float, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Tracking(Base):
    __tablename__ = "trackings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    date: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    water_ml: Mapped[int] = mapped_column(Integer, default=0)
    kcal_consumed: Mapped[int] = mapped_column(Integer, default=0)
    kcal_target: Mapped[int] = mapped_column(Integer, default=0)
    weight_kg: Mapped[float | None] = mapped_column(Float)

    user: Mapped["User"] = relationship(back_populates="trackings")
