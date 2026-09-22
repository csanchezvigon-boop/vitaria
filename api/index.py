"""Vercel Serverless Function — FastAPI de Vitaria.

Servees toda la app (API /api/v1 + health) como una función serverless.
Los estáticos (index.html, portal.html, js/, css/) los sirve Vercel
directamente desde la raíz del repo; esta función solo responde /api/*.

El backend vive en backend/app; este wrapper ajusta sys.path para que
`app.main:app` sea importable desde la raíz del proyecto.
"""
import os
import sys
from pathlib import Path

# Añade backend/ al path para que `from app.main import app` funcione
_BACKEND = Path(__file__).resolve().parent.parent / "backend"
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

# En Vercel el cwd es efímero: aseguramos que el frontend root se resuelva
os.environ.setdefault("VITARIA_FRONTEND_ROOT", str(_BACKEND.parent))

from app.main import app  # noqa: E402

# Vercel espera un callable ASGI exportado como `app`
handler = app