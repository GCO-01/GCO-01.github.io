# Calculadora de Proteína — Master Prompt
### Adaptado al codebase `sitio` (Perfect Pal / Shake)

> Documento técnico de referencia para implementar la calculadora dentro del proyecto Vite + React existente.
> Divide en tres partes: **Frontend**, **Backend** y **Prompt de coach nutricional** (listo para copiar en cualquier IA).

---

## CONTEXTO DEL PROYECTO

| Ítem | Valor |
|------|-------|
| Nombre de marca | **perfect pal** (header) / producto **Shake** |
| Stack | React 18 · Vite · React Router v6 · CSS Modules |
| Punto de entrada | `src/App.jsx` → `<Route path="/calculadora" element={<Calculadora />} />` |
| Archivo a editar | `src/pages/Calculadora.jsx` (actualmente placeholder) |
| Design tokens | `src/styles/tokens.css` |
| Componentes reutilizables | `src/components/ui/Button.jsx`, `src/hooks/useCart.jsx` |
| Datos del producto | `src/data/config.js`, `src/data/flavors.js`, `src/data/benefits.js` |

La calculadora vive **dentro** del layout existente (Header + Footer + CartDrawer ya envuelven la ruta). No recrear chrome de navegación.

---

## PARTE 1 — FRONTEND

### 1.1 Arquitectura de archivos sugerida

```
src/
├── pages/
│   └── Calculadora.jsx          ← componente raíz (orquesta fases)
├── components/
│   └── calculadora/
│       ├── CalcIntro.jsx         ← pantalla de bienvenida
│       ├── CalcForm.jsx          ← 3 pasos del formulario
│       ├── CalcResult.jsx        ← resultado personalizado
│       ├── CalcUnlocked.jsx      ← plan de comidas + descuento
│       ├── GoalTile.jsx          ← tile de objetivo con gráfico SVG
│       ├── GoalViz.jsx           ← gráfico de trayectoria SVG
│       ├── MealPlan.jsx          ← plan de comidas renderizado
│       └── Calculadora.module.css
└── data/
    └── calculadora.js            ← computeProtein(), buildMealPlan(), INTAKE_PATTERNS
```

### 1.2 Design tokens a usar (de `tokens.css`)

