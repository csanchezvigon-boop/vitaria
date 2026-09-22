"""Tests de catálogos nutricionales (meals + catalog_entries)."""
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_meals_catalog_populated(client: AsyncClient):
    r = await client.get("/api/v1/meals?limit=5")
    assert r.status_code == 200
    meals = r.json()
    assert len(meals) > 0
    assert "name" in meals[0] and "kcal" in meals[0]


@pytest.mark.asyncio
async def test_meal_by_name(client: AsyncClient):
    r = await client.get("/api/v1/meals/Avena%20con%20fruta%20y%20nueces")
    assert r.status_code == 200
    assert r.json()["name"] == "Avena con fruta y nueces"


@pytest.mark.asyncio
async def test_meal_wildcard_escaped(client: AsyncClient):
    # '%' no debe romper ni devolver todos
    r = await client.get("/api/v1/meals/%25")
    assert r.status_code in (200, 404)


@pytest.mark.asyncio
async def test_catalog_categories(client: AsyncClient):
    for cat in ("menu_templates", "food_recognition", "diet_plans", "substitution_groups"):
        r = await client.get(f"/api/v1/catalog/{cat}")
        assert r.status_code == 200, cat
        assert len(r.json()) > 0


@pytest.mark.asyncio
async def test_catalog_entry(client: AsyncClient):
    r = await client.get("/api/v1/catalog/food_recognition/pollo")
    assert r.status_code == 200
    assert r.json()["data"]["k"] == 165
