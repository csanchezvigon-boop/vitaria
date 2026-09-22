"""Servicio de generación de planes (lógica de negocio).

Placeholder: genera un plan de 7 días con comidas de ejemplo por proporciones.
Sustituir por el generador real (IA o reglas) cuando esté listo.
"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser
from app.models.meal import Meal
from app.models.plan import Plan
from app.schemas.plan import PlanGenerateIn

# Plantilla simple de comidas por tipo (ilustrativa)
_TEMPLATE: dict[str, list[str]] = {
    "desayuno": ["Avena con fruta y nueces", "Tostada integral con aguacate", "Yogur con granola"],
    "almuerzo": ["Plato de proporciones: 1/2 verdura, 1/4 proteína, 1/4 cereal", "Ensalada completa + legumbre", "Bowl de quinoa y pollo"],
    "cena": ["Pescado al horno + verduras", "Plato único de legumbres", "Salteado de tofu y arroz"],
    "snack": ["Fruta de temporada", "Puñado de frutos secos", "Yogur natural"],
}


async def generate_plan(
    db: AsyncSession, current_user: CurrentUser, data: PlanGenerateIn
) -> Plan:
    plan = Plan(
        user_id=current_user.id,
        objective=data.objective,
        diet_type=data.diet_type,
        notes="Plan generado automáticamente (placeholder).",
    )
    db.add(plan)
    await db.flush()  # plan.id disponible

    types = ["desayuno", "almuerzo", "cena", "snack"]
    for day in range(1, data.days + 1):
        for t in types:
            name = _TEMPLATE[t][(day + types.index(t)) % len(_TEMPLATE[t])]
            meal = Meal(plan_id=plan.id, day=day, type=t, name=name)
            db.add(meal)

    await db.commit()
    await db.refresh(plan)
    return plan
