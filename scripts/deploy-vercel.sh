#!/usr/bin/env bash
# ============================================================
# Deploy Vitaria → Vercel + Supabase (sin depender de local)
#
# Este script automatiza la parte "pesada" (migraciones + seed
# contra tu PostgreSQL de Supabase). La parte de Vercel se hace
# por web en 2 minutos (ver pasos abajo) — es más fiable que
# la CLI interactiva.
#
# Requisito previo:
#   1. Crear proyecto en https://supabase.com
#   2. Copiar connection string (Project Settings → Database →
#      Connection string, modo "URI"):
#        postgresql://postgres.<ref>:PASSWORD@aws-0-<region>.pooler.supabase.com:5432/postgres
#
# Uso:
#   export DATABASE_URL="postgresql+psycopg://postgres.<ref>:PASSWORD@aws-...pooler.supabase.com:5432/postgres"
#   bash scripts/deploy-vercel.sh
# ============================================================
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "❌ Falta DATABASE_URL. Exporta tu connection string de Supabase primero:"
  echo '   export DATABASE_URL="postgresql+psycopg://postgres.<ref>:PASSWORD@aws-0-<region>.pooler.supabase.com:5432/postgres"'
  exit 1
fi

echo "→ Migraciones + seeds contra Supabase (puede tardar 1-2 min)..."
(
  cd backend
  python3 -m venv venv >/dev/null 2>&1 || true
  source venv/bin/activate
  pip install -q -e . -r ../requirements.txt
  export DATABASE_URL="$DATABASE_URL"
  alembic upgrade head
  python -m app.seed
)

echo ""
echo "============================================================"
echo "✅ Base de datos Supabase lista (tablas + 160 comidas + 421 catálogos)."
echo ""
echo "Ahora en VERCEL (por web, ~3 min):"
echo ""
echo " 1. https://vercel.com/new → importa el repo csanchezvigon-boop/vitaria"
echo "    (Framework preset: Other; los demás ajustes por defecto)"
echo ""
echo " 2. Project → Settings → Environment Variables, añade:"
echo "    - DATABASE_URL = $DATABASE_URL"
echo "    - SECRET_KEY   = $(openssl rand -hex 32)"
echo "    - DEBUG        = false"
echo ""
echo " 3. Deploy (Vercel detecta vercel.json: sirve estáticos y"
echo "    enruta /api/* y /health a la función serverless)."
echo ""
echo " 4. Verifica:"
echo "    - https://TU-APP.vercel.app/health      → {\"status\":\"ok\",...}"
echo "    - https://TU-APP.vercel.app/portal.html → escáner de códigos"
echo ""
echo "⚠️  Si cambias SECRET_KEY tras crear usuarios, sus tokens quedan"
echo "   inválidos (tendrán que volver a hacer login)."
echo "============================================================"