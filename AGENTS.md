# Vitaria — Contexto del Proyecto

## Qué es Vitaria

Plataforma de nutrición personalizada con landing page y portal de usuario. Los usuarios crean perfil (datos físicos, objetivo, alergias, tipo de dieta), reciben menú semanal personalizado con recetas y lista de la compra.

## Stack técnico

- **HTML/CSS/JS puro** — sin frameworks, sin bundler, sin dependencias npm.
- **Sin node/deno/bun** en el entorno del usuario. Para validar JS se usa `osascript -l JavaScript` (JXA en macOS). JXA requiere `return` explícito para producir output.
- **Playwright Python** disponible para tests de navegador (`pip3 install playwright`). Se puede automatizar Chrome headless.
- **Git remote:** `https://github.com/csanchezvigon-boop/vitaria.git` (rama `main`)
- **Directorio del proyecto:** `/Users/carlos/Documents/nutricion/`

## Archivos principales

| Archivo | Descripción |
|---|---|
| `landing.html` | Landing page (Hero, planes, características, FAQ) |
| `portal.html` | Portal completo de usuario — todas las vistas en un solo HTML |
| `portal.css` | Estilos del portal (separados del HTML) |
| `portal.js` | Toda la lógica del portal (~1260 líneas). IIFE `( ()=>{ ... } )()` — todas las funciones son internas, no están en scope global |
| `mediterraneo.js` | Motor de dieta mediterránea personalizada: `genDietaMediterranea(u)`, `genListaCompra(dieta)` |
| `paleo.js` | Motor de dieta paleo personalizada: `genDietaPaleo(u)`, `genListaCompraPaleo(dieta)` |

## Estructura del portal (portal.js)

El JS está envuelto en una IIFE. Las funciones NO son globales — no se pueden llamar desde la consola del navegador ni desde Playwright `page.evaluate()` directamente. Para navegar entre pestañas desde tests, usar clicks en elementos UI (`#perfilNavBtn`, etc.) o manipular clases CSS directamente.

### Funciones clave

- `saveUser(u)` — Guarda usuario en localStorage (`vitaria_users`)
- `currentUser()` — Retorna usuario activo desde `vitaria_session`
- `enterPortal()` — Inicializa portal, migra datos, llama `showView('view-dashboard')`
- `activateTab(n)` — Renderiza pestaña por nombre: `hoy`, `semana`, `lista`, `perfil`, `bienestar`, `dieta`
- `renderPerfil(u)` — Rellena formulario de perfil, incluyendo `#perfDieta` select
- `newMenu(tipo,alergias,wi,objetivo,dieta)` — Genera menú semanal. Maneja planes especiales (ceto, vegano, etc.) y fallback a planes genéricos
- `autoGenDieta(u)` — Auto-genera dieta según `u.dietaType`: llama `genDietaPaleo` o `genDietaMediterranea`
- `genDietaPaleo(u)` / `genDietaMediterranea(u)` — Motores de dieta personalizados (en sus respectivos archivos)

### Selector de dieta

- Campo HTML: `<select id="perfDieta">` con options: `todos`, `cetogenico`, `vegano`, `paleo`, `mediterraneo`, `vegetariano`
- **Propiedad canónica:** `u.dietaType` (NO `u.dieta`). Migración automática en `enterPortal()`.
- Al cambiar dieta → `u.dietaData = null` para forzar regeneración.
- `DIET_PLANS` (línea 307) mapea tipos a objetos de planes. Las estructuras de `DIET_KETO/VEGANO/MEDITERRANEO/VEGETARIANO` son objetos con claves `regular`/`ganar` que contienen objetos `{Lunes:{...}, Martes:{...}}`. **`newMenu()` normaliza a arrays con `if(!Array.isArray(src))src=[src]`.**
- `DIET_PLANS.paleo` se define en línea 389 como `{regular:WEIGHT_WEEKS, ganar:MASS_WEEKS}` (arrays).

