"""Router de registro de alimentos (food logs) + escaneo de código de barras."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser, DbSession
from app.models.food_log import FoodLog
from app.schemas.food_log import FoodLogCreate, FoodLogOut, BarcodeResult
from app.services.barcode_lookup import lookup_barcode

router = APIRouter(prefix="/food-logs", tags=["food-logs"])


@router.get("", response_model=list[FoodLogOut])
async def list_food_logs(
    current_user: CurrentUser,
    db: DbSession = DbSession,
    limit: int = Query(default=50, le=200),
) -> list[FoodLogOut]:
    result = await db.scalars(
        select(FoodLog)
        .where(FoodLog.user_id == current_user.id)
        .order_by(FoodLog.date.desc())
        .limit(limit)
    )
    return list(result)


@router.post("", response_model=FoodLogOut, status_code=201)
async def create_food_log(
    data: FoodLogCreate, current_user: CurrentUser, db: DbSession = DbSession
) -> FoodLogOut:
    log = FoodLog(user_id=current_user.id, **data.model_dump())
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


@router.delete("/{log_id}", status_code=204)
async def delete_food_log(
    log_id: int, current_user: CurrentUser, db: DbSession = DbSession
) -> None:
    log = await db.get(FoodLog, log_id)
    if not log or log.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    await db.delete(log)
    await db.commit()


@router.get("/barcode/{barcode}", response_model=BarcodeResult | None)
async def scan_barcode(
    barcode: str, db: DbSession = DbSession
) -> BarcodeResult | None:
    """Busca un código de barras (local → Open Food Facts)."""
    result = await lookup_barcode(db, barcode)
    if not result:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return result