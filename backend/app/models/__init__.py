"""Registro de todos los modelos para que SQLAlchemy los descubra."""
from app.models.catalog import CatalogEntry  # noqa: F401
from app.models.exercise import Exercise  # noqa: F401
from app.models.food import Food  # noqa: F401
from app.models.food_log import FoodLog  # noqa: F401
from app.models.meal import Meal  # noqa: F401
from app.models.meal_catalog import MealCatalog  # noqa: F401
from app.models.plan import Plan  # noqa: F401
from app.models.shopping import ShoppingItem  # noqa: F401
from app.models.tracking import Tracking  # noqa: F401
from app.models.user import User  # noqa: F401