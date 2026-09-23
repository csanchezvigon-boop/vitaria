# Vitaria — Nutrición personalizada

Plataforma de nutrición personalizada: landing + portal de usuario con dieta semanal, lista de la compra, bienestar y registro de alimentos por código de barras.

## Stack

- **Frontend**: HTML/CSS/JS puro (sin frameworks). `landing.html` + `portal.html`.
- **Backend**: FastAPI (Python) en `backend/`, base de datos SQLite en dev / PostgreSQL en prod.
- **Deploy**: Vercel (frontend + API serverless) + Supabase (PostgreSQL).

## Estructura

```
api/index.py            ← función serverless de Vercel (envuelve app.main:app)
backend/                ← FastAPI + Alembic + seeds (código versionado)
  alembic/              ← migraciones de esquema
  app/seed.py           ← CLI portable: python -m app.seed
  tests/                ← pytest (usa SQLite en memoria)
portal.html             ← portal de usuario (PWA, escáner de código de barras)
vercel.json             ← config de Vercel (rewrites /api/* y /health)
requirements.txt        ← dependencias para Vercel
manifest.webmanifest    ← PWA
sw.js                   ← service worker (offline)
```

## Desarrollo local

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -e .
alembic upgrade head
python -m app.seed            # 160 comidas + 421 catálogos
uvicorn app.main:app --port 8000
# Portal en http://localhost:8000/portal.html
```

Tests:

```bash
cd backend && source venv/bin/activate
python -m pytest tests/ -q
```

## Deploy a Vercel + Supabase

### 1. Supabase (PostgreSQL)

1. Crea un proyecto en [supabase.com](https://supabase.com) y copia la connection string del panel **Project Settings → Database** (modo "URI", con `postgresql://postgres.<ref>:PASSWORD@aws-...pooler.supabase.com:5432/postgres`).
2. En tu máquina, aplica las migraciones y seeds contra Supabase:

   ```bash
   cd backend && source venv/bin/activate
   export DATABASE_URL="postgresql+psycopg://postgres.<ref>:PASSWORD@aws-...pooler.supabase.com:5432/postgres"
   alembic upgrade head
   python -m app.seed
   ```

   > Alembic detecta `postgresql+...` y usa esa URL; en `backend/app/core/config.py` el default es SQLite local.

### 2. Vercel

1. **Importa el repo** en [vercel.com](https://vercel.com) (framework preset: *Other*).
2. **Variables de entorno** (Project → Settings → Environment Variables):
   - `DATABASE_URL` → la connection string de Supabase (igual que arriba)
   - `SECRET_KEY` → una clave aleatoria `openssl rand -hex 32`
   - `DEBUG` → `false`
   - `CORS_ORIGINS` → opcional si usas dominios aparte para frontend y API
3. Vercel sirve los estáticos desde la raíz y enruta `/api/*` y `/health` a `api/index.py` (ver `vercel.json`).
4. Verifica el deploy: `https://tu-app.vercel.app/health` → `{"status":"ok","service":"Vitaria"}`.

> El frontend (portal) y la API están en el mismo origen en producción: no se necesita CORS. En local, la API vive en `:8000` y los estáticos los sirve el propio backend.

### 3. PWA / offline

La app ya es instalable (manifest + service worker). Tras desplegar, revisa en el navegador: DevTools → Application → Manifest para verificar nombre, icono y colores.

## Funciones principales

- Dietas personalizadas: mediterránea, paleo, keto, vegana, vegetariana (motor en `mediterraneo.js`/`paleo.js` + API DB).
- Plan semanal, lista de la compra, evaluación y bienestar.
- **Registro de alimentos con escáner de código de barras** (`portal.js` → `BarcodeDetector`; fallback manual):
  - lookup local en `catalog_entries` (categoría `barcodes`)
  - si no existe, consulta Open Food Facts
  - guarda en `food_logs` (endpoint `/api/v1/food-logs`)
- Planes: Starter (6 €), Pro (20 €), Premium (40 €) — ver `landing.html`.

## Sincronización con Supabase (todo el estado del usuario)

El portal sincroniza **todo el estado del usuario** con la API, no solo la identidad:

- **Identidad**: login/registro contra `POST /api/v1/auth/login` y `/auth/register` (pasword hasheada en el backend, usuario en Supabase).
- **Datos completos** (menú semanal, consumos, agua, sueño, bienestar, evaluaciones, dieta personalizada): cada `saveUser()` del portal serializa el objeto del usuario en `users.data` (JSON) vía `PUT /api/v1/users/me`.
- **Restauración**: al hacer login (o recargar con sesión activa), `GET /api/v1/auth/me` hace merge — lo que la nube tenga y el dispositivo no, se restaura. Así los datos viajan entre dispositivos.
- **Offline**: si la API no responde (demo local sin servidor), el portal funciona con `localStorage` como antes; al volver a estar online, el último guardado se sube (debounce 700 ms).
- **Seguridad**: el hash local de contraseña (`pw`) y el marcador interno `_syncAt` nunca se envían al backend.

Flujo del sync (`portal.js`): `saveUser(u)` → `scheduleUserSync(u)` (debounce 700 ms) → `PUT /api/v1/users/me {name, plan_tier, data: u}` → El backend persiste `users.data` (JSON). `apiSyncUser()` al login/recarga restaura desde `GET /auth/me`.