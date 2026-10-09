"""Endpoints de inventario personal y recetas por ingredientes."""

from fastapi import APIRouter, Depends
from typing import Dict, Any

from app.core.database import get_session
from app.core.deps import get_current_user
from app.models.user import User
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("", response_model=Dict[str, Any])
async def get_inventory(
    db: Any = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Obtener inventario personal del usuario.
    
    Usa la sesión DB inyectada para persistir y leer el inventario
    garantizando que los datos sobreviven entre peticiones.
    """
    inventory_service = InventoryService(db, current_user)
    return inventory_service.get_inventory()


@router.post("/{food_id}", response_model=Dict[str, Any])
async def add_to_inventory(
    food_id: int,
    db: Any = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Agregar 1 unidad de un food al inventario.
    
    Busca el food en la BD, incrementa la cantidad y persiste el cambio.
    """
    inventory_service = InventoryService(db, current_user)
    return inventory_service.add_to_inventory(food_id)


@router.delete("/{food_id}", response_model=Dict[str, Any])
async def remove_from_inventory(
    food_id: int,
    db: Any = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Quitar 1 unidad de un food del inventario (consumir).
    
    Decrementa la cantidad y persiste. Si llega a 0, elimina del diccionario.
    """
    inventory_service = InventoryService(db, current_user)
    return inventory_service.remove_from_inventory(food_id)


@router.put("/{food_id}", response_model=Dict[str, Any])
async def set_inventory_quantity(
    food_id: int,
    cantidad: int,
    db: Any = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Establecer cantidad específica de un food en el inventario.
    
    Valida que la cantidad no sea negativa. Si es 0, elimina el food.
    """
    inventory_service = InventoryService(db, current_user)
    return inventory_service.set_quantity(food_id, cantidad)


@router.get("/recipes-by-ingredients", response_model=Dict[str, Any])
async def get_recipes_by_ingredients(
    db: Any = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Obtener recetas compatibles con el inventario disponible.
    
    Retorna foods de la BD que el usuario tiene en su inventario (cantidad >= 1).
    Con inventario vacío devuelve lista vacía sin error.
    """
    inventory_service = InventoryService(db, current_user)
    return inventory_service.get_recipes_by_ingredients()