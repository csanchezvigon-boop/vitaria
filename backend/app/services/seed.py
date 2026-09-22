"""Seed de catálogos: alimentos y ejercicios de ejemplo.

Se ejecuta en startup (dev) si las tablas están vacías. En producción se
poblaría con un script de migración de datos.
"""
from sqlalchemy import func, select

from app.core.database import AsyncSession, engine as _engine
from app.models.exercise import Exercise
from app.models.food import Food

FOODS = [
    # Proteicos
    ("Pechuga de pollo", "proteico", "100g", 165, 31, 0, 3.6, 0, "Magra, buena para fuerza"),
    ("Huevo entero", "proteico", "1 unidad (50g)", 78, 6.3, 0.6, 5.3, 0, "Fuente completa de proteína"),
    ("Salmón", "proteico", "100g", 208, 20, 0, 13, 0, "Rico en omega-3"),
    ("Yogur griego 0%", "lácteo", "100g", 59, 10, 3.6, 0.4, 0, "Alto en proteína"),
    ("Tofu", "proteico", "100g", 76, 8, 1.9, 4.8, 0.3, "Alternativa vegetal"),
    ("Lentejas cocidas", "proteico", "100g", 116, 9, 20, 0.4, 8, "Legumbre con fibra"),
    # Cereales / almidón
    ("Arroz integral", "cereal", "100g cocido", 112, 2.6, 24, 0.9, 1.8, ""),
    ("Avena", "cereal", "100g", 389, 17, 66, 7, 11, "En porción 30-50g"),
    ("Patata", "cereal", "100g", 77, 2, 17, 0.1, 2.2, ""),
    ("Pan integral", "cereal", "1 rebanada (30g)", 75, 3, 13, 1, 1.5, ""),
    # Vegetales
    ("Brócoli", "vegetal", "100g", 34, 2.8, 7, 0.4, 2.6, "Rico en fibra"),
    ("Espinaca", "vegetal", "100g", 23, 2.9, 3.6, 0.4, 2.2, ""),
    ("Tomate", "vegetal", "100g", 18, 0.9, 3.9, 0.2, 1.2, ""),
    ("Pimiento", "vegetal", "100g", 31, 1, 6, 0.3, 2.1, ""),
    # Fruta
    ("Plátano", "fruta", "1 unidad (120g)", 107, 1.3, 27, 0.4, 3.1, ""),
    ("Manzana", "fruta", "1 unidad (150g)", 78, 0.4, 21, 0.3, 4, ""),
    ("Naranja", "fruta", "1 unidad (130g)", 62, 1.2, 15, 0.2, 3.1, "Vitamina C"),
    ("Bayas mezcladas", "fruta", "100g", 57, 1.4, 12, 0.3, 4, "Antioxidantes"),
    # Grasas / frutos secos
    ("Aguacate", "grasa", "1/2 unidad (70g)", 112, 1.4, 6, 10, 5, "Grasa saludable"),
    ("Almendras", "grasa", "30g", 174, 6, 6, 15, 3, "Fruto seco"),
    ("Aceite de oliva", "grasa", "1 cda (10g)", 90, 0, 0, 10, 0, "Usar para cocinar"),
    # Otros
    ("Chocolate negro 85%", "otros", "20g", 120, 2, 6, 9, 2, "Ocasional"),
]

EXERCISES = [
    ("Caminar", "cardio", "full-body", 4.5, "baja", "Caminar a paso moderado"),
    ("Correr", "cardio", "full-body", 11, "alta", "Trote continuo"),
    ("Bici estática", "cardio", "pierna", 8, "media", ""),
    ("Saltar a la comba", "cardio", "full-body", 12, "alta", ""),
    ("Sentadillas", "fuerza", "pierna", 6, "media", "Piernas y glúteo"),
    ("Flexiones", "fuerza", "pecho", 6, "media", "Pecho, hombros, tríceps"),
    ("Plancha", "fuerza", "core", 4, "media", "Abdominal isométrico"),
    ("Peso muerto", "fuerza", "full-body", 7, "alta", "Posterior y espalda"),
    ("Yoga", "flexibilidad", "full-body", 3, "baja", "Movilidad y relajación"),
    ("Estiramientos", "movilidad", "full-body", 2.5, "baja", ""),
]


async def seed_catalogs(engine=None) -> None:
    eng = engine or _engine
    async with AsyncSession(eng) as session:
        food_count = await session.scalar(select(func.count()).select_from(Food))
        ex_count = await session.scalar(select(func.count()).select_from(Exercise))

        if food_count == 0:
            session.add_all(
                Food(
                    name=n, category=c, portion=p, kcal=k, protein_g=pr,
                    carbs_g=cb, fat_g=f, fiber_g=fb, notes=nt,
                )
                for (n, c, p, k, pr, cb, f, fb, nt) in FOODS
            )

        if ex_count == 0:
            session.add_all(
                Exercise(
                    name=n, type=t, muscle_group=mg, kcal_per_min=k,
                    intensity=i, instructions=ins,
                )
                for (n, t, mg, k, i, ins) in EXERCISES
            )

        if food_count == 0 or ex_count == 0:
            await session.commit()
