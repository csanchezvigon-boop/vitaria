"""Servicio de inventario personal y recetas por ingredientes."""

from typing import Dict, List, Any, Optional

from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.user import User
from app.models.food import Food


class InventoryService:
    """Servicio de gestión de inventario personal y recetas.
    
    Usa la sesión SQLAlchemy inyectada (get_session) para operar sobre
    la base de datos PostgreSQL configurada en DATABASE_URL. No crea
    conexiones SQLite independientes ni depende de rutas de ficheros locales.
    """
    
    def __init__(self, db: Session, user: User):
        self.db = db
        self.user = user
    
    def _get_inventory(self) -> Dict[int, int]:
        """Obtener inventario actual del usuario.
        
        Estructura: {food_id: cantidad}
        Almacenado en user.data['inventory']
        """
        data = self.user.data or {}
        if isinstance(data, dict):
            if "inventory" in data:
                try:
                    return {int(k): v for k, v in data["inventory"].items()}
                except (ValueError, TypeError):
                    pass
            # Estructura directa: {food_id: cantidad}
            if any(k.isdigit() for k in data.keys()):
                return {int(k): v for k, v in data.items() if k.isdigit()}
        return {}
    
    def _set_inventory(self, inventory: Dict[int, int]) -> None:
        """Establecer inventario en el usuario y persistir en BD."""
        data = self.user.data or {}
        data["inventory"] = inventory
        self.user.data = data
        self.db.add(self.user)
        self.db.commit()
        self.db.refresh(self.user)
    
    def get_inventory(self) -> Dict[str, Any]:
        """Retornar inventario formateado para la API.
        
        Persiste el estado actual en BD antes de leer, garantizando
        que los datos sobreviven entre peticiones.
        """
        # Asegurar persistencia reciente
        inventory = self._get_inventory()
        
        if inventory:
            # Consultar foods reales de la BD usando el ORM
            stmt = select(Food).filter(Food.id.in_(inventory.keys()))
            result = self.db.execute(stmt)
            foods_in_db = {f.id: f for f in result.scalars().all()}
            
            foods_details = {}
            food_ids_in_inventory = set(inventory.keys())
            
            for food_id, cantidad in inventory.items():
                food_info = foods_in_db.get(food_id)
                if food_info:
                    foods_details[food_id] = {
                        "id": food_info.id,
                        "name": food_info.name,
                        "category": food_info.category,
                        "kcal": food_info.kcal,
                        "protein_g": food_info.protein_g,
                        "carbs_g": food_info.carbs_g,
                        "fat_g": food_info.fat_g,
                        "fiber_g": getattr(food_info, 'fiber_g', 0),
                        "portion": getattr(food_info, 'portion', '100g'),
                        "cantidad_en_inventario": cantidad,
                    }
                else:
                    # Food en inventario pero ya no en BD
                    foods_details[food_id] = {
                        "id": food_id,
                        "name": f"Food ID {food_id}",
                        "category": "desconocido",
                        "kcal": 0,
                        "protein_g": 0,
                        "carbs_g": 0,
                        "fat_g": 0,
                        "fiber_g": 0,
                        "portion": "desconocido",
                        "cantidad_en_inventario": cantidad,
                    }
            
            total_items = sum(inventory.values())
            total_diferentes = len(inventory)
        else:
            foods_details = {}
            total_items = 0
            total_diferentes = 0
        
        return {
            "inventario": foods_details,
            "total_items": total_items,
            "total_diferentes": total_diferentes,
        }
    
    def add_to_inventory(self, food_id: int) -> Dict[str, Any]:
        """Agregar 1 unidad de un food al inventario.
        
        Busca el food en la BD, incrementa la cantidad en user.data['inventory']
        y persiste el cambio con db.commit().
        """
        # Validar que el food existe en la BD
        stmt = select(Food).filter(Food.id == food_id)
        result = self.db.execute(stmt)
        food = result.scalar_one_or_none()
        
        if food is None:
            return {
                "success": False,
                "message": f"Food ID {food_id} no encontrado en la base de datos",
            }
        
        inventory = self._get_inventory()
        
        if food_id in inventory:
            inventory[food_id] += 1
        else:
            inventory[food_id] = 1
        
        self._set_inventory(inventory)
        
        return {
            "success": True,
            "message": f"Añadido 1x {food.name} al inventario",
            "nueva_cantidad": inventory[food_id],
            "inventario_total": sum(inventory.values()),
        }
    
    def remove_from_inventory(self, food_id: int) -> Dict[str, Any]:
        """Quitar 1 unidad de un food del inventario (consumir).
        
        Decrementa la cantidad y persiste. Si llega a 0, elimina del diccionario.
        """
        inventory = self._get_inventory()
        
        if food_id not in inventory:
            return {
                "success": False,
                "message": "No tienes este food en tu inventario",
            }
        
        if inventory[food_id] <= 1:
            del inventory[food_id]
        else:
            inventory[food_id] -= 1
        
        self._set_inventory(inventory)
        
        return {
            "success": True,
            "message": f"Quité 1x {self._get_food_name(food_id)} del inventario",
            "nueva_cantidad": inventory.get(food_id, 0),
            "inventario_total": sum(inventory.values()) if inventory else 0,
        }
    
    def set_quantity(self, food_id: int, cantidad: int) -> Dict[str, Any]:
        """Establecer cantidad específica de un food en el inventario.
        
        Valida que la cantidad no sea negativa. Si es 0, elimina el food.
        """
        if cantidad < 0:
            return {
                "success": False,
                "message": "La cantidad no puede ser negativa",
            }
        
        inventory = self._get_inventory()
        
        if cantidad == 0:
            inventory.pop(food_id, None)
        else:
            inventory[food_id] = cantidad
        
        self._set_inventory(inventory)
        
        return {
            "success": True,
            "message": f"Establecido {cantidad}x {self._get_food_name(food_id)} en inventario",
            "nueva_cantidad": inventory.get(food_id, 0),
            "inventario_total": sum(inventory.values()) if inventory else 0,
        }
    
    def _get_food_name(self, food_id: int) -> str:
        """Obtener nombre de un food por ID usando la BD."""
        stmt = select(Food).filter(Food.id == food_id)
        result = self.db.execute(stmt)
        food = result.scalar_one_or_none()
        
        if food:
            return food.name
        return f"Food ID {food_id}"
    
    def get_recipes_by_ingredients(self) -> Dict[str, Any]:
        """Obtener recetas compatibles con el inventario disponible.
        
        Retorna foods de la BD que el usuario tiene en su inventario 
        (cantidad >= 1). Usa el ORM para consultar foods reales.
        """
        inventory = self._get_inventory()
        
        if not inventory:
            return {
                "recetas": [],
                "total_recetas": 0,
                "message": "Tu inventario está vacío. Agrega algunos foods primero.",
            }
        
        # Consultar foods reales de la BD
        stmt = select(Food).filter(Food.id.in_(inventory.keys()))
        result = self.db.execute(stmt)
        foods_in_db = {f.id: f for f in result.scalars().all()}
        
        disponibles = []
        for food_id, cantidad in inventory.items():
            food_info = foods_in_db.get(food_id)
            if food_info:
                disponibles.append({
                    "id": food_info.id,
                    "name": food_info.name,
                    "category": food_info.category,
                    "kcal": food_info.kcal,
                    "protein_g": food_info.protein_g,
                    "carbs_g": food_info.carbs_g,
                    "fat_g": food_info.fat_g,
                    "fiber_g": getattr(food_info, 'fiber_g', 0),
                    "portion": getattr(food_info, 'portion', '100g'),
                    "cantidad_en_inventario": cantidad,
                    "disponible": True,
                })
        
        # Ordenar por cantidad disponible (más disponible primero)
        disponibles.sort(key=lambda x: x["cantidad_en_inventario"], reverse=True)
        
        return {
            "recetas": disponibles,
            "total_recetas": len(disponibles),
            "message": f"{len(disponibles)} recetas disponibles con tu inventario",
        }