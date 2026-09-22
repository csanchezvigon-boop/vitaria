"""Tests de escala: contenido ampliado y generador de dietas desde la DB."""
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_scale_content_counts(client: AsyncClient):
    # Escala: alimentos ampliados (212 + extras) y comidas con tag
    r = await client.get("/api/v1/catalog/food_recognition?limit=500")
    assert r.status_code == 200
    foods = r.json()
    assert len(foods) >= 300, f"Esperado >=300 alimentos, hay {len(foods)}"

    r2 = await client.get("/api/v1/meals?limit=300")
    assert r2.status_code == 200
    meals = r2.json()
    assert len(meals) >= 150, f"Esperado >=150 comidas, hay {len(meals)}"
    # Comidas con tag de dieta (nuevas, al menos 30)
    tagged = [m for m in meals if m.get("tag") in (
        "equilibrada", "sin gluten", "vegano", "vegetariano", "paleo", "cetogenico", "mediterraneo")]
    assert len(tagged) >= 30, f"Comidas etiquetadas: {len(tagged)}"


@pytest.mark.asyncio
async def test_substitution_groups_scaled(client: AsyncClient):
    r = await client.get("/api/v1/catalog/substitution_groups?limit=100")
    assert r.status_code == 200
    groups = r.json()
    assert len(groups) >= 20, f"Grupos de sustitución: {len(groups)}"
    keys = {g["key"] for g in groups}
    assert "pescado_azul" in keys and "proteina_vegetal" in keys


@pytest.mark.asyncio
async def test_diet_types(client: AsyncClient):
    r = await client.get("/api/v1/diets/types")
    assert r.status_code == 200
    tipos = r.json()
    assert "mediterraneo" in tipos and "vegana" in tipos and "cetogenico" in tipos


@pytest.mark.asyncio
async def test_diet_mediterraneo(client: AsyncClient):
    r = await client.get("/api/v1/diets/mediterraneo?semana=0")
    assert r.status_code == 200
    body = r.json()
    assert body["semana"] == 1
    dias = body["dias"]
    assert len(dias) == 7
    for dia, comidas in dias.items():
        assert set(comidas.keys()) >= {"desayuno", "comida", "cena"}
        for mt in ("desayuno", "comida", "cena"):
            c = comidas[mt]
            assert c["name"] and c["kcal"] > 0
    assert body["totales"]["kcal"] > 1500


@pytest.mark.asyncio
async def test_diet_vegana_no_animal(client: AsyncClient):
    r = await client.post("/api/v1/diets/generate", json={
        "tipo": "vegana", "objetivo": "regular", "alergias": [], "semana": 1, "n_days": 7})
    assert r.status_code == 200
    for dia, comidas in r.json()["dias"].items():
        for mt in ("desayuno", "comida", "cena"):
            name = comidas[mt]["name"].lower()
            for w in ("pollo", "ternera", "cerdo", "pescado", "salmón", "merluza", "huevo"):
                assert w not in name, f"{name} no es vegana"


@pytest.mark.asyncio
async def test_diet_filters_allergens(client: AsyncClient):
    r = await client.get("/api/v1/diets/vegetariana?alergias=L%C3%A1cteos&semana=0")
    assert r.status_code == 200
    for dia, comidas in r.json()["dias"].items():
        for mt in ("desayuno", "comida", "cena"):
            name = comidas[mt]["name"].lower()
            assert "queso" not in name and "feta" not in name, f"{name} contiene lácteos declarados"