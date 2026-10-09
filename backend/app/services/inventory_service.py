"""Servicio de inventario personal y recetas por ingredientes."""

from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import Dict, List, Any, Optional
from datetime import datetime

from app.models.user import User
from app.models.food import Food


class InventoryService:
    """Servicio de gestión de inventario personal y recetas."""
    
    def __init__(self, db: Session, user: User):
        self.db = db
        self.user = user
    
    def _get_inventory(self) -> Dict[int, int]:
        """Obtener inventario actual del usuario.
        
        Estructura: {food_id: cantidad}
        Retorna diccionario con food_id -> cantidad
        """
        # Usar el campo data existente en User para almacenar inventario
        # Estructura esperada: {"inventory": {food_id: cantidad}} o solo {food_id: cantidad}
        data = self.user.data or {}
        
        # Compatibilidad con ambas estructuras
        if "inventory" in data:
            return data["inventory"]
        elif isinstance(data, dict) and any(k.isdigit() for k in data.keys()):
            # Asumir que es {food_id: cantidad} directamente
            return {int(k): v for k, v in data.items() if k.isdigit()}
        return {}
    
    def _set_inventory(self, inventory: Dict[int, int]) -> None:
        """Establecer inventario en el usuario."""
        data = self.user.data or {}
        data["inventory"] = inventory
        self.user.data = data
        self.db.add(self.user)
        self.db.commit()
    
    def get_inventory(self) -> Dict[str, Any]:
        """Retornar inventario formateado para la API."""
        inventory = self._get_inventory()
        
        # Obtener detalles de los foods en inventario
        if inventory:
            foods = self.db.query(Food).filter(Food.id.in_(inventory.keys())).all()
            food_details = {}
            for food in foods:
                food_details[food.id] = {
                    "id": food.id,
                    "name": food.name,
                    "category": food.category,
                    "kcal": food.kcal,
                    "protein_g": food.protein_g,
                    "carbs_g": food.carbs_g,
                    "fat_g": food.fat_g,
                    "fiber_g": food.fiber_g,
                    "portion": food.portion,
                    "cantidad_en_inventario": inventory.get(food.id, 0),
                }
            
            # Foods en inventario que ya no existen en la BD
            food_ids_en_inventario = set(inventory.keys())
            food_ids_en_bd = {f.id for f in foods}
            faltantes = food_ids_en_inventario - food_ids_en_bd
            
            for fid in faltantes:
                food_details[fid] = {
                    "id": fid,
                    "name": f"Food ID {fid} (ya no existe en BD)",
                    "category": "desconocido",
                    "kcal": 0,
                    "protein_g": 0,
                    "carbs_g": 0,
                    "fat_g": 0,
                    "fiber_g": 0,
                    "portion": "desconocido",
                    "cantidad_en_inventario": inventory[fid],
                }
        else:
            food_details = {}
        
        return {
            "inventario": food_details,
            "total_items": sum(inventory.values()) if inventory else 0,
            "total_diferentes": len(inventory) if inventory else 0,
            "ultima_actualizacion": self.user.updated_at.isoformat() if hasattr(self.user, 'updated_at') else None,
        }
    
    def add_to_inventory(self, food_id: int) -> Dict[str, Any]:
        """Agregar 1 unidad de un food al inventario."""
        inventory = self._get_inventory()
        
        if food_id in inventory:
            inventory[food_id] += 1
        else:
            inventory[food_id] = 1
        
        self._set_inventory(inventory)
        
        return {
            "success": True,
            "message": f"Añadido 1x {self._get_food_name(food_id)} al inventario",
            "nueva_cantidad": inventory[food_id],
            "inventario_total": sum(inventory.values()),
        }
    
    def remove_from_inventory(self, food_id: int) -> Dict[str, Any]:
        """Quitar 1 unidad de un food del inventario (consumir)."""
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
        """Establecer cantidad específica de un food en el inventario."""
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
        """Obtener nombre de un food por ID."""
        food = self.db.query(Food).filter(Food.id == food_id).first()
        try:
        # Intentar usando self.foods (MockDb/SQLite directo)
        if hasattr(self, "foods") and self.foods:
            for f in self.foods:
                if len(f) > 0 and f[0] == food_id:
                    return f[1]
        except Exception:
            pass
        # Intentar obtener de la BD SQLAlchemy
        try:
            food = self.db.query(Food).filter(Food.id == food_id).first()
            if food and hasattr(food, "name"):
                return food.name
        except Exception:
            pass
        return f"Food ID {food_id}"
        # Para cada food, verificar si el usuario tiene suficientes ingredients
        # Lógica simplificada: un food está "disponible" si el user tiene AL MENOS 1 unidad
        # de cualquier food que comparta categoría o nombre similar
        
        recetas_disponibles = []
        
        for food in all_foods:
            # Lógica: si el usuario tiene este food en su inventario, está disponible
            if food.id in inventory and inventory[food.id] >= 1:
                recetas_disponibles.append({
                    "id": food.id,
                    "name": food.name,
                    "category": food.category,
                    "kcal": food.kcal,
                    "protein_g": food.protein_g,
                    "carbs_g": food.carbs_g,
                    "fat_g": food.fat_g,
                    "fiber_g": food.fiber_g,
                    "portion": food.portion,
                    "cantidad_en_inventario": inventory[food.id],
                    "disponible": True,
                })
            else:
                # También podríamos incluir foods que tengan ingredientes superpuestos
                # con categorías del inventario, pero eso es más complejo
                # Por ahora, solo foods que el usuario tenga directamente
                pass
        
        # Ordenar por cantidad disponible (más disponible primero)
        recetas_disponibles.sort(key=lambda x: x["cantidad_en_inventario"], reverse=True)
        
        return {
            "recetas": recetas_disponibles,
            "total_recetas": len(recetas_disponibles),
            "message": f"{len(recetas_disponibles)} recetas disponibles con tu inventario",
        }
