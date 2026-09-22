"""Router de planes: CRUD + generación."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser, DbSession
from app.models.plan import Plan
from app.schemas.plan import PlanCreate, PlanGenerateIn, PlanOut
from app.services.plan_generator import generate_plan

router = APIRouter(prefix="/plans", tags=["plans"])


@router.get("", response_model=list[PlanOut])
async def list_plans(current_user: CurrentUser, db: DbSession = DbSession) -> list[PlanOut]:
    result = await db.scalars(
        select(Plan).where(Plan.user_id == current_user.id).order_by(Plan.id.desc())
    )
    return list(result)


@router.get("/{plan_id}", response_model=PlanOut)
async def get_plan(plan_id: int, current_user: CurrentUser, db: DbSession = DbSession) -> PlanOut:
    plan = await db.get(Plan, plan_id)
    if not plan or plan.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    return plan


@router.post("", response_model=PlanOut, status_code=status.HTTP_201_CREATED)
async def create_plan(
    data: PlanCreate, current_user: CurrentUser, db: DbSession = DbSession
) -> PlanOut:
    plan = Plan(user_id=current_user.id, **data.model_dump())
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return plan


@router.post("/generate", response_model=PlanOut, status_code=status.HTTP_201_CREATED)
async def generate(
    data: PlanGenerateIn, current_user: CurrentUser, db: DbSession = DbSession
) -> PlanOut:
    """Genera un plan semanal usando el servicio de negocio (placeholder)."""
    plan = await generate_plan(db, current_user, data)
    return plan
