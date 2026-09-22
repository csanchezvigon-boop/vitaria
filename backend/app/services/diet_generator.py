"""Generador de dietas reales desde la base de datos.

Dado un tipo de dieta, objetivo y alergias, compone un menú semanal
(7 días x desayuno/comida/cena) usando platos REALES de meal_catalog,
filtrados por etiqueta de dieta y alergenos, con macros y receta.

Reglas:
- Fuente primaria: comidas con tag == tipo.
- Sin alergenos que coincidan con las alergias del usuario.
- Rotación por semana (4 semanas disponibles) para variar el menú.
- Fallback por ingredientes afines si faltan platos del tipo exacto.
"""
import random

from sqlalchemy import select

from app.core.database import AsyncSession, engine as _engine
from app.models.meal_catalog import MealCatalog

# Tipos de dieta soportados (clave de API)
DIET_TYPES = ["equilibrada", "sin gluten", "vegetariana", "vegana", "paleo", "mediterraneo", "cetogenico"]

# Mapeo tipo -> keywords de platos suficientemente neutros (fallback)
_TYPE_FALLBACK_KEYWORDS = {
    "equilibrada": [],
    "sin gluten": [],
    "mediterraneo": ["pescado", "garbanzo", "lenteja", "tomate", "aceite de oliva"],
    "vegana": ["tofu", "hummus", "seitán", "garbanzo", "lenteja", "verdura"],
    "vegetariana": ["huevo", "queso", "tortilla", "revuelto", "crema", "verdura"],
    "paleo": ["pollo", "ternera", "cerdo", "pescado", "huevo", "verdura asada"],
    "cetogenico": ["pollo", "ternera", "cerdo", "pescado", "huevo", "aguacate"],
}

# Palabras que denotan alimento de origen animal/dudoso para dietas veganas/vegetarianas
_ANIMAL_WORDS = ("pollo", "ternera", "cerdo", "lomo", "jamón", "bacon", "salchicha", "atún", "salmón",
                 "merluza", "bacalao", "sardina", "caballa", "dorada", "lubina", "pescado", "bonito",
                 "trucha", "pavo", "conejo", "codorniz", "pato", "gamba", "langostino", "pulpo",
                 "mejillón", "almeja", "huevo", "carne", "chorizo", "morcilla", "panceta", "anchoa",
                 "tortilla", "omelette", "yogur", "leche", "queso", "feta", "mozzarella", "requesón",
                 "requeson", "kéfir", "kefir", "mantequilla", "miel", "nata", "skyr", "cuajada")

# Comidas desayuno por defecto si no hay plato etiquetado como desayuno
_DEFAULT_BREAKFASTS = {
    "equilibrada": "Avena con fruta y nueces",
    "sin gluten": "Yogur con fruta y semillas",
    "mediterraneo": "Tostada integral con tomate y aceite de oliva",
    "vegana": "Batido de avena, plátano y cacao",
    "vegetariana": "Porridge de avena y plátano",
    "paleo": "Huevos revueltos con aguacate",
    "cetogenico": "Huevos revueltos con aguacate y bacon",
}

# Regex por alergia sobre el NOMBRE del plato (equivalente a ALLERGEN_RX del portal)
_ALLERGEN_NAME_RX = {
    "Lácteos": r"yogur|queso|feta|mozzarella|kéfir|kefir|requesón|requeson|leche|mantequilla|cuajada",
    "Pescado": r"salm[oó]n|merluza|caballa|at[uú]n|bonito|sardina|trucha|lubina|dorada|pescado|bacalao|ahumado|poke|mejill|almeja|pulpo|gamba|langostino|anchoa|boquerón|boqueron",
    "Frutos secos": r"nueces|almendra|avellana|anacardo|pistacho|cacahuete|pipas|sésamo|sesamo",
    "Gluten": r"pan|pasta|trigo|avena|tostada|espelta|sémola|semola|cuscús|cuscus|repostería|bollería|galleta",
    "Huevo": r"huevo|mayonesa|omelette|tortilla|revuelto",
}
import re


class MealPick:
    """Comida lista para exponer en la dieta generada."""

    def __init__(self, name: str, kcal: float, p: float, c: float, g: float, prep: str | None = None, ingredients: list | None = None):
        self.name = name
        self.kcal = kcal
        self.p = p
        self.c = c
        self.g = g
        self.prep = prep
        self.ingredients = ingredients or []

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "kcal": round(self.kcal),
            "protein_g": round(self.p, 1),
            "carbs_g": round(self.c, 1),
            "fat_g": round(self.g, 1),
            "ingredients": self.ingredients,
            "prep": self.prep,
        }


def _has_allergen(allergens: list | None, alergias: list[str]) -> bool:
    """True si la comida contiene algún alergeno declarado del usuario."""
    if not allergens or not alergias:
        return False
    for a in alergias:
        for al in allergens:
            if a.lower() in str(al).lower():
                return True
    return False


def _name_has_allergen(name: str, alergias: list[str]) -> bool:
    """True si el NOMBRE del plato contiene ingredientes alergénicos del usuario."""
    lower = name.lower()
    for a in alergias:
        rx = _ALLERGEN_NAME_RX.get(a)
        if rx and re.search(rx, lower, re.IGNORECASE):
            return True
    return False


