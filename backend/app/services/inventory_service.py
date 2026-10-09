"""Servicio de inventario personal y recetas por ingredientes."""

import sqlite3
import os
from typing import Dict, List, Any

from app.models.user import User


# Base de datos Vitaria - path absoluto
VITARIA_DB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    'vitaria.db'
)


def _get_db_connection():
    """Obtener conexión SQLite a la base de datos Vitaria."""
    # Usar la ruta absoluta al repositorio
    db_path = os.path.abspath(VITARIA_DB_PATH)
    if not os.path.exists(db_path):
        # Fallback: buscar en directorios comunes
        for alt_path in [
            '/Users/sergiodelvallebusto/nutricion/backend/vitaria.db',
            '/Users/sergiodelvallebusto/nutricion/vitaria.db',
        ]:
            if os.path.exists(alt_path):
                db_path = alt_path
                break
    return sqlite3.connect(db_path)


def _get_food_details(food_id: int) -> Optional[Dict[str, Any]]:
    """Obtener detalles de un food por ID usando SQLite directo."""
    conn = _get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            'SELECT id, name, category, kcal, protein_g, carbs_g, fat_g, portion FROM foods WHERE id = ?',
            (food_id,)
        )
        row = cursor.fetchone()
        if row:
            return {
                "id": row[0],
                "name": row[1],
                "category": row[2],
                "kcal": row[3],
                "protein_g": row[4],
                "carbs_g": row[5],
                "fat_g": row[6],
                "portion": row[7],
            }
    finally:
        conn.close()
    return None


def _get_all_foods() -> List[Dict[str, Any]]:
    """Obtener todos los foods de la BD."""
    conn = _get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            'SELECT id, name, category, kcal, protein_g, carbs_g, fat_g, portion FROM foods'
        )
        rows = cursor.fetchall()
        return [
            {
                "id": row[0],
                "name": row[1],
                "category": row[2],
                "kcal": row[3],
                "protein_g": row[4],
                "carbs_g": row[5],
                "fat_g": row[6],
                "portion": row[7],
            }
            for row in rows
        ]
    finally:
        conn.close()


class InventoryService:
    """Servicio de gestión de inventario personal y recetas."""

    def __init__(self, user: User):
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
            if any(k.isdigit() for k in data.keys()):
                return {int(k): v for k, v in data.items() if k.isdigit()}
        return {}

    def _set_inventory(self, inventory: Dict[int, int]) -> None:
        """Establecer inventario en el usuario."""
        data = self.user.data or {}
        data["inventory"] = inventory
        self.user.data = data
        # No commit aquí - el caller maneja la persistencia

    def get_inventory(self) -> Dict[str, Any]:
        """Retornar inventario formateado para la API."""
        inventory = self._get_inventory()

        if inventory:
            foods_details = {}
            all_foods = _get_all_foods()
            food_ids_in_inventory = set(inventory.keys())
            food_ids_in_bd = {f["id"] for f in all_foods}

            for food_id, cantidad in inventory.items():
                food_info = None
                for f in all_foods:
                    if f["id"] == food_id:
                        food_info = f
                        break

                if food_info:
                    foods_details[food_id] = {
                        "id": food_info["id"],
                        "name": food_info["name"],
                        "category": food_info["category"],
                        "kcal": food_info["kcal"],
                        "protein_g": food_info["protein_g"],
                        "carbs_g": food_info["carbs_g"],
                        "fat_g": food_info["fat_g"],
                        "portion": food_info["portion"],
                        "cantidad_en_inventario": cantidad,
                    }
                else:
                    foods_details[food_id] = {
                        "id": food_id,
                        "name": f"Food ID {food_id}",
                        "category": "desconocido",
                        "kcal": 0,
                        "protein_g": 0,
                        "carbs_g": 0,
                        "fat_g": 0,
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
        """Agregar 1 unidad de un food al inventario."""
        inventory = self._get_inventory()

        if food_id in inventory:
            inventory[food_id] += 1
        else:
            inventory[food_id] = 1

        self._set_inventory(inventory)

        food_name = self._get_food_name(food_id)
        return {
            "success": True,
            "message": f"Añadido 1x {food_name} al inventario",
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

        food_name = self._get_food_name(food_id)
        return {
            "success": True,
            "message": f"Quité 1x {food_name} del inventario",
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

        food_name = self._get_food_name(food_id)
        return {
            "success": True,
            "message": f"Establecido {cantidad}x {food_name} en inventario",
            "nueva_cantidad": inventory.get(food_id, 0),
            "inventario_total": sum(inventory.values()) if inventory else 0,
        }

    def _get_food_name(self, food_id: int) -> str:
        """Obtener nombre de un food por ID."""
        food_info = _get_food_details(food_id)
        if food_info:
            return food_info["name"]
        return f"Food ID {food_id}"

    def get_recipes_by_ingredients(self) -> Dict[str, Any]:
        """Obtener recetas compatibles con el inventario disponible."""
        inventory = self._get_inventory()

        if not inventory:
            return {
                "recetas": [],
                "total_recetas": 0,
                "message": "Tu inventario está vacío. Agrega algunos foods primero.",
            }

        all_foods = _get_all_foods()

        disponibles = []
        for food in all_foods:
            food_id = food["id"]
            if food_id in inventory and inventory[food_id] >= 1:
                disponibles.append({
                    "id": food["id"],
                    "name": food["name"],
                    "category": food["category"],
                    "kcal": food["kcal"],
                    "protein_g": food["protein_g"],
                    "carbs_g": food["carbs_g"],
                    "fat_g": food["fat_g"],
                    "fiber_g": food.get("fiber_g", 0),
                    "portion": food["portion"],
                    "cantidad_en_inventario": inventory[food_id],
                    "disponible": True,
                })

        disponibles.sort(key=lambda x: x["cantidad_en_inventario"], reverse=True)

        return {
            "recetas": disponibles,
            "total_recetas": len(disponibles),
            "message": f"{len(disponibles)} recetas disponibles con tu inventario",
        }
