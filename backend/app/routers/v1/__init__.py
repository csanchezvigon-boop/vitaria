"""Agregador de routers v1."""
from fastapi import APIRouter

from app.routers.v1 import auth, catalog, diets, exercises, food_logs, foods, meals, payments, plans, shopping, tracking, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(plans.router)
api_router.include_router(tracking.router)
api_router.include_router(shopping.router)
api_router.include_router(payments.router)
api_router.include_router(foods.router)
api_router.include_router(food_logs.router)
api_router.include_router(exercises.router)
api_router.include_router(meals.router)
api_router.include_router(catalog.router)
api_router.include_router(diets.router)
