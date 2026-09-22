"""Seed de conocimiento nutricional migrado desde portal.html.

Lee app/data/vitaria_portal_data.json (extraído del portal con node) y
puebla las tablas meal_catalog y catalog_entries. Idempotente: solo inserta
si están vacías.
"""
import json
import os

from sqlalchemy import func, select

from app.core.database import AsyncSession, engine as _engine
from app.models.catalog import CatalogEntry
from app.models.meal_catalog import MealCatalog

_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "vitaria_portal_data.json")


def _load():
    with open(_DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


async def seed_nutrition(engine=None) -> None:
    eng = engine or _engine
    async with AsyncSession(eng) as session:
        meals_n = await session.scalar(select(func.count()).select_from(MealCatalog))
        cat_n = await session.scalar(select(func.count()).select_from(CatalogEntry))
        if meals_n > 0 and cat_n > 0:
            return

        data = _load()

        # ---- 1) Catálogo de comidas (MealCatalog) ----
        if meals_n == 0:
            ndata = data.get("NDATA", {})          # nombre -> {k,p,c,g}
            details = {**data.get("MEAL_DETAILS", {}), **data.get("W_MEAL_DETAILS", {})}
            allergens = data.get("ALLERGENS", {})
            ingredients = data.get("INGREDIENTS", {})
            meals_map = data.get("MEALS", {})       # tipo -> {desayuno:[],comida:[],cena:[]}

            meal_types: dict[str, list] = {}
            for tipo, m in meals_map.items():
                for mt, lista in m.items():
                    for name in lista:
                        meal_types.setdefault(name, [])
                        if mt not in meal_types[name]:
                            meal_types[name].append(mt)

            seen = set()
            # Universo: NDATA (macros) + detalles + platos referenciados en MEALS
            all_names = list(ndata.keys()) + list(details.keys())
            for tipo, m in meals_map.items():
                for mt, lista in m.items():
                    all_names.extend(lista)
            for name in all_names:
                if name in seen:
                    continue
                seen.add(name)
                macros = ndata.get(name, {})
                det = details.get(name, {})
                session.add(
                    MealCatalog(
                        name=name,
                        meal_types=meal_types.get(name, []),
                        kcal=macros.get("k"),
                        protein_g=macros.get("p", 0),
                        carbs_g=macros.get("c", 0),
                        fat_g=macros.get("g", 0),
                        ingredients=ingredients.get(name),
                        prep=det.get("prep"),
                        note=det.get("note"),
                        allergens=allergens.get(name),
                        tag=det.get("tag"),
                    )
                )

        # ---- 2) Catálogo genérico (CatalogEntry) ----
        if cat_n == 0:
            entries: list[CatalogEntry] = []

            # Menús semanales
            for objective, src in (("reset", "WEEKS"), ("weight", "WEIGHT_WEEKS")):
                if data.get(src):
                    entries.append(CatalogEntry(category="menu_templates", key=objective, data=data[src]))
            # Base de reconocimiento de alimentos
            for k, v in data.get("FOOD_DB", {}).items():
                entries.append(CatalogEntry(category="food_recognition", key=k, data=v))
            # Grupos de sustitución
            for k, v in data.get("SUBSTITUTION_GROUPS", {}).items():
                entries.append(CatalogEntry(category="substitution_groups", key=k, data=v))
            # Listas de la compra
            if data.get("SHOP_RESET_CATS"):
                entries.append(CatalogEntry(category="shopping_categories", key="reset", data=data["SHOP_RESET_CATS"]))
            if data.get("SHOP_PESO_CATS"):
                entries.append(CatalogEntry(category="shopping_categories", key="peso", data=data["SHOP_PESO_CATS"]))
            if data.get("PESO_PAUTAS"):
                entries.append(CatalogEntry(category="shopping_categories", key="peso_pautas", data=data["PESO_PAUTAS"]))
            if data.get("SHOP_DISPLAY"):
                entries.append(CatalogEntry(category="shopping_categories", key="display_map", data=data["SHOP_DISPLAY"]))
            if data.get("SHOP_SKIP"):
                entries.append(CatalogEntry(category="shopping_categories", key="skip", data=data["SHOP_SKIP"]))
            # Planes de dieta (MEALS)
            for k, v in data.get("MEALS", {}).items():
                entries.append(CatalogEntry(category="diet_plans", key=k, data=v))
            # Alérgenos
            for a in data.get("ALERGIAS", []):
                entries.append(CatalogEntry(category="allergies", key=a, data={}))
            # Planes de precio
            for k, v in data.get("PLANS", {}).items():
                entries.append(CatalogEntry(category="plans", key=k, data=v))
            # Metadata variada
            for meta_key in ("GROUP_NAMES", "MEAL_LABELS", "MEAL_ICONS", "DIAS", "ACT_FACTORS",
                             "DAY_TAGS", "FIXED_WEEK", "DERIVED", "ALLERGEN_RX", "DEFAULT_NDATA",
                             "EVAL_Q", "EVAL_SHORT", "SUP"):
                if data.get(meta_key) is not None:
                    entries.append(CatalogEntry(category="meal_meta", key=meta_key, data=data[meta_key]))

            session.add_all(entries)

        await session.commit()
