"""Configuración de pytest para tests async de Vitaria."""
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_session


@pytest.fixture(scope="function", autouse=True)
async def setup_test_db():
    """Usa SQLite en memoria para todos los tests (aislado)."""
    engine = create_async_engine(
        "sqlite+aiosqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestSession = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed de catálogos (alimentos/ejercicios + conocimiento del portal)
    from app.services.seed import seed_catalogs
    from app.services.seed_nutrition import seed_nutrition
    from app.services.seed_scale import seed_scale
    await seed_catalogs(engine)
    await seed_nutrition(engine)
    await seed_scale(engine)

    async def override_get_session():
        async with TestSession() as s:
            yield s

    # Aplica el override de dependencia
    from app.main import app
    from app.core.database import get_session as _gs
    app.dependency_overrides[_gs] = override_get_session
    app.state.test_session_maker = TestSession

    yield

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()
    app.dependency_overrides.clear()
    app.state.test_session_maker = None


@pytest.fixture
async def test_session():
    """Sesión de la misma DB en memoria usada por los requests (para inserts)."""
    from app.main import app
    maker = getattr(app.state, "test_session_maker", None)
    if maker is None:
        raise RuntimeError("test_session solo disponible dentro de setup_test_db")
    async with maker() as s:
        yield s