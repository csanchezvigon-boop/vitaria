"""Tests de la API Vitaria (pytest + httpx async)."""
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client():
    # La DB en memoria la prepara conftest.setup_test_db (autouse)
    # que además aplica dependency_overrides sobre get_session.
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_register_login_me(client: AsyncClient):
    # Registro
    r = await client.post(
        "/api/v1/auth/register",
        json={"email": "test@vitaria.com", "name": "Test", "password": "secret123", "plan_tier": "pro"},
    )
    assert r.status_code == 201, r.text
    token = r.json()["access_token"]

    # Me con token
    r = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["email"] == "test@vitaria.com"
    assert body["plan_tier"] == "pro"

    # Login
    r = await client.post(
        "/api/v1/auth/login",
        data={"username": "test@vitaria.com", "password": "secret123"},
    )
    assert r.status_code == 200, r.text
    assert "access_token" in r.json()


@pytest.mark.asyncio
async def test_protected_requires_token(client: AsyncClient):
    r = await client.get("/api/v1/users/me")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_plan_generate(client: AsyncClient):
    r = await client.post(
        "/api/v1/auth/register",
        json={"email": "plan@vitaria.com", "name": "Plan", "password": "secret123"},
    )
    token = r.json()["access_token"]
    r = await client.post(
        "/api/v1/plans/generate",
        json={"objective": "regular_weight", "diet_type": "equilibrada", "days": 3},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert len(body["meals"]) == 12  # 3 días × 4 comidas
