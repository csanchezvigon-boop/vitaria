"""Servicio de generaci\\u00f3n de lista de compra semanal a partir de un plan de dieta."""

from collections import defaultdict
from typing import Any
from datetime import datetime

from app.models.food import Food


_CATEGORY_GROUPS = {
    "proteico": ["carne", "pollo", "pescado", "huevo", "tofu"],
    "l\\u00e1cteo": ["leche", "queso", "yogur", "k\\u00e9fir", "nata"],
    "vegetal": ["verdura", "hortaliza", "hoja verde", "ra\\u00eds", "seta"],
    "fruta": ["fruta", "citrus", "berry", "ex\\u00f2tica"],
    "grano": ["cereal", "arroz", "pasta", "avena", "quinoa", "pan"],
    "legumbre": ["legumbre", "lenteja", "garbanzo", "frijol", "soja", "frutos secos"],
    "grasa": ["aceite", "mantequilla", "margarina", "aguacate", "frutos secos"],
    "condimento": ["especia", "hierba", "sal", "pimienta", "az\\u00fas", "miel"],
    "bebida": ["agua", "bebida vegetal", "caf\\u00e9", "t\\u00e9", "refresco"],
}


def normalize_category(bd_category):
    if not bd_category:
        return "otros"
    cat_lower = bd_category.lower().strip()
    for group, keywords in _CATEGORY_GROUPS.items():
        for kw in keywords:
            if kw in cat_lower or cat_lower in kw:
                return group
    return "otros"


def generate_shopping_list(weekly_plan, db_session):
    food_counts = defaultdict(int)
    food_kcal = defaultdict(float)
    food_protein = defaultdict(float)
    food_category_counts = defaultdict(int)

    for meal in weekly_plan.meals:
        name = meal.name
        if not name or name == "Comida balanceada":
            continue

        stmt = select(Food).where(Food.name.ilike(f"%{name}%"))
        food = db_session.execute(stmt).scalar_one_or_none()

        if food is None:
            food_counts[name] += 1
            food_kcal[name] += getattr(meal, "kcal", 200)
            food_protein[name] += getattr(meal, "protein_g", 5)
            continue

        food_counts[food.name] += 1
        food_kcal[food.name] += food.kcal
        food_protein[food.name] += food.protein_g
        norm_cat = normalize_category(food.category)
        food_category_counts[norm_cat] += 1

    groups = defaultdict(list)

    for name, count in food_counts.items():
        stmt = select(Food).where(Food.name.ilike(f"%{name}%"))
        food = db_session.execute(stmt).scalar_one_or_none()

        if food:
            norm_cat = normalize_category(food.category)
            qty = count
            total_kcal = round(food.kcal * qty, 1)
            total_protein = round(food.protein_g * qty, 1)

            groups[norm_cat].append({
                "name": name,
                "quantity": qty,
                "kcal_per_serving": food.kcal,
                "total_kcal": total_kcal,
                "protein_g": total_protein,
                "category": food.category,
            })
        else:
            groups["otros"].append({
                "name": name,
                "quantity": count,
                "kcal_per_serving": getattr(meal, "kcal", 200),
                "total_kcal": round(getattr(meal, "kcal", 200) * count, 1),
                "protein_g": round(getattr(meal, "protein_g", 5) * count, 1),
                "category": "estimated",
            })

    for group in groups:
        groups[group].sort(key=lambda x: x["name"].lower())

    total_items = sum(len(g) for g in groups.values())
    total_kcal = round(
        sum(item["total_kcal"] for g in groups.values() for item in g), 1
    )

    lst = []
    lst.append("=" * 60)
    lst.append("LISTA DE COMPRA SEMANAL - Vitaria")
    now = datetime.now()
    lst.append(now.strftime("%d/%m/%Y"))
    lst.append(f"Plan semanal: {len(weekly_plan.meals)} comidas")
    lst.append("=" * 60)

    group_order = [
        "proteico", "l\\u00e1cteo", "vegetal", "fruta", "grano",
        "legumbre", "grasa", "condimento", "bebida", "otros"
    ]

    for g in group_order:
        if g not in groups or not groups[g]:
            continue
        lst.append("")
        lst.append(f"📦 {g.upper()}")
        lst.append("-" * 40)
        for item in groups[g]:
            qty_label = f"x{item["quantity"]}" if item["quantity"] > 1 else ""
            lst.append(
                f"  ✅ {item["name"]:<30s} {qty_label:>6s} | {item["total_kcal"]:>5s} kcal | {item["protein_g"]:>4.1f}g P"
            )

    lst.append("")
    lst.append("=" * 60)
    lst.append(f"TOTAL de items diferentes: {total_items}")
    lst.append(f"Kcal estimadas semanales: {total_kcal:.0f} kcal")
    lst.append("=" * 60)

    format_text = "\\n".join(lst)

    csv_rows = []
    for g in group_order:
        if g not in groups or not groups[g]:
            continue
        for item in groups[g]:
            csv_rows.append({
                "categoria": g,
                "alimento": item["name"],
                "cantidad": item["quantity"],
                "kcal_unidad": item["kcal_per_serving"],
                "kcal_total": item["total_kcal"],
                "protein_g": item["protein_g"],
            })

    return {
        "groups": groups,
        "total_items": total_items,
        "total_estimated_kcal": total_kcal,
        "format_text": format_text,
        "csv_rows": csv_rows,
    }
