"""Modelo ShoppingItem (lista de la compra semanal)."""
from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ShoppingItem(Base):
    __tablename__ = "shopping_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(200))
    qty: Mapped[str | None] = mapped_column(String(50))
    checked: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship(back_populates="shoppings")


# Añadir relación inversa a User (evita import circular con string)
from app.models.user import User  # noqa: E402

User.shoppings = relationship(  # type: ignore[attr-defined]
    "ShoppingItem", back_populates="user", cascade="all, delete-orphan"
)