### Planes y precios

| Plan | Precio | Incluye |
|---|---|---|
| Starter | 6 €/mes | Dieta personalizada + lista de la compra |
| Pro | 20 €/mes | + Chat limitado + protocolos (ayuno, recuperación, suplementación) |
| Premium | 40 €/mes | + Feedback continuo + atención prioritaria |

### Perfil del usuario (objeto `u`)

```js
{
  id, name, email, pw, plan,              // básicos
  physical: {altura, peso, edad, sexo, actividad},  // datos físicos
  stats: {bmr, tdee, agua, calorias, esBajar, esGanar},
  tipo: 'Equilibrada',                    // tipo de entrenamiento
  objetivo: 'Regular el peso' | 'Reset & Build',
  dietaType: 'paleo'|'mediterraneo'|'vegano'|'vegetariano'|'cetogenico'|'todos',
  alergias: [],                           // array de strings
  menu: [...],                            // menú semanal generado
  dietaData: {...},                       // datos de dieta personalizada (cache)
  consumed: {}, glassed: {}, sleep: {},   // tracking diario
  customFoods: {}, extraFoods: {}, subs: {}
}
```

## Reglas de desarrollo

1. **Responder en español** al usuario.
2. **Ejecutar ediciones reales**, no solo anunciarlas.
3. **NO añadir comentarios** al código a menos que el usuario lo pida.
4. **NO hacer commit/push** sin que el usuario lo pida explícitamente.
5. Validar JS con `osascript -l JavaScript` — envolver en `(function(){...})()`.
6. Seguir la convención de código existente: IIFE, `$=s=>document.querySelector(s)`, event listeners inline.

## Bug的历史 (bugs corregidos)

- **`u.dieta` → `u.dietaType`** (commit `1e4d6f9`): Renombrado para fuente única de verdad + migración automática.
- **`DIET_PLANS.paleo` era objeto en vez de array** (corregido en sesión actual): Causaba crash en `newMenu()` → `saveUser()` nunca se ejecutaba → dieta no se persistía.
- **`DIET_KETO/VEGANO/etc` no estaban en arrays** (corregido en sesión actual): Mismo crash. Solución: `if(!Array.isArray(src))src=[src]` en `newMenu()`.
- **`?v=2` cache busting** añadido a `<script>` tags en `portal.html`.

## Estado actual

- Landing funcionando
- Portal con 7 pestañas: Hoy, Tu plan semanal, Lista de compra, Evaluación semanal, Bienestar, Dieta, Perfil
- Dieta Mediterránea y Paleo completamente implementadas con recetas personalizadas
- Persistencia de tipo de dieta corregida y verificada con Playwright (6/6 dietas pasan)
- **Sin commits pendientes** de los fixes de persistencia (solo debug, sin push)

## Cómo testear

```bash
# Validar JS (solo syntax check en JXA)
python3 -c "
import subprocess
code = open('portal.js', encoding='utf-8').read()
open('/tmp/s.js','w',encoding='utf-8').write(code)
r = subprocess.run(['osascript', '-l', 'JavaScript', '/tmp/s.js'], capture_output=True, text=True, timeout=10)
print('OK' if 'SyntaxError' not in r.stderr else 'ERROR')
"

# Test de persistencia de dieta con Playwright
# (ver archivos en /var/folders/xv/tb5mchcs3jd5bwmt687cr3dc0000gn/T/opencode/)
```

## Notas para el usuario

- El usuario es developer independiente, habla español, prefiere respuestas cortas y directas.
- A menudo pide que se haga en vez de explicar — ejecutar cambios, no describir.
- Frustración con bugs que "parecen arreglados en test pero no en la interfaz real" — siempre verificar con Playwright o navegador real.
- Cuando dice "NO hagas commit" → realmente no hacer commit. Esperar confirmación explícita.
