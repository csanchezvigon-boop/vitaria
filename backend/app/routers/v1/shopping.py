"""Router de lista de la compra."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser, DbSession
from app.models.shopping import ShoppingItem
from app.schemas.tracking import ShoppingItemCreate, ShoppingItemOut, ShoppingItemUpdate

router = APIRouter(prefix="/shopping", tags=["shopping"])


@router.get("", response_model=list[ShoppingItemOut])
async def list_items(current_user: CurrentUser, db: DbSession = DbSession) -> list[ShoppingItemOut]:
    result = await db.scalars(
        select(ShoppingItem).where(ShoppingItem.user_id == current_user.id).order_by(ShoppingItem.id)
    )
    return list(result)


@router.post("", response_model=ShoppingItemOut, status_code=status.HTTP_201_CREATED)
async def add_item(
    data: ShoppingItemCreate, current_user: CurrentUser, db: DbSession = DbSession
) -> ShoppingItemOut:
    item = ShoppingItem(user_id=current_user.id, **data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=ShoppingItemOut)
async def update_item(
    item_id: int,
    data: ShoppingItemUpdate,
    current_user: CurrentUser,
    db: DbSession = DbSession,
) -> ShoppingItemOut:
    item = await db.get(ShoppingItem, item_id)
    if not item or item.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: int, current_user: CurrentUser, db: DbSession = DbSession
) -> None:
    item = await db.get(ShoppingItem, item_id)
    if not item or item.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    await db.delete(item)
    await db.commit()
