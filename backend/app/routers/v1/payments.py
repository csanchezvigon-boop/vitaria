"""Router de pagos (Stripe placeholder).

Hasta configurar Stripe, este router valida la estructura y deja el
webhook listo para confirmación de suscripción. Recuerda: el portal HTML
muestra planes 6/20/30 € (ver index.html FAQ JSON-LD).
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.deps import CurrentUser, DbSession

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/checkout")
async def create_checkout(
    tier: str, current_user: User = CurrentUser, db: DbSession = DbSession
) -> dict:
    """Crea una sesión de checkout de Stripe (placeholder)."""
    if tier not in {"starter", "pro", "premium"}:
        raise HTTPException(status_code=400, detail="Tier inválido")
    # TODO: integrar Stripe Checkout Session con settings.STRIPE_SECRET_KEY
    return {
        "status": "pending_stripe_integration",
        "tier": tier,
        "prices_eur": {"starter": 6, "pro": 20, "premium": 30},
        "note": "Implementar sesión de checkout real con Stripe.",
    }


@router.post("/webhook")
async def stripe_webhook(request: Request, db: DbSession = DbSession) -> dict:
    """Webhook de Stripe para confirmar pagos (placeholder)."""
    # TODO: verificar firma con settings.STRIPE_WEBHOOK_SECRET y actualizar plan_tier
    payload = await request.body()
    return {"received": len(payload), "status": "webhook_placeholder"}
