"""Router de seguimiento diario: agua, calorías, peso."""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser, DbSession
from app.models.tracking import Tracking
from app.schemas.tracking import TrackingCreate, TrackingOut

router = APIRouter(prefix="/tracking", tags=["tracking"])


@router.get("", response_model=list[TrackingOut])
async def list_tracking(current_user: CurrentUser, db: DbSession = DbSession) -> list[TrackingOut]:
    result = await db.scalars(
        select(Tracking).where(Tracking.user_id == current_user.id).order_by(Tracking.date.desc())
    )
    return list(result)


@router.post("", response_model=TrackingOut, status_code=201)
async def create_tracking(
    data: TrackingCreate, current_user: CurrentUser, db: DbSession = DbSession
) -> TrackingOut:
    tracking = Tracking(user_id=current_user.id, **data.model_dump())
    db.add(tracking)
    await db.commit()
    await db.refresh(tracking)
    return tracking
