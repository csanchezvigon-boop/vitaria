"""Seed de ESCALA: amplía la base de datos con más contenido nutricional.

Idempotente (INSERT ... ON CONFLICT DO NOTHING): añade contenido nuevo sin
borrar ni duplicar lo existente.

1) Alimentos nuevos en food_recognition (macros k/p/c/g por 100 g).
2) Etiquetado de comidas existentes sin tag (heurística por nombre).
3) Comidas nuevas en meal_catalog con tag de dieta, ingredientes y prep.
4) Grupos de sustitución adicionales (substitution_groups).
"""
from sqlalchemy import select, update

from app.core.database import AsyncSession, engine as _engine
from app.core.upsert import portable_insert
from app.models.catalog import CatalogEntry
from app.models.meal_catalog import MealCatalog

# (nombre, kcal, proteinas, carbos, grasas) por 100 g — valores aproximados reales
FOOD_EXTRA: dict[str, tuple] = {
    # Frutas
    "mandarina": (53, 0.8, 13.3, 0.3), "arándanos": (57, 0.7, 14.5, 0.3),
    "frambuesas": (52, 1.2, 12, 0.7), "moras": (43, 1.4, 10, 0.5),
    "albaricoque": (48, 1.4, 11, 0.4), "nectarina": (44, 1.1, 10.5, 0.3),
    "caqui": (70, 0.6, 18.6, 0.2), "granada": (83, 1.7, 19, 1.2),
    "higo": (74, 0.8, 19, 0.3), "pomelo": (42, 0.8, 10.7, 0.2),
    "papaya": (43, 0.5, 11, 0.3), "membrillo": (38, 0.4, 10, 0.1),
    "chirimoya": (75, 1.6, 17.7, 0.6), "maracuyá": (97, 2.2, 23, 0.7),
    "coco": (354, 3.3, 15.2, 33.5), "coco rallado": (660, 6.9, 23.7, 64.5),
    "uvas pasas": (299, 3.1, 79, 0.5), "dátiles medjool": (277, 1.8, 75, 0.2),
    # Verduras y hortalizas
    "espárragos": (20, 2.2, 3.9, 0.1), "endivia": (17, 1.3, 3.3, 0.2),
    "escarola": (17, 1.3, 3.3, 0.2), "rabanitos": (16, 0.7, 3.4, 0.1),
    "nabo": (28, 0.9, 6.4, 0.1), "coles de bruselas": (43, 3.4, 9, 0.3),
    "repollo": (25, 1.3, 5.8, 0.1), "rúcula": (25, 2.6, 3.7, 0.7),
    "canónigos": (20, 2, 3.2, 0.4), "acelgas": (19, 1.8, 3.7, 0.2),
    "pimiento verde": (20, 0.9, 4.6, 0.2), "guindilla": (40, 1.9, 8.8, 0.4),
    "jalapeño": (29, 0.9, 6.5, 0.4), "chalota": (72, 2.5, 16.8, 0.1),
    "cebolleta": (32, 1.8, 7.3, 0.2), "jengibre": (80, 1.8, 17.8, 0.8),
    "cúrcuma": (354, 7.8, 65, 3.3), "orégano": (306, 11, 69, 10),
    "romero": (131, 3.3, 20.7, 5.9), "tomillo": (101, 5.6, 24.5, 1.7),
    "albahaca": (23, 3.1, 2.7, 0.6), "perejil": (36, 3, 6.3, 0.8),
    "maíz dulce": (86, 3.3, 19, 1.4), "boniato asado": (90, 2, 20.7, 0.2),
    # Legumbres, cereales y pseudocereales
    "lentejas rojas": (358, 25, 63, 1), "judías rojas": (337, 22, 62, 1.5),
    "soja texturizada": (340, 50, 30, 1.2), "seitán": (147, 25, 7, 2),
    "tempeh": (193, 19, 11, 11), "cuscús": (376, 13, 77, 0.6),
    "bulgur": (342, 12.3, 75.9, 1.3), "amaranto": (371, 13.6, 65, 7),
    "mijo": (378, 11, 72.8, 4.2), "trigo sarraceno": (343, 13.3, 71.5, 3.4),
    "espelta": (338, 15, 70, 2.4), "sémola de trigo": (360, 12.7, 73, 1.3),
    "tapioca": (358, 0.2, 88.7, 0.2), "quinoa roja": (368, 14.1, 64, 6.1),
    "copos de avena integrales": (379, 13.9, 67.7, 7.2), "pasta de lentejas": (344, 25, 53, 1.9),
    "pan de centeno": (259, 8.5, 48, 3.3), "pan de espelta": (258, 9.4, 49, 2.6),
    # Proteínas marinas
    "dorada": (96, 20, 0, 2), "lubina": (97, 19.5, 0, 2.2),
    "rodaballo": (95, 18.5, 0, 2.6), "rape": (76, 16, 0, 1.2),
    "gallo": (92, 19.5, 0, 1.5), "lenguado": (89, 17, 0, 2.3),
    "besugo": (101, 19, 0, 2.8), "pulpo": (82, 14.9, 0, 1),
    "mejillones": (86, 11.9, 3.7, 2.2), "almejas": (74, 12.8, 2.6, 1),
    "navajas": (80, 14, 0, 1.4), "berberechos": (70, 12, 2, 1.2),
    "vieiras": (88, 16.8, 2.4, 0.8), "anchoas": (131, 20.4, 0, 4.8),
    "boquerones": (131, 20.4, 0, 4.8), "trucha": (96, 19.4, 0, 2.1),
    "pez espada": (121, 19.6, 0, 4.5), "caballa": (205, 18.6, 0, 13.9),
    # Carnes y embutidos
    "conejo": (136, 20, 0, 5.6), "codorniz": (134, 22, 0, 4.5),
    "pato": (337, 18.3, 0, 28.4), "pavo": (135, 24, 0, 3.8),
    "pechuga de pavo": (111, 23, 0, 1.9), "solomillo de cerdo": (143, 21, 0, 6),
    "secreto ibérico": (239, 19, 0, 18), "presa ibérica": (220, 19, 0, 16),
    "jamón ibérico": (281, 30, 0, 17.5), "bacon": (417, 12.6, 0.5, 40),
    "panceta": (518, 9, 0.3, 53), "chorizo ibérico": (455, 27, 2, 38),
    "salchichón": (431, 25, 2, 35), "lomo embuchado": (247, 35, 0.5, 11),
    # Lácteos y alternativas
    "leche de cabra": (69, 3.6, 4.5, 4.1), "nata": (337, 2, 3, 35),
    "crème fraîche": (292, 2.2, 4, 29), "queso de cabra": (364, 21, 2.5, 30),
    "queso azul": (353, 21, 2.3, 28.7), "parmesano": (431, 38, 4, 29),
    "emmental": (380, 27, 3, 29), "gouda": (356, 25, 2.2, 27),
    "brie": (334, 20.8, 0.5, 27.7), "camembert": (300, 20, 0.5, 24),
    "kéfir": (40, 3.5, 3.5, 1), "yogur skyr": (59, 10, 3.6, 0.2),
    "requesón": (98, 11, 3.4, 4.3), "cuajada": (110, 4, 10, 6),
    "mató": (174, 9, 3, 14), "leche condensada": (321, 7.9, 54.4, 8.7),
    "bebida de coco": (53, 0.2, 2.9, 4.7), "bebida de arroz": (47, 0.1, 9.2, 1),
    "bebida de espelta": (50, 1, 10, 0.5), "bebida de avellana": (55, 0.5, 6, 3),
    # Frutos secos y semillas
    "pistachos": (560, 20.6, 16.8, 45), "anacardos": (553, 18.2, 30.2, 43.8),
    "nueces de macadamia": (718, 7.9, 13.8, 75.8), "nueces pecan": (691, 9.2, 13.9, 72),
    "pipas de calabaza": (559, 30.2, 10.7, 49), "semillas de lino": (534, 18.3, 28.9, 42.2),
    "semillas de amapola": (525, 18, 28, 42), "semillas de cáñamo": (553, 31.6, 8.7, 48.8),
    "sésamo": (573, 16.9, 23.4, 49.7), "tahini": (595, 17, 21, 54),
    "crema de cacahuete": (588, 25, 20, 50), "mantequilla de almendras": (614, 21, 19, 56),
    # Bebidas y otros
    "agua": (0, 0, 0, 0), "agua con gas": (0, 0, 0, 0),
    "té verde": (0, 0, 0, 0), "té rojo": (0, 0, 0, 0),
    "café descafeinado": (2, 0.1, 0, 0), "manzanilla": (0, 0, 0, 0),
    "vermut": (140, 0, 14, 0), "cava": (75, 0.1, 1.5, 0), "sidra": (45, 0, 4.8, 0),
    "cerveza sin alcohol": (25, 0.3, 4.8, 0), "kombucha": (15, 0, 3, 0),
    "batido de proteínas": (70, 25, 3, 0.5), "albóndigas": (250, 18, 6, 17),
    # Especias y condimentos
    "canela": (247, 4, 81, 1.2), "pimentón": (282, 14.8, 54, 13),
    "comino": (375, 17.8, 44, 22.3), "curry": (325, 14, 56, 14),
    "nuez moscada": (525, 5.8, 49, 36), "clavo": (274, 6, 66, 13),
    "cardamomo": (311, 10.8, 68.5, 6.7), "anís estrellado": (337, 18, 50, 16),
    "vainilla": (288, 0.1, 13, 0.1), "azafrán": (310, 11.4, 65, 5.9),
    "vinagre de manzana": (21, 0, 0.9, 0), "vinagre balsámico": (88, 0.5, 17, 0),
    "vinagre de jerez": (18, 0, 0.9, 0), "miso": (199, 12, 26, 6),
    "tamari": (60, 10, 5, 0), "pimienta negra": (251, 10.4, 64, 3.3),
    "sal": (0, 0, 0, 0), "miel": (304, 0.3, 82.4, 0),
}

# Platos nuevos: (nombre, meal_types, kcal, p, c, g, fibra, ingredientes, prep, alergenos, tag)
MEALS_EXTRA: list[tuple] = [
    # --- Mediterránea ---
    ("Dorada al horno con patatas y pimientos", ["comida", "cena"], 480, 38, 30, 17, 6,
     ["dorada", "patata", "pimiento", "ajo", "aceite de oliva"], "Hornear la dorada 25 min a 200 °C con patatas en rodajas, pimientos y ajo laminado.", [], "mediterraneo"),
    ("Lubina a la sal con ensalada", ["comida"], 390, 40, 12, 18, 3,
     ["lubina", "lechuga", "tomate", "cebolla", "aceite de oliva"], "Cubrir la lubina con sal gruesa y hornear 20 min. Acompañar con ensalada aliñada.", [], "mediterraneo"),
    ("Arroz con verduras y bonito", ["comida"], 520, 26, 62, 15, 7,
     ["arroz", "bonito", "calabacín", "pimiento", "guisantes", "aceite de oliva"], "Sofreír las verduras, añadir arroz y caldo, cocer 18 min. Añadir bonito al final.", [], "mediterraneo"),
    ("Ensalada de garbanzos con atún", ["comida"], 410, 22, 44, 14, 12,
     ["garbanzos", "atún", "tomate", "cebolla", "pepino", "aceite de oliva"], "Mezclar garbanzos escurridos con atún, verduras troceadas y aliño de limón.", [], "mediterraneo"),
    ("Pisto con huevo", ["comida", "cena"], 280, 14, 22, 16, 8,
     ["calabacín", "berenjena", "tomate", "pimiento", "huevo", "aceite de oliva"], "Pochar las verduras 30 min y coronar con huevo poché.", [], "mediterraneo"),
    ("Salmorejo con huevo y jamón", ["comida"], 340, 12, 40, 15, 5,
     ["tomate", "pan", "aceite de oliva", "huevo", "jamón serrano"], "Triturar tomate, pan y ajo; aliñar y decorar con huevo duro y jamón.", [], "mediterraneo"),
    # --- Paleo ---
    ("Solomillo de cerdo con boniato", ["comida", "cena"], 520, 36, 26, 30, 6,
     ["solomillo de cerdo", "boniato", "aceite de oliva", "romero"], "Sellar el solomillo y asar con boniato al horno con romero.", [], "paleo"),
    ("Pollo al curry de coco y verduras", ["comida"], 470, 38, 12, 30, 4,
     ["pollo", "leche de coco", "pimiento", "brócoli", "cúrcuma"], "Saltear pollo, añadir verduras y leche de coco con curry; cocer 15 min.", [], "paleo"),
    ("Huevos revueltos con aguacate y salmón", ["desayuno", "cena"], 380, 24, 4, 29, 6,
     ["huevo", "aguacate", "salmón ahumado", "cebolleta"], "Revueltos a fuego suave con aguacate y salmón en dados.", [], "paleo"),
    ("Pescado a la plancha con verduras asadas", ["comida", "cena"], 400, 34, 18, 20, 8,
     ["dorada", "calabacín", "pimiento", "berenjena", "aceite de oliva"], "Plancha el pescado y asa las verduras 20 min a 200 °C.", [], "paleo"),
    ("Ensalada de pollo, aguacate y nueces", ["comida"], 450, 32, 10, 30, 7,
     ["pollo", "aguacate", "nueces", "lechuga", "tomate", "aceite de oliva"], "Mezclar pollo a la plancha en dados con el resto y aliñar.", [], "paleo"),
    ("Cazuela de ternera con verduras", ["comida", "cena"], 460, 40, 15, 26, 6,
     ["ternera", "zanahoria", "puerro", "calabacín", "aceite de oliva"], "Guisar la ternera en tacos con las verduras 40 min.", [], "paleo"),
    # --- Cetogénica ---
    ("Tortilla de espinacas y queso", ["cena"], 310, 20, 3, 24, 1,
     ["huevo", "espinacas", "queso fresco"], "Batir huevos con espinacas y queso; cuajar en sartén.", [], "cetogenico"),
    ("Pollo al horno con mantequilla y hierbas", ["comida", "cena"], 560, 42, 2, 42, 1,
     ["pollo", "mantequilla", "romero", "tomillo", "ajo"], "Untar el pollo con mantequilla y hierbas; hornear 35 min.", [], "cetogenico"),
    ("Salmón con salsa de aguacate", ["comida"], 520, 38, 6, 38, 4,
     ["salmón", "aguacate", "limón", "cebolleta"], "Plancha el salmón y acompaña de guacamole ligero.", [], "cetogenico"),
    ("Revuelto de champiñones y bacon", ["cena"], 390, 24, 4, 30, 2,
     ["huevo", "champiñones", "bacon"], "Dorar bacon y champiñones; añadir huevo y remover.", ["Lácteos"], "cetogenico"),
    ("Lomo de cerdo con pisto sin tomate", ["comida"], 440, 34, 8, 30, 5,
     ["lomo de cerdo", "calabacín", "berenjena", "pimiento", "aceite de oliva"], "Sellar el lomo y saltear las verduras como guarnición.", [], "cetogenico"),
    ("Ensalada de aguacate, huevo y caballa", ["comida"], 430, 26, 6, 33, 6,
     ["aguacate", "huevo", "caballa", "lechuga", "cebolla morada"], "Combinar en ensalada con aliño de limón y aceite.", [], "cetogenico"),
    # --- Vegana ---
    ("Tofu salteado con verduras y quinoa", ["comida"], 430, 22, 46, 17, 9,
     ["tofu", "quinoa", "pimiento", "brócoli", "salsa de soja", "jengibre"], "Saltear tofu dorado con verduras y salsa de soja; servir sobre quinoa.", [], "vegano"),
    ("Curry de garbanzos y espinacas", ["comida"], 410, 18, 52, 14, 13,
     ["garbanzos", "espinacas", "leche de coco", "curry", "tomate"], "Cocer garbanzos con tomate, coco y curry; añadir espinacas al final.", [], "vegano"),
    ("Lentejas rojas con verduras", ["comida", "cena"], 380, 20, 55, 7, 14,
     ["lentejas rojas", "zanahoria", "cebolla", "pimiento", "cúrcuma"], "Guiso de lentejas rojas con sofrito de verduras, 20 min.", [], "vegano"),
    ("Bowl de quinoa, hummus y verduras", ["comida"], 420, 16, 55, 15, 11,
     ["quinoa", "hummus", "tomate", "pepino", "aguacate", "garbanzos"], "Montar el bowl con quinoa, vegetales frescos y hummus.", [], "vegano"),
    ("Espaguetis de calabacín con pesto vegano", ["cena"], 250, 8, 14, 19, 5,
     ["calabacín", "albahaca", "anacardos", "ajo", "aceite de oliva"], "Espiralizar el calabacín y saltear 3 min con pesto de albahaca y anacardos.", [], "vegano"),
    ("Seitán a la plancha con pisto", ["comida"], 350, 32, 22, 14, 7,
     ["seitán", "calabacín", "berenjena", "tomate", "pimiento", "aceite de oliva"], "Dorar el seitán y servir con pisto de verduras.", [], "vegano"),
    # --- Vegetariana ---
    ("Huevos al plato con tomate y queso", ["cena"], 320, 20, 8, 23, 3,
     ["huevo", "tomate", "queso fresco"], "Hornear huevos sobre tomate triturado con queso 12 min.", ["Lácteos"], "vegetariano"),
    ("Quinoa con queso feta y verduras", ["comida"], 460, 17, 48, 21, 8,
     ["quinoa", "queso fresco", "tomate", "pepino", "aceitunas", "cebolla morada"], "Quinoa cocida con vegetales frescos y feta en dados.", ["Lácteos"], "vegetariano"),
    ("Tortilla de patata", ["cena", "comida"], 340, 12, 28, 20, 3,
     ["patata", "huevo", "cebolla", "aceite de oliva"], "Pochar patata y cebolla, mezclar con huevo y cuajar.", [], "vegetariano"),
    ("Berenjenas rellenas de arroz y queso", ["comida"], 380, 13, 48, 15, 12,
     ["berenjena", "arroz", "tomate", "queso fresco"], "Rellenar berenjenas asadas con arroz al tomate y gratinar con queso.", ["Lácteos"], "vegetariano"),
    ("Revuelto de setas y espárragos", ["cena"], 240, 16, 6, 17, 4,
     ["huevo", "setas", "espárragos", "ajo"], "Saltear setas y espárragos; añadir huevo y remover.", [], "vegetariano"),
    ("Crema de calabaza con semillas", ["cena"], 220, 6, 30, 8, 6,
     ["calabaza", "puerro", "pipas de calabaza", "aceite de oliva"], "Cocer calabaza y puerro; triturar y decorar con pipas tostadas.", [], "vegetariano"),
    # --- Sin gluten ---
    ("Arroz con pollo y verduras", ["comida"], 520, 30, 62, 14, 6,
     ["arroz", "pollo", "pimiento", "guisantes", "zanahoria"], "Cocer el arroz con pollo y verduras en caldo, 20 min.", [], "sin gluten"),
    ("Merluza a la gallega", ["comida"], 380, 36, 18, 17, 5,
     ["merluza", "patata", "pimiento", "aceite de oliva", "ajo"], "Cocer las patatas y la merluza; aliñar con aceite, ajo y pimentón.", [], "sin gluten"),
    ("Ensalada de arroz integral y atún", ["comida"], 430, 22, 50, 15, 8,
     ["arroz integral", "atún", "tomate", "aceitunas", "cebolla"], "Ensalada templada de arroz con atún y vegetales.", [], "sin gluten"),
    ("Pollo a la plancha con quinoa y brócoli", ["comida"], 480, 40, 38, 17, 9,
     ["pollo", "quinoa", "brócoli", "aceite de oliva"], "Plancha el pollo; saltear brócoli y servir con quinoa.", [], "sin gluten"),
    ("Garbanzos con espinacas", ["comida"], 380, 18, 50, 11, 15,
     ["garbanzos", "espinacas", "comino", "ajo", "aceite de oliva"], "Guiso de garbanzos con espinacas salteadas y comino.", [], "sin gluten"),
    ("Bacalao al horno con patatas y tomate", ["comida", "cena"], 460, 38, 30, 20, 6,
     ["bacalao", "patata", "tomate", "pimiento", "aceite de oliva"], "Hornear bacalao sobre cama de patatas y tomate 25 min.", [], "sin gluten"),
    # --- Equilibrada (variadas) ---
    ("Lentejas con arroz integral", ["comida"], 480, 24, 70, 9, 16,
     ["lentejas", "arroz integral", "zanahoria", "cebolla", "pimiento"], "Guiso de lentejas con sofrito; servir con arroz.", [], "equilibrada"),
    ("Pollo a la plancha con arroz y ensalada", ["comida"], 520, 36, 52, 15, 7,
     ["pollo", "arroz", "lechuga", "tomate", "aceite de oliva"], "Plancha el pollo; acompañar con arroz y ensalada.", [], "equilibrada"),
    ("Pasta integral con verduras", ["comida"], 440, 16, 62, 13, 9,
     ["pasta integral", "calabacín", "tomate", "champiñones", "cebolla"], "Saltear verduras y mezclar con pasta cocida.", [], "equilibrada"),
    ("Ternera guisada con patatas", ["comida"], 500, 32, 38, 24, 6,
     ["ternera", "patata", "zanahoria", "guisantes", "tomate"], "Guiso tradicional de ternera con verduras y patata.", [], "equilibrada"),
    ("Salmón a la plancha con arroz basmati", ["comida"], 480, 32, 45, 18, 4,
     ["salmón", "arroz basmati", "brócoli", "limón"], "Plancha el salmón y sirve con arroz basmati y brócoli.", [], "equilibrada"),
    ("Pollo guisado con verduras y arroz", ["comida"], 510, 34, 55, 14, 8,
     ["pollo", "arroz", "calabacín", "zanahoria", "tomate"], "Guiso de pollo con verduras; servir con arroz.", [], "equilibrada"),
    ("Ensalada completa de pollo", ["comida"], 420, 34, 30, 17, 8,
     ["pollo", "lechuga", "tomate", "huevo", "maíz dulce", "aceite de oliva"], "Ensalada completa con pollo, huevo y vegetales.", [], "equilibrada"),
]

# Grupos de sustitución adicionales: clave -> lista de sustitutos
SUBSTITUTION_EXTRA: dict[str, list[str]] = {
    "pescado_azul": ["salmón", "atún", "caballa", "sardinas", "bonito"],
    "pescado_blanco": ["merluza", "bacalao", "dorada", "lubina", "gallo", "lenguado"],
    "carne_blanca": ["pollo", "pavo", "conejo", "codorniz"],
    "grasas_saludables": ["aguacate", "aceite de oliva", "nueces", "almendras", "semillas de chía"],
    "fuentes_hierro": ["lentejas", "garbanzos", "espinacas", "ternera", "alubias"],
    "cereales_sin_gluten": ["arroz", "quinoa", "maíz", "trigo sarraceno", "mijo"],
    "proteina_vegetal": ["tofu", "tempeh", "seitán", "garbanzos", "lentejas", "soja texturizada"],
    "lacteos_bajos": ["yogur skyr", "requesón", "queso fresco", "kéfir", "yogur natural"],
    "frutas_verano": ["sandía", "melón", "melocotón", "albaricoque", "nectarina"],
    "frutas_rojas": ["fresas", "arándanos", "frambuesas", "moras", "cerezas"],
}


def _classify_tag(name: str) -> str | None:
    """Heurística para etiquetar comidas existentes sin tag por su nombre."""
    lower = name.lower()
    if any(k in lower for k in ("tofu", "hummus", "seitán", "seitan", "lenteja", "garbanzo", "espinaca", "quinoa", "vegano")):
        return "vegano"
    if any(k in lower for k in ("huevo", "queso", "tortilla", "revuelto", "feta", "crema", "yogur", "requesón")):
        return "vegetariano"
    if any(k in lower for k in ("salmón", "salmon", "merluza", "bacalao", "sardina", "atún", "atun", "caballa", "dorada", "lubina", "pescado", "bonito", "boquerón", "boqueron", "pulpo", "gazpacho", "salmorejo", "aceite de oliva")):
        return "mediterraneo"
    if any(k in lower for k in ("ceto", "keto", "bacon", "mantequilla", "aguacate", "queso", "aceite de coco")):
        return "cetogenico"
    if any(k in lower for k in ("arroz sin", "quis", "sin gluten", "maíz", "maiz")):
        return "sin gluten"
    return "equilibrada"


async def seed_scale(engine=None) -> None:
    eng = engine or _engine
    async with AsyncSession(eng) as session:
        # --- 1) Alimentos nuevos (food_recognition) ---
        stmt_food = portable_insert(
            CatalogEntry,
            [{"category": "food_recognition", "key": k, "data": {"k": v[0], "p": v[1], "c": v[2], "g": v[3]}} for k, v in FOOD_EXTRA.items()],
            ["category", "key"],
        )
        await session.execute(stmt_food)

        # --- 2) Etiquetar comidas existentes sin tag ---
        rows = (await session.execute(
            select(MealCatalog.id, MealCatalog.name, MealCatalog.tag).where(MealCatalog.tag.is_(None) | (MealCatalog.tag == ""))
        )).all()
        for rid, rname, _rtag in rows:
            tag = _classify_tag(rname)
            await session.execute(update(MealCatalog).where(MealCatalog.id == rid).values(tag=tag))

        # --- 3) Comidas nuevas ---
        meals_rows = [
            {
                "name": m[0], "meal_types": m[1], "kcal": m[2], "protein_g": m[3],
                "carbs_g": m[4], "fat_g": m[5], "fiber_g": m[6], "ingredients": m[7],
                "prep": m[8], "allergens": m[9], "tag": m[10],
            }
            for m in MEALS_EXTRA
        ]
        stmt_meal = portable_insert(MealCatalog, meals_rows, ["name"])
        await session.execute(stmt_meal)

        # --- 4) Grupos de sustitución extra ---
        stmt_sub = portable_insert(
            CatalogEntry,
            [{"category": "substitution_groups", "key": k, "data": {"items": v}} for k, v in SUBSTITUTION_EXTRA.items()],
            ["category", "key"],
        )
        await session.execute(stmt_sub)

        await session.commit()