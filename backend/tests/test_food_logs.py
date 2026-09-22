"""Tests del router de food-logs y barcode scan."""
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client():
    # La DB en memoria la prepara conftest.setup_test_db (autouse)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_food_logs_crud(client: AsyncClient):
    """Registro de alimento: crear y listar."""
    r = await client.post("/api/v1/auth/register", json={
        "email": "log@test.com", "name": "Log", "password": "test1234", "plan_tier": "pro"
    })
    assert r.status_code in (200, 201)
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    r = await client.post("/api/v1/food-logs", json={
        "name": "Yogur natural", "meal_type": "merienda", "source": "manual",
        "portion": "100g", "quantity": 150, "kcal": 88, "protein_g": 5.5,
        "carbs_g": 6, "fat_g": 3.5,
    }, headers=headers)
    assert r.status_code == 201
    log = r.json()
    assert log["name"] == "Yogur natural"
    assert log["user_id"] >= 1
    assert log["source"] == "manual"

    r = await client.get("/api/v1/food-logs", headers=headers)
    assert r.status_code == 200
    logs = r.json()
    assert len(logs) == 1
    assert logs[0]["id"] == log["id"]

    # Borrar
    r = await client.delete(f"/api/v1/food-logs/{log['id']}", headers=headers)
    assert r.status_code == 204
    r = await client.get("/api/v1/food-logs", headers=headers)
    assert len(r.json()) == 0


@pytest.mark.asyncio
async def test_barcode_local_catalog(client: AsyncClient, test_session):
    """Barcode que existe en catálogo local se resuelve sin red."""
    from app.models.catalog import CatalogEntry
    test_session.add(CatalogEntry(
        category="barcodes", key="9912345678901",
        data={"name": "Test Product", "brand": "TestBrand", "kcal": 100,
              "protein": 5, "carbs": 20, "fat": 1},
    ))
    await test_session.commit()

    r = await client.get("/api/v1/food-logs/barcode/9912345678901")
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "Test Product"
    assert data["source"] == "local"
    assert data["kcal_per_100g"] == 100


@pytest.mark.asyncio
async def test_barcode_missing_returns_404(client: AsyncClient):
    """Un barcode inexistente (sin red) da 404."""
    import app.services.barcode_lookup as bl
    original = bl._openfoodfacts
    async def _no_net(barcode):
        return None
    bl._openfoodfacts = _no_net  # simula red inexistente
    try:
        r = await client.get("/api/v1/food-logs/barcode/0000000000000")
        assert r.status_code == 404
    finally:
        bl._openfoodfacts = original