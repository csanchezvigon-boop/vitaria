"""Servicio de dieta avanzada con periodización, cronobiología y restricciones."""

import re
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_session
from app.models.food import Food
from app.models.exercise import Exercise


class PhaseType(str, Enum):
    SUPERAVIT = "superavit"
    DEFICIT = "deficit"
    MANTECION = "mantenimiento"
    REFED = "refeed"


class RestrictionType(str, Enum):
    LACTEOS = "lácteos"
    GLUTEN = "gluten"
    FRUTOS_SECOS = "frutos secos"
    PESCADO = "pescado"
    HUEVO = "huevo"
    SOJA = "soja"
    SESAMO = "sesamo"
    TODOS = "todos"


class CronobiologyPhase(str, Enum):
    MAÑANA = "mañana"
    TARDE = "tarde"
    NOCHE = "noche"


@dataclass
class MealPlan:
    """Una comida individual en el plan semanal."""
    day: int
    type: str
    name: str
    kcal: float
    protein_g: float
    carbs_g: float
    fat_g: float
    notes: str = ""


@dataclass
class WeeklyResult:
    """Resultado completo de un plan semanal."""
    meals: list[MealPlan]
    restrictions_applied: list = None
    substitutions_made: list = None
    cronobiology_notes: list = None
    phase: PhaseType = PhaseType.MANTECION
    calorie_adjustment_pct: float = 0.0


_ALLERGEN_RX: dict = {
    "lácteos": re.compile(r"yogur|queso|feta|mozzarella|requesón|leche|mantequilla|cuajada|kefir|skyr", re.I),
    "gluten": re.compile(r"pan|pasta|trigo|avena|tostada|espelta|sémola|semola|cuscús|repostería|bollería|galleta", re.I),
    "frutos secos": re.compile(r"nueces|almendra|avellana|anacardo|pistacho|cacahuete|pipas|sésamo|sesamo", re.I),
    "pescado": re.compile(r"salm[óo]n|merluza|atún|bonito|sardina|trucha|lubina|dorada|bacalao|poke|mejill|almeja|pulpo|gamba|langostino|anchoa|boquerón", re.I),
    "huevo": re.compile(r"huevo|omelette|tortilla|revuelto|mayonesa", re.I),
    "soja": re.compile(r"soja|tofu|tempeh|edamame|salsa de soja|soja|shoyu", re.I),
    "sesamo": re.compile(r"sésamo|sesamo|tahini|halva", re.I),
}


def has_restriction(name, restrictions):
    if not restrictions or RestrictionType.TODOS in restrictions:
        return False
    for r in restrictions:
        key = r.value if hasattr(r, "value") else r
        if key in _ALLERGEN_RX and _ALLERGEN_RX[key].search(name):
            return True
    return False


def substitute_food(name, restrictions, db, target_protein=None, target_kcal=None):
    base_query = db.query(Food).filter(~has_restriction(Food.name, restrictions))
    if target_protein is not None or target_kcal is not None:
        q = base_query
        if target_protein is not None:
            q = q.filter((Food.protein_g >= target_protein * 0.8) & (Food.protein_g <= target_protein * 1.2))
        if target_kcal is not None:
            q = q.filter((Food.kcal >= target_kcal * 0.85) & (Food.kcal <= target_kcal * 1.15))
        candidate = q.first()
        if candidate:
            return candidate.name, True
    simple = base_query.limit(1).first()
    if simple:
        return simple.name, True
    return name, False


def calculate_calorie_target(base_kcal, phase, user_weight_kg=None, adjust_by_weight=False):
    if phase == PhaseType.SUPERAVIT:
        factor = 1.15 if (adjust_by_weight and user_weight_kg) else 1.10
    elif phase == PhaseType.DEFICIT:
        factor = 0.85 if (adjust_by_weight and user_weight_kg) else 0.88
    elif phase == PhaseType.MANTECION:
        factor = 1.00
    elif phase == PhaseType.REFED:
        factor = 1.15
    else:
        factor = 1.0
    return round(base_kcal * factor, 1)


def get_phase_for_week(week_num, total_weeks, cycle):
    if not cycle:
        cycle = [PhaseType.SUPERAVIT, PhaseType.DEFICIT, PhaseType.MANTECION]
    idx = (week_num - 1) % len(cycle)
    return cycle[idx]


def get_cronophase(hour):
    if 6 <= hour < 12:
        return CronobiologyPhase.MAÑANA
    elif 12 <= hour < 18:
        return CronobiologyPhase.TARDE
    else:
        return CronobiologyPhase.NOCHE


def chrono_recommendations(exercise_type, exercise_hour, user_goal="mantenimiento"):
    notes = []
    phase = get_cronophase(exercise_hour)

    if exercise_type in ("cardio", "HIIT"):
        if phase == CronobiologyPhase.MAÑANA:
            notes.append("Desayuno dentro de 30 min del exercise para maximizar quema de grasa")
        if phase == CronobiologyPhase.NOCHE:
            notes.append("Evitar carbs refinados después de las 20:00 si objetivo es pérdida de grasa")
        if phase == CronobiologyPhase.TARDE:
            notes.append("Ventana de recuperación post-ejercicio: 16:00-19:00 ideal para proteína")

    elif exercise_type in ("fuerza", "peso muerto", "sentadillas"):
        if phase == CronobiologyPhase.NOCHE:
            notes.append("Cena post-fuerza dentro de las 2h del exercise para síntesis de músculo")
        if phase == CronobiologyPhase.MAÑANA:
            notes.append("Desayuno proteico por la mañana favorece ganancia de masa magra")
        if phase == CronobiologyPhase.TARDE:
            notes.append("Snack ligero 1h antes del exercise de fuerza")

    elif exercise_type in ("yoga", "flexibilidad", "pilates"):
        if phase == CronobiologyPhase.NOCHE:
            notes.append("Yoga/caminar después de la cena favorece digestión y sueño")
        if phase == CronobiologyPhase.MAÑANA:
            notes.append("Ejercicio ayunas matutino: aceite de oliva + limón, hidratación")

    if user_goal == "bajar_grasa":
        notes.append("Ventana de ayuno nocturno mínima 12h entre cena y desayuno siguiente")
    elif user_goal == "ganar_musculo":
        notes.append("3 comidas principales + snack post-ejercicio para asegurar superávit proteico diario")

    return notes


def generate_weekly_plan(user_profile, exercise_preferences=None, restrictions=None,
                         cycle_phases=None, base_kcal=None, db=None):
    if restrictions is None:
        restrictions = set()
    if cycle_phases is None:
        cycle_phases = [PhaseType.SUPERAVIT, PhaseType.DEFICIT, PhaseType.MANTECION]

    if base_kcal is None:
        w = user_profile.get("weight_kg", 70)
        h = user_profile.get("height_cm", 170)
        a = user_profile.get("age", 30)
        sex = user_profile.get("sex", "M")
        if sex == "M":
            bmr = 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a)
        else:
            bmr = 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a)
        activity_multiplier = 1.55
        base_kcal = round(bmr * activity_multiplier)

    current_phase = get_phase_for_week(1, 1, cycle_phases)
    target_kcal = calculate_calorie_target(base_kcal, current_phase, user_profile.get("weight_kg"))

    allowed_foods = db.query(Food).filter(~has_restriction(Food.name, restrictions)).all() if db else []

    user_goal = user_profile.get("goal", "mantenimiento")
    weight = user_profile.get("weight_kg", 70)
    if user_goal == "ganar_musculo":
        protein_goal_g = round(weight * 2.0)
    elif user_goal == "bajar_grasa":
        protein_goal_g = round(weight * 1.5)
    else:
        protein_goal_g = round(weight * 1.2)

    protein_target_pct = 0.25
    carbs_target_pct = 0.45
    fat_target_pct = 0.30

    protein_kcal = protein_target_pct * target_kcal
    carbs_kcal = carbs_target_pct * target_kcal
    fat_kcal = fat_target_pct * target_kcal

    protein_g_target = protein_kcal / 4
    carbs_g_target = carbs_kcal / 4
    fat_g_target = fat_kcal / 9

    protein_per_meal = protein_g_target / 4
    carbs_per_meal = carbs_g_target / 4
    fat_per_meal = fat_g_target / 4

    meal_types = ["desayuno", "almuerzo", "cena", "snack"]
    meals = []
    applied_restrictions = []
    substitutions = []
    cronobiology_notes = []

    import random
    random.seed(42)

    for day in range(1, 8):
        week_phase = get_phase_for_week(day, 7, cycle_phases)
        exercise_hour = user_profile.get("exercise_hour", 18)
        cnotes = chrono_recommendations(
            user_profile.get("preferred_exercise", "cardio"),
            exercise_hour,
            user_goal,
        )
        cronobiology_notes.extend(cnotes)

        for meal_type in meal_types:
            available = [f for f in allowed_foods if f.name not in [m.name for m in meals]]
            if not available:
                available = allowed_foods

            chosen = None
            attempts = 0
            while attempts < 20:
                candidate = random.choice(available) if available else None
                if candidate is None:
                    break

                if has_restriction(candidate.name, restrictions):
                    new_name, subbed = substitute_food(
                        candidate.name, restrictions, db,
                        target_protein=protein_per_meal,
                        target_kcal=target_kcal,
                    )
                    if subbed and new_name != candidate.name:
                        chosen = new_name
                        substitutions.append(f"Día {day} {meal_type}: sustituido {candidate.name} → {chosen}")
                        applied_restrictions.append(candidate.name)
                        break
                    else:
                        attempts += 1
                        continue

                p = candidate.protein_g or 0
                c = candidate.carbs_g or 0
                g = candidate.fat_g or 0
                k = candidate.kcal or 0

                if abs(p - protein_per_meal) / protein_per_meal < 0.8 and k <= target_kcal * 1.5:
                    chosen = candidate.name
                    break
                attempts += 1

            if chosen is None:
                chosen = allowed_foods[0].name if allowed_foods else "Comida balanceada"

            food_obj = next((f for f in allowed_foods if f.name == chosen), None)
            if food_obj:
                p = food_obj.protein_g or 0
                c = food_obj.carbs_g or 0
                g = food_obj.fat_g or 0
                k = food_obj.kcal
            else:
                p = c = g = k = 0

            portion = food_obj.portion if food_obj else "standard"
            if portion and portion != "standard":
                import re as re2
                num = re2.search(r"(\d+(?:\.\d+)?)", portion)
                if num:
                    mult = float(num.group(1))
                    k *= mult
                    p *= mult
                    c *= mult
                    g *= mult

            meal = MealPlan(
                day=day,
                type=meal_type,
                name=chosen,
                kcal=round(k, 1),
                protein_g=round(p, 1),
                carbs_g=round(c, 1),
                fat_g=round(g, 1),
                notes="",
            )
            if cnotes:
                meal.notes = "; ".join(cnotes[:2])
            meals.append(meal)

    total_kcal = sum(m.kcal for m in meals)
    adjustment = round(target_kcal / total_kcal * 100 - 100, 1) if total_kcal > 0 else 0

    return WeeklyResult(
        meals=meals,
        restrictions_applied=list(set(applied_restrictions)),
        substitutions_made=substitutions,
        cronobiology_notes=list(set(cronobiology_notes)),
        phase=current_phase,
        calorie_adjustment_pct=adjustment,
    )
