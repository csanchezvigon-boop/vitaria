"""App principal de Vitaria (FastAPI).

Sirve la API (prefijo /api/v1), el health check y los estáticos del portal
(index.html, portal.html) en el MISMO origen, para que el MVP funcione
"en web activo" sin CORS desde un solo puerto.
"""
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import init_db
from app.core.security import is_strong_secret
from app.routers.v1 import api_router

# Raíz del proyecto (~/nutricion) donde están index.html y portal.html
FRONTEND_ROOT = Path(__file__).resolve().parents[2]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: crea tablas en dev (en prod usar Alembic)
    if settings.DATABASE_URL.startswith("sqlite"):
        await init_db()

    # Fail-fast: no permitir SECRET_KEY por defecto en producción
    if not settings.DEBUG and not is_strong_secret():
        raise RuntimeError(
            "SECRET_KEY sigue siendo el placeholder por defecto. Define una clave "
            "segura en el entorno (.env / variable) antes de desplegar a producción."
        )
    yield
    # Shutdown: nada que limpiar por ahora


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.1.0",
    description="API de nutrición real sin dietas — Vitaria",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/health", tags=["health"])
async def health() -> dict:
    return {"status": "ok", "service": settings.PROJECT_NAME}


# Sirve index.html (en /), portal.html y el resto de estáticos del frontend
if FRONTEND_ROOT.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_ROOT), html=True), name="frontend")
