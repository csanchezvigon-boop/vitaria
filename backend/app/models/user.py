"""Modelo User (cuentas y auth)."""
from sqlalchemy import Boolean, DateTime, Enum, JSON, String, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str | None] = mapped_column(String(120))
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    plan_tier: Mapped[str] = mapped_column(String(20), default="free")  # free|starter|pro|premium
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    # Estado derivado del portal (menú, adherencia, tracking, evals, físicos...)
    data: Mapped[dict | None] = mapped_column(JSON, default=dict)

    # Relaciones (lazy="selectin" para carga async eficiente)
    plans: Mapped[list["Plan"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )
    trackings: Mapped[list["Tracking"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )
    food_logs: Mapped[list["FoodLog"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )
