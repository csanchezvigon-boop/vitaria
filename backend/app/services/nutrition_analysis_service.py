"""Servicio de análisis nutricional deficiencias vs RDI (Valores Diarios de Referencia)."""

from enum import Enum
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_session
from app.models.food import Food


class Sex(str, Enum):
    MASCULINO = "M"
    FEMENINO = "F"


class Nutrient(Enum):
    CALORIES = "kcal"
    PROTEIN = "protein_g"
    CARBS = "carbs_g"
    FAT = "fat_g"
    FIBER = "fiber_g"
    IRON = "iron_mg"
    CALCIUM = "calcium_mg"
    VITAMIN_C = "vitamin_c_mg"
    OMEGA3 = "omega3_g"


_RDI_TABLE: dict = {
    ("M", "18-30"): {
        "kcal": 2500, "protein_g": 55, "carbs_g": 300, "fat_g": 70,
        "fiber_g": 30, "iron_mg": 8, "calcium_mg": 1000,
        "vitamin_c_mg": 90, "omega3_g": 1.6,
    },
    ("M", "31-50"): {
        "kcal": 2400, "protein_g": 55, "carbs_g": 300, "fat_g": 70,
        "fiber_g": 30, "iron_mg": 8, "calcium_mg": 1000,
        "vitamin_c_mg": 90, "omega3_g": 1.6,
    },
    ("F", "18-30"): {
        "kcal": 2000, "protein_g": 46, "carbs_g": 280, "fat_g": 70,
        "fiber_g": 25, "iron_mg": 18, "calcium_mg": 1000,
        "vitamin_c_mg": 75, "omega3_g": 1.1,
    },
    ("F", "31-50"): {
        "kcal": 1800, "protein_g": 46, "carbs_g": 280, "fat_g": 70,
        "fiber_g": 25, "iron_mg": 18, "calcium_mg": 1000,
        "vitamin_c_mg": 75, "omega3_g": 1.1,
    },
}


def get_rdr(sex, age_range):
    return _RDI_TABLE.get((sex, age_range), _RDI_TABLE[("M", "18-30")])


def age_to_range(age):
    return "18-30" if age <= 30 else "31-50"


def analyze_deficiencies(sex, age, daily_intake, db=None):
    age_range = age_to_range(age)
    rdr = get_rdr(sex, age_range)

    deficiencies = []
    recommendations = []

    for nutrient in Nutrient:
        rdr_val = rdr.get(nutrient)
        if rdr_val is None:
            continue
        intake_val = daily_intake.get(nutrient.value, 0)

        if intake_val < rdr_val:
            pct_def = round((1 - intake_val / rdr_val) * 100, 1)
            deficiencies.append(
                {
                    "nutrient": nutrient.value,
                    "required": rdr_val,
                    "intake": intake_val,
                    "deficiency_pct": pct_def,
                    "severity": "alta" if pct_def >= 30 else "moderada" if pct_def >= 15 else "leve",
                }
            )
            rich_foods = (
                db.query(Food)
                .filter(getattr(Food, nutrient.value) > 0)
                .order_by(getattr(Food, nutrient.value).desc())
                .limit(5)
                .all()
            )
            if rich_foods:
                top = rich_foods[0]
                diff = rdr_val - intake_val
                factors = {
                    Nutrient.IRON: {"lentejas": 6.5, "carne": 3.0, "spinach": 2.7},
                    Nutrient.CALCIUM: {"leche": 300, "queso": 200, "sardinas": 382},
                    Nutrient.VITAMIN_C: {"pimiento": 150, "naranja": 70, "kiwi": 93},
                    Nutrient.PROTEIN: {"pechuga": 31, "huevo": 6.3, "salmón": 20},
                    Nutrient.FIBER: {"avena": 10, "lentejas": 8, "brócoli": 5},
                }
                factor_dict = factors.get(nutrient, {})
                amount_needed = "cantidad variable"
                if factor_dict:
                    best_food = max(factor_dict, key=factor_dict.get)
                    amount_per_serving = factor_dict[best_food]
                    servings = diff / amount_per_serving
                    amount_needed = f"≈ {servings:.1f} ración(es) de {best_food}"
                recommendations.append(
                    {
                        "nutrient": nutrient.value,
                        "suggested_food": top.name,
                        "amount_needed_approx": amount_needed,
                        "provides": round(getattr(top, nutrient.value), 1),
                        "extra_kcal": top.kcal,
                    }
                )

    excesses = []
    for nutrient in Nutrient:
        rdr_val = rdr.get(nutrient)
        if rdr_val is None:
            continue
        intake_val = daily_intake.get(nutrient.value, 0)
        if intake_val > rdr_val * 1.5:
            excesses.append(
                {
                    "nutrient": nutrient.value,
                    "intake": intake_val,
                    "rdr": rdr_val,
                    "excess_pct": round((intake_val / rdr_val - 1) * 100, 1),
                }
            )

    n_def = len(deficiencies)
    summary_parts = []
    if n_def == 0:
        summary_parts.append("No hay deficiencias detectadas - intake cubre VDR")
    elif n_def == 1:
        d = deficiencies[0]
        summary_parts.append(f"Deficiencia leve de {d['nutrient']} ({d['deficiency_pct']}% debajo VDR)")
    else:
        summary_parts.append(f"{n_def} deficiencias nutricionales detectadas")
        for d in deficiencies[:3]:
            summary_parts.append(f"  - {d['nutrient']}: {d['deficiency_pct']}% debajo VDR")

    return {
        "deficiencies": deficiencies,
        "excesses": excesses,
        "recommendations": recommendations,
        "summary": " | ".join(summary_parts),
    }
