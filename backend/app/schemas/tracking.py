"""Esquemas de seguimiento y lista de la compra."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# --- Tracking ---
class TrackingBase(BaseModel):
    water_ml: int = 0
    kcal_consumed: int = 0
    kcal_target: int = 0
    weight_kg: float | None = None


class TrackingCreate(TrackingBase):
    pass


class TrackingOut(TrackingBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    date: datetime | None


# --- Shopping ---
class ShoppingItemBase(BaseModel):
    name: str
    qty: str | None = None
    checked: bool = False


class ShoppingItemCreate(ShoppingItemBase):
    pass


class ShoppingItemUpdate(BaseModel):
    name: str | None = None
    qty: str | None = None
    checked: bool | None = None


class ShoppingItemOut(ShoppingItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
