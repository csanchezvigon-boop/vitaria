"""Router de usuarios: perfil y actualización."""
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import CurrentUser, DbSession
from app.schemas.user import UserOut, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
async def get_me(current_user: CurrentUser) -> UserOut:
    return current_user


@router.patch("/me", response_model=UserOut)
async def update_me(
    data: UserUpdate,
    current_user: CurrentUser,
    db: DbSession = DbSession,
) -> UserOut:
    if data.name is not None:
        current_user.name = data.name
    if data.plan_tier is not None:
        current_user.plan_tier = data.plan_tier
    if data.data is not None:
        current_user.data = data.data
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.put("/me", response_model=UserOut)
async def replace_me(
    data: UserUpdate,
    current_user: CurrentUser,
    db: DbSession = DbSession,
) -> UserOut:
    """Reemplazo completo del perfil + estado derivado (data).

    El portal envía todo su estado (menú, adherencia, tracking, evals...)
    serializado en `data`; el backend lo persiste como JSON.
    """
    if data.name is not None:
        current_user.name = data.name
    if data.plan_tier is not None:
        current_user.plan_tier = data.plan_tier
    current_user.data = data.data if data.data is not None else {}
    await db.commit()
    await db.refresh(current_user)
    return current_user