| Uso | Token |
|-----|-------|
| Fondo principal | `--color-bg` (#05070d) |
| Superficie de card | `--color-surface` (#111111) |
| Texto principal | `--color-text` (#f4f4f6) |
| Texto apagado | `--color-text-subtle` (rgba(255,255,255,0.4)) |
| Borde | `--color-border` (rgba(255,255,255,0.08)) |
| Acento rojo | `--color-accent-red` (#db5242) |
| Acento azul | `--color-accent-blue` (#302f9b) |
| Acento morado | `--color-accent-purple` (#6b3fa0) |
| Degradado CTA | `--gradient-cta` (rojo→azul vertical) |
| Degradado alt | `--gradient-cta-alt` (135deg, rojo→azul) |
| Sombra CTA | `--shadow-cta` |
| Tipografía | `--font-poppins` (principal), `--font-opensans` (secundaria) |
| Radio botón | `--radius-btn` (20px), `--radius-btn-lg` (28px) |
| Radio card | `--radius-card` (16px), `--radius-card-lg` (20px) |

> ⚠️ La calculadora original usaba `--accent` (rojo #E8453C) y `--plum` (#7B5EA7). Al portar al sitio, mapear:
> - `--accent` → `--color-accent-red`
> - `--plum` → `--color-accent-purple`
> - `--grad` → `--gradient-cta-alt`
> - `--ink` → `--color-text`
> - `--paper` → `--color-surface`
> - `--muted` → `--color-text-subtle`

### 1.3 Uso del componente `<Button>`

```jsx
import { Button } from '../ui/Button';

// CTA principal (degradado rojo→azul)
<Button variant="primary" size="md" onClick={handleNext}>
  Siguiente
</Button>

// CTA deshabilitado
<Button variant="primary" size="md" disabled>
  Siguiente
</Button>

// Secundario (outline)
<Button variant="secondary" size="sm" onClick={handleBack}>
  ← Atrás
</Button>

// Tamaños: "sm" (42px alto) · "md" (56px) · "lg" (60px)
// fullWidth: <Button fullWidth>
// confirmed: <Button confirmed> (azul sólido, post-acción)
```

### 1.4 Integración con el carrito

Al desbloquear el plan, ofrecer agregar el producto directamente al carrito:

```jsx
import { useCart } from '../../hooks/useCart';
import { FLAVORS } from '../../data/flavors';

function CalcUnlocked({ data }) {
  const { addItem } = useCart();
  // ...
  <Button variant="primary" size="lg" onClick={() => addItem('chocolate', 1)}>
    Agregar Shake al carrito — 50% off
  </Button>
}
```

Sabores disponibles en `FLAVORS`: `'chocolate'` | `'mango'` | `'combinado'`.

### 1.5 Datos del producto a importar

```js
import { PRICE, OLD_PRICE, STOCK, formatMoney } from '../../data/config';
import { FLAVORS } from '../../data/flavors';
import { PRODUCT_BENEFITS } from '../../data/benefits';

// Precio formateado: formatMoney(PRICE) → "S/ 2,299.00"
// Stock urgente: STOCK → 12 (unidades restantes)
// Descuento Early Access: mostrar OLD_PRICE tachado + PRICE activo
```

### 1.6 Flujo de fases

```
'intro' → 'form' → 'result' → 'unlocked'
```

Estado en `Calculadora.jsx` con `useState`. Cada cambio de fase hace scroll a `window.scrollTo({ top: 0 })`.

```jsx
export function Calculadora() {
  const [phase, setPhase] = useState('intro');
  const [step, setStep]   = useState(0);        // 0 | 1 | 2
  const [formData, setFormData] = useState({ ...DEFAULT_STATE });
  const [user, setUser]   = useState({ name: '', email: '' });

  const result = phase !== 'intro' ? computeProtein(formData) : null;
  const plan   = result ? buildMealPlan({ grams: result.grams, diet: formData.diet }) : null;
  // ...
}
```

### 1.7 Form — 3 pasos

#### Paso 1 — Objetivo (`step === 0`)

4 tiles en grid 2×2. Cada uno tiene un gráfico SVG de trayectoria (`GoalViz`).

| ID | Título | Trayectoria SVG |
|----|--------|----------------|
| `muscle` | Ganar músculo | Curva ascendente (músculo ↑) con área rellena |
| `recomp` | Recomposición | Dos curvas cruzadas (grasa ↓ punteada, músculo ↑ sólida) |
| `lose` | Perder peso | Curva descendente (grasa ↓) con área rellena |
| `maintain` | Mantenerme | Línea oscilante estable |

Tile activo: borde `--color-accent-red`, fondo `rgba(219,82,66,0.06)`, hairline superior con `--gradient-cta-alt`.
Tile inactivo: borde `--color-border`, fondo `--color-surface`.

**Validación:** objetivo seleccionado para avanzar.

---

#### Paso 2 — Tus datos (`step === 1`)

| Campo | Control | Rango |
|-------|---------|-------|
| `weight` | Slider + input numérico | 35–180 kg |
| `target` | Slider + input numérico | 35–180 kg |
| `training` | Segmented 3 opciones | `strength_high` / `strength_some` / `none` |
| `activity` | Segmented 3 opciones | `sedentary` / `moderate` / `very_active` |

**Validación:** los 4 campos completos para avanzar.

---

#### Paso 3 — Tu día promedio (`step === 2`)

4 tarjetas de patrón de ingesta predefinidas + opción custom:

| ID | g/día | Descripción |
|----|-------|-------------|
| `low` | 35 | Dieta alta en carbos, casi nada de proteína |
| `average` | 60 | Día promedio peruano típico |
| `conscious` | 95 | Come consciente, sin contar macros |
| `custom` | manual | El usuario ingresa su número exacto |

**Validación:** patrón seleccionado y `currentIntake > 0`.

---

### 1.8 Pantalla de Resultado

Tres bloques:

**`ProfileHero`** — card oscura (#141418 o `--color-surface` profundo):
- Si `currentIntake > 0`: donut gauge con % cubierto + barra de progreso + brecha en 3 formatos (gramos, %, equivalente en huevos).
- Si no hay ingesta: requerimiento en grande + multiplicador vs. RDA.

**`SwipeCard`** — 2 paneles con tabs y swipe táctil:
- Tab 0 "Comparación real": 3 tanques verticales (ingesta actual / RDA / requerimiento).
- Tab 1 "Base científica": rango del usuario + cita del estudio relevante.

**`InlineGateForm`** — formulario de nombre + email para desbloquear el plan:
- Al enviar con email válido (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), pasa a fase `unlocked`.

---

### 1.9 Pantalla Unlocked

1. **Banner de confirmación** — requerimiento calculado + email del usuario.
2. **DiscountCard** — código `SHAKE50`, botón copiar al portapapeles, precio `OLD_PRICE` tachado + `PRICE` activo, stock urgente.
3. **Plan de comidas** — generado por `buildMealPlan()`, cards por comida con macros.
4. **CTA de compra** — `<Button variant="primary" size="lg" fullWidth>` que llama a `addItem()` del carrito.

---

### 1.10 Estado por defecto

```js
const DEFAULT_STATE = {
  goal: '',
  weight: 75,
  target: 78,
  diet: 'omnivore',       // 'omnivore' | 'vegetarian' | 'vegan'
  training: '',           // 'strength_high' | 'strength_some' | 'none'
  activity: '',           // 'sedentary' | 'moderate' | 'very_active'
  intakePattern: '',      // 'low' | 'average' | 'conscious' | 'custom'
  currentIntake: 0,
};
```

---

---

## PARTE 2 — BACKEND

Toda la lógica va en `src/data/calculadora.js` como **named exports** (sin globals `window.*`).

```js
export function computeProtein(state) { ... }
export function buildMealPlan({ grams, diet }) { ... }
export const INTAKE_PATTERNS = [ ... ];
```

### 2.1 `computeProtein(state)` — motor de cálculo

**Base científica:** Phillips et al. 2016 y Morton et al. 2018. La RDA de 0.8 g/kg es insuficiente para adultos activos; el rango real es 1.2–2.2 g/kg según objetivo y nivel de actividad.

#### Algoritmo paso a paso

**1. Coeficiente base por objetivo**

| Objetivo | Coef. inicial | Razón |
|----------|--------------|-------|
| `muscle` | 1.6 | Morton 2018: máxima síntesis proteica |
| `recomp` | 1.6 | Preserva masa magra en déficit |
| `lose` | 1.6 | Saciedad + retención de músculo |
| `maintain` | 1.4 | Punto medio del rango óptimo 1.2–1.6 |

**2. Ajuste por entrenamiento de fuerza**

| `training` | Delta |
|-----------|-------|
| `strength_high` (3+/sem) | +0.2 |
| `strength_some` (1–2/sem) | ±0 |
| `none` | −0.2 |

**3. Ajuste por actividad general**

| `activity` | Delta |
|-----------|-------|
| `very_active` | +0.1 |
| `moderate` | ±0 |
| `sedentary` | −0.1 |

**4. Clamp del coeficiente** (antes del bump vegetal)

```js
coef = Math.max(1.2, Math.min(2.0, coef));
```

**5. Bump por dieta plant-based** (menor DIAAS y leucina)

| `diet` | Multiplicador |
|--------|--------------|
| `vegan` | × 1.10 |
| `vegetarian` | × 1.05 |
| `omnivore` | × 1.00 |

**6. Peso base de cálculo**

| Objetivo | `baseWeight` |
|----------|-------------|
| `lose` o `recomp` | `Math.min(weight, target)` — peso ideal/objetivo |
| `muscle` | `Math.max(weight, Math.min(target, weight + 5))` — proyección máx. +5 kg |
| `maintain` | `weight` — sin ajuste |

**7. Resultado final**

```js
const grams      = Math.round(baseWeight * coef * bump);
const rda        = Math.round(weight * 0.8);
const gap        = Math.max(0, grams - currentIntake);
const monthlyKg  = +(gap * 30 / 1000).toFixed(1);
```

**8. Objeto devuelto**

```js
return {
  grams,           // requerimiento diario (g)
  rda,             // RDA clásica para comparación (g)
  coef,            // coeficiente efectivo final (con bump)
  baseWeight,      // peso usado en el cálculo (kg)
  proteinKcal,     // grams × 4
  surplus,         // grams − rda
  currentIntake,   // lo que el usuario reporta comer hoy (g)
  gap,             // proteína faltante diaria (g)
  monthlyKg,       // gap × 30 días en kg
  status,          // 'above' | 'between' | 'below'
                   //   above   → currentIntake ≥ grams
                   //   between → currentIntake ≥ rda, pero < grams
                   //   below   → currentIntake < rda
};
```

---

### 2.2 Rangos de referencia (para la pantalla de resultado)

```js
export const RANGE_ROWS = [
  { range: '0.8 g/kg',      label: 'RDA oficial',                      min: 0.8,  max: 0.8,  source: 'phillips' },
  { range: '1.2 – 1.6 g/kg',label: 'Salud general y mantenimiento',    min: 1.2,  max: 1.6,  source: 'patrick'  },
  { range: 'mín. 1.2 g/kg', label: 'Adultos mayores',                  min: 1.2,  max: 1.2,  source: 'patrick'  },
  { range: '1.6 g/kg',      label: 'Entrenamiento de resistencia',      min: 1.6,  max: 1.6,  source: 'morton'   },
  { range: '> 1.6 g/kg',    label: 'Recomposición corporal',            min: 1.61, max: 1.99, source: 'morton'   },
  { range: 'hasta 2.2 g/kg',label: 'Atletas de alto rendimiento',       min: 2.0,  max: 2.2,  source: 'patrick'  },
];

export const CITATIONS = {
  morton:  { author: 'Morton et al.',               year: '2018', journal: 'Br. J. Sports Med., 52(6)', note: '1.6 g/kg maximiza la ganancia de músculo.' },
  phillips:{ author: 'Phillips, Chevalier & Leidy', year: '2016', journal: 'Appl. Physiol. Nutr. Metab., 41(5)', note: 'La RDA de 0.8 g/kg está obsoleta para adultos activos.' },
  patrick: { author: 'Patrick (FoundMyFitness)',     year: '2024', journal: 'The Science of Protein', note: 'Rango óptimo 1.2–1.6; atletas hasta 2.2.' },
};
```

---

### 2.3 `buildMealPlan({ grams, diet })`

#### Lógica de Shakes

```js
const numShakes   = grams > 100 ? 2 : 1;
const shakeBudget = numShakes * 30;            // 30g proteína por botella
const foodBudget  = Math.max(20, grams - shakeBudget);
```

#### Distribución por comida

| Comida | % de `foodBudget` | Mínimo |
|--------|--------------------|--------|
| Desayuno | 30% | 5g |
| Almuerzo | 45% | 8g |
| Cena | 25% (resto) | 5g |

#### Alimentos por dieta

**Desayuno** (siempre incluye 1 Shake de Chocolate):

| Dieta | Complemento |
|-------|------------|
| `vegan` | Avena con plátano y mantequilla de maní |
| `omnivore` / `vegetarian` | Huevos revueltos con palta |

**Almuerzo:**

| Dieta | Plato principal |
|-------|----------------|
| `vegan` | Bowl de quinoa, lentejas y tofu + ensalada con palta |
| `omnivore` | Pechuga de pollo a la plancha + arroz integral, palta, camote |
| `vegetarian` | Adaptar al gusto (legumbres + huevo) |

**Post-entreno** (solo si `numShakes >= 2`):
- Shake de Mango + plátano.

**Cena:**

| Dieta | Plato |
|-------|-------|
| `vegan` | Tempeh salteado con verduras + camote y edamame |
| `vegetarian` | Tortilla de claras + quinoa + yogurt griego |
| `omnivore` | Lomo de res a la plancha + camote y ensalada |

#### Objeto devuelto

```js
return {
  meals: [
    {
      name: 'Desayuno',
      emoji: '🌅',
      items: [
        { label, grams, kcal, isShake?: boolean, flavor?: 'chocolate'|'mango', emoji }
      ]
    },
    // Almuerzo, Post-entreno (condicional), Cena
  ],
  total: { grams: number, kcal: number }
};
```

---

### 2.4 `INTAKE_PATTERNS` — patrones de ingesta

```js
export const INTAKE_PATTERNS = [
  { id: 'low',      grams: 35,   emoji: '🍞', title: 'Carbs y poco más',      sub: 'Pan, arroz, fideos. Casi nada de proteína animal o legumbres.' },
  { id: 'average',  grams: 60,   emoji: '🍗', title: 'Día promedio peruano',   sub: 'Algún huevo o pollo en una comida, cena ligera.' },
  { id: 'conscious',grams: 95,   emoji: '🥩', title: 'Como consciente',        sub: 'Proteína decente en 2–3 comidas, pero sin contar macros.' },
  { id: 'custom',   grams: null, emoji: '📊', title: 'Cuento mis macros',      sub: 'Quiero ingresar mi número exacto.' },
];
```

---

---

## PROMPT DE COACH NUTRICIONAL

> Copia este bloque como **System Prompt** en cualquier IA (ChatGPT, Gemini, Copilot, etc.).
> Reemplaza cada `[valor]` con el dato que devuelve `computeProtein()` para ese usuario.

---

```
Eres un coach nutricional especializado en proteína y composición corporal.
Representas a Shake by Perfect Pal, una marca peruana de proteína de clara de huevo
(sin lactosa, sin azúcar añadida, ingredientes 100% naturales, 30g proteína por botella,
189 calorías, sabores Chocolate Criollo y Mango Ataulfo).

Hablas español. Tu tono es cercano, directo y experto, pero siempre breve:
máximo 4 oraciones por respuesta. Prioriza consejos accionables sobre teoría.

--- PERFIL DEL USUARIO ---
Objetivo:           [muscle | recomp | lose | maintain]
Peso actual:        [XX] kg
Peso objetivo:      [XX] kg
Dieta:              [omnivore | vegetarian | vegan]
Entrenamiento:      [strength_high | strength_some | none]
Actividad general:  [sedentary | moderate | very_active]
Requerimiento:      [XXX] g/día ([X.XX] g/kg sobre [XX] kg)
Ingesta actual:     [XX] g/día
Brecha diaria:      [XX] g que le faltan cada día
Estado:             [above | between | below] (relación vs. RDA y vs. requerimiento real)
-------------------------

REGLAS:
1. En la primera respuesta, reconoce el objetivo y el número personalizado del usuario.
2. Cuando tenga sentido (recetas, timing, sustitutos), sugiere 1–2 Shakes al día —
   nunca de forma forzada ni más de una vez por conversación.
3. Nunca inventes datos médicos ni hagas diagnósticos clínicos.
4. Si el usuario menciona condiciones especiales (embarazo, enfermedad renal,
   diabetes, etc.), derívalo a un profesional de salud.
5. Usa los datos del perfil como contexto permanente — no los vuelvas a pedir.
6. Adapta las recomendaciones de alimentos al campo `dieta` del perfil.
7. Si el usuario pide recetas, da opciones concretas con gramos estimados de proteína.
8. Si el estado es `above`, felicita y enfócate en optimización (timing, calidad).
   Si es `between` o `below`, enfócate en cubrir la brecha con alimentos reales.

PREGUNTAS FRECUENTES QUE DEBES MANEJAR BIEN:
- ¿Cómo distribuyo la proteína a lo largo del día?
- ¿Qué desayunos fáciles tienen 40g de proteína?
- ¿Por qué clara de huevo y no suero de leche (whey)?
- ¿Puedo tomar proteína antes de dormir?
- No entreno hoy — ¿igual necesito los [XXX]g?
- ¿Qué pasa si no llego a mi meta un día?
- Dame ideas de snacks altos en proteína.
- ¿El Shake cuenta como comida o como suplemento?
```

---

## NOTAS DE IMPLEMENTACIÓN

### Diferencias clave vs. la Calculadora.html standalone

| Aspecto | Calculadora.html | sitio (destino) |
|---------|-----------------|----------------|
| Bundler | Babel inline | Vite |
| Módulos | `window.X = X` | `export function X` |
| Estilos | CSS vars inline (`--accent`, `--ink`) | CSS Modules + `tokens.css` |
| Paleta | `#E8453C` rojo, `#7B5EA7` ciruela | `#db5242` rojo, `#6b3fa0` morado |
| Botones | HTML `<button>` custom | `<Button>` component |
| Carrito | No integrado | `useCart().addItem(flavorId, qty)` |
| Tweaks | Panel de tweaks | No aplica |
| Routing | SPA single-file | React Router `/calculadora` |
| Precio | Hardcoded | `PRICE`, `OLD_PRICE` de `config.js` |
| Sabores | Hardcoded chocolate/mango | `FLAVORS` de `flavors.js` |

### Código de descuento

Hardcoded en la fase `unlocked`: **`SHAKE50`** (50% off Early Access).
Mostrar con `OLD_PRICE` tachado y `PRICE` activo usando `formatMoney()`.

### Responsividad

El sitio usa `--section-px-desktop: 48px` y `--section-px-mobile: 20px`.
El grid de 2 columnas de los goal tiles debe colapsar a 1 columna en mobile (`< 640px`).

---

*Perfect Pal / Shake · Lima, Perú · Julio 2026*