def _compatible_by_ingredients(meal_name: str, tipo: str) -> bool:
    """Comprueba afinidad por nombre cuando no hay tag (fallback)."""
    if tipo == "vegana":
        return not any(w in meal_name.lower() for w in _ANIMAL_WORDS)
    if tipo == "vegetariana":
        animal_no_cheese = ("pollo", "ternera", "cerdo", "lomo", "jamón", "bacon", "salchicha", "atún",
                            "salmón", "merluza", "bacalao", "sardina", "caballa", "dorada", "lubina",
                            "pescado", "bonito", "pavo", "conejo", "gamba", "langostino", "pulpo")
        return not any(w in meal_name.lower() for w in animal_no_cheese)
    if tipo in ("paleo", "cetogenico"):
        # Paleo no admite cereales/legumbres clásicos; ceto tampoco carbos altos
        bad = ("arroz", "pasta", "pan", "lenteja", "garbanzo", "quinoa", "avena", "tostada", "legumbre")
        return not any(w in meal_name.lower() for w in bad)
    return True  # resto: neutro


async def load_catalog(db: AsyncSession) -> list:
    result = await db.scalars(select(MealCatalog))
    return list(result.all())


def generate_week(catalog: list, tipo: str, alergias: list[str], semana: int = 0, n_days: int = 7) -> dict:
    """Genera un menú semanal de n_days días con desayuno/comida/cena."""
    tipo_key = "vegetariana" if tipo in ("vegetariana", "vegetariano") else \
               "vegana" if tipo in ("vegana", "vegano") else \
               "cetogenico" if tipo in ("cetogenico", "ceto", "keto") else \
               "mediterraneo" if tipo in ("mediterraneo", "mediterranea") else \
               "sin gluten" if tipo in ("sin gluten", "sin_gluten") else tipo

    # Candidatos totales y por franja
    def candidates(mt: str) -> list:
        pool: list = []
        for m in catalog:
            if mt not in (m.meal_types or []):
                continue
            if _has_allergen(m.allergens, alergias):
                continue
            if _name_has_allergen(m.name, alergias):
                continue
            tag_ok = m.tag and m.tag == tipo_key
            fallback_ok = _compatible_by_ingredients(m.name, tipo_key)
            if tag_ok or fallback_ok:
                pool.append(m)
        # Dar prioridad a los que tienen tag exacto
        pool.sort(key=lambda m: 0 if m.tag == tipo_key else 1)
        return pool

    desayunos = candidates("desayuno")
    comidas = candidates("comida")
    cenas = candidates("cena")

    dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    weeks = {"Lunes": 0, "Martes": 1, "Miércoles": 2, "Jueves": 3, "Viernes": 4, "Sábado": 5, "Domingo": 6}

    def pick(pool: list, i: int, default_name: str | None = None) -> MealPick:
        if pool:
            m = pool[(i + semana) % len(pool)]
            return MealPick(m.name, m.kcal or 0, m.protein_g or 0, m.carbs_g or 0, m.fat_g or 0, m.prep, m.ingredients)
        if default_name:
            return MealPick(default_name, 350, 12, 40, 12, "Añade tu receta favorita.", ["-"])
        return MealPick("Comida del plan", 400, 20, 45, 12, None, ["-"])

    result_days: dict = {}
    totals = {"kcal": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0}
    for dia in dias[:n_days]:
        i = weeks[dia]
        d_break = pick(desayunos, i, _DEFAULT_BREAKFASTS.get(tipo_key))
        d_meal = pick(comidas, i)
        d_cena = pick(cenas, i + 3)
        meals_day = [d_break, d_meal, d_cena]
        day_tot = {
            "kcal": sum(x.kcal for x in meals_day),
            "protein_g": round(sum(x.p for x in meals_day), 1),
            "carbs_g": round(sum(x.c for x in meals_day), 1),
            "fat_g": round(sum(x.g for x in meals_day), 1),
        }
        for k in totals:
            totals[k] += day_tot[k]
        result_days[dia] = {
            "desayuno": d_break.to_dict(),
            "comida": d_meal.to_dict(),
            "cena": d_cena.to_dict(),
            "totales": day_tot,
        }
    for k in totals:
        totals[k] = round(totals[k], 1)
    return {"dias": result_days, "totales": totals}


async def generate_diet(tipo: str, objetivo: str = "regular", alergias: list[str] | None = None,
                        semana: int = 0, n_days: int = 7, db: AsyncSession | None = None, engine=None) -> dict:
    if db is not None:
        catalog = await load_catalog(db)
    else:
        eng = engine or _engine
        async with AsyncSession(eng) as session:
            catalog = await load_catalog(session)
    rng_key = hash((tipo, objetivo, semana)) % 100000
    random.seed(rng_key)  # deterministico: misma entrada -> mismo menú
    week = generate_week(catalog, tipo, alergias or [], semana, n_days)
    return {
        "tipo": tipo,
        "objetivo": objetivo,
        "semana": semana + 1,
        "dietas_disponibles": DIET_TYPES,
        **week,
    }