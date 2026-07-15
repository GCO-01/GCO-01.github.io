# Calculadora de Proteína — Funcionamiento a nivel de lógica

> Documento de referencia técnica. Describe al 100% la versión actual de la calculadora
> ubicada en `/calculadora`: arquitectura, inputs, fórmulas internas, fuentes citadas,
> plan de comidas, gate de email y casos límite. Escrito para que un dev sin conocimiento
> previo del proyecto pueda entenderla de forma holística sin abrir el repo.

---

## 1. Resumen general

La "Calculadora" de VAGGO es una **calculadora de requerimiento diario de proteína**
(gramos/día). Es una herramienta de marketing/lead-magnet para el producto principal
(shakes de proteína): el usuario responde 3 pasos de formulario, recibe su dosis diaria
de proteína calculada con respaldo científico, y para "desbloquear" su plan de comidas
personalizado debe dejar nombre y email. Tras desbloquear, ve un código de descuento
(`SHAKE50`) y un CTA para agregar el shake al carrito.

**Puntos clave de arquitectura:**

- **100% client-side.** Todo el cálculo ocurre en el navegador con JavaScript puro.
  No hay backend, ni API, ni funciones serverless involucradas.
- **El email capturado NO se envía a ningún lado.** No hay persistencia ni integración
  con CRM/email. Está confirmado por un comentario explícito en el código:
  `CalcUnlocked.jsx:26` — *"No afirmar envío por email: hoy no existe backend que lo envíe"*.
  El nombre/email solo viven en el estado de React de la sesión actual.
- **Las "fuentes" que se muestran son referencias científicas de nutrición deportiva**
  (no legales): Morton et al. 2018, Phillips et al. 2016 y Patrick (FoundMyFitness) 2024.
  Ver sección 8.

---

## 2. Contexto del proyecto y arquitectura de la versión actual

### 2.1 Stack

- **React + Vite**, componentes funcionales con hooks. Estilos con **CSS Modules**
  (`Calculadora.module.css`, compartido por todos los componentes de la calculadora).
- Ruta registrada en `src/App.jsx` como `/calculadora`, con **lazy loading**
  (la calculadora representa ~31% del CSS del proyecto y solo se descarga al visitarla):

```jsx
// App.jsx
const Calculadora = lazy(() =>
  import('./pages/Calculadora').then(m => ({ default: m.Calculadora }))
);
// ...
<Route path="/calculadora" element={<Calculadora />} />
```

### 2.2 Inventario de archivos

| Archivo | Rol |
|---|---|
| `src/pages/Calculadora.jsx` | Página raíz / orquestador. Máquina de estados de fases y dueño de todo el estado. |
| `src/data/calculadora.js` | **Núcleo de lógica**: `computeProtein()`, `buildMealPlan()`, `INTAKE_PATTERNS`, `RANGE_ROWS`, `CITATIONS`. Sin React, funciones puras. |
| `src/data/calculadora.test.js` | Tests (vitest) que codifican el comportamiento esperado del algoritmo. |
| `src/components/calculadora/CalcIntro.jsx` | Pantalla de bienvenida con CTA "INICIAR PROTOCOLO". |
| `src/components/calculadora/CalcForm.jsx` | Formulario de 3 pasos. Contiene `PhaseBar`, opciones de entrenamiento/actividad y la validación por paso. |
| `src/components/calculadora/GoalTile.jsx` | Tarjeta seleccionable de objetivo (paso 0), con gráfico SVG y multiplicador visible. |
| `src/components/calculadora/CalcResult.jsx` | Pantalla de resultado. Contiene `ProfileHero` (donut/déficit), `SwipeCard` (tabs ANÁLISIS/CIENCIA + cita) y `GateForm` (captura de lead). |
| `src/components/calculadora/CalcUnlocked.jsx` | Pantalla post-unlock: código de descuento, precios, stock, plan de comidas y CTA de carrito. |
| `src/components/calculadora/MealPlan.jsx` | Render presentacional del plan de comidas. |
| `src/components/calculadora/Calculadora.module.css` | Estilos de todo lo anterior. |

**Dependencias auxiliares (fuera de la carpeta calculadora):**

| Archivo | Qué aporta a la calculadora |
|---|---|
| `src/lib/scroll.js` | `scrollToTop()` — se llama en cada cambio de fase/paso. |
| `src/hooks/useCountdown.js` | Solo se reutiliza `padTime()` para numerar las fases ("01 · OBJETIVO"). |
| `src/hooks/useCart.jsx` | `useCartActions().addItem('chocolate', 1)` — botón final de agregar al carrito. |
| `src/data/config.js` | `PRICE`, `OLD_PRICE`, `STOCK`, `formatMoney` (montos en céntimos, formato `S/`) mostrados tras el unlock. Derivan de la entidad `PRODUCT` en `src/data/product.js`. |
| `src/data/promo.js` | `DISCOUNT_CODE = 'SHAKE50'` mostrado tras el unlock. |
| `src/components/ui/Button.jsx` | Botón compartido del design system del sitio. |

### 2.3 Árbol de componentes

```
Calculadora.jsx  (página — estado: phase, step, formData, user)
│
├─ phase === 'intro'    → CalcIntro          (CTA onStart)
│
├─ phase === 'form'     → CalcForm           (step 0/1/2)
│                          ├─ PhaseBar       (progreso de 3 fases, interno de CalcForm)
│                          └─ GoalTile ×4    (solo en step 0)
│
├─ phase === 'result'   → CalcResult
│                          ├─ ProfileHero    (dosis, donut % cubierto, déficit, huevos)
│                          ├─ SwipeCard      (tabs ANÁLISIS / CIENCIA, tabla de rangos, cita)
│                          └─ GateForm       (nombre + email → onUnlock)
│
└─ phase === 'unlocked' → CalcUnlocked
                           └─ MealPlan       (comidas del plan)
```

### 2.4 Máquina de estados

`Calculadora.jsx` mantiene dos piezas de navegación:

- **`phase`**: `'intro' → 'form' → 'result' → 'unlocked'` (siempre hacia adelante,
  salvo `form → intro` con "Atrás" en el paso 0).
- **`step`**: `0 | 1 | 2`, solo relevante dentro de `phase === 'form'`.

Transiciones (todas hacen `scrollToTop()` vía el helper `goPhase`):

| Disparador | Efecto |
|---|---|
| `CalcIntro.onStart` | `step = 0`, `phase = 'form'` |
| `CalcForm.onNext` (`handleNext`) | Si `step < 2`: `step + 1`. Si `step === 2`: `phase = 'result'` |
| `CalcForm.onBack` (`handleBack`) | Si `step > 0`: `step − 1`. Si `step === 0`: `phase = 'intro'` |
| `GateForm → onUnlock` (`handleUnlock`) | Guarda `{ name, email }` en `user`, `phase = 'unlocked'` |

**Dónde vive el estado y cómo fluye:** todo el estado está en la página
(`phase`, `step`, `formData`, `user`); los hijos son controlados y reciben
callbacks por props (`onChange`, `onNext`, `onBack`, `onUnlock`). El resultado se
**recalcula en cada render** (no se guarda en estado):

```jsx
// Calculadora.jsx:26-27
const result = phase !== 'intro' ? computeProtein(formData) : null;
const plan   = result ? buildMealPlan({ grams: result.grams }) : null;
```

### 2.5 Flujo de datos end-to-end

```
CalcForm (inputs del usuario)
   └→ formData en Calculadora.jsx        { goal, weight, target, training, activity, intakePattern, currentIntake }
        └→ computeProtein(formData)      → result { grams, rda, coef, baseWeight, currentIntake, gap, status }
             ├→ CalcResult               (muestra dosis, donut, tabla de rangos, cita de CITATIONS)
             │    └→ GateForm            (nombre + email → user, solo en memoria)
             └→ buildMealPlan({ grams }) → plan { meals, total }
                  └→ CalcUnlocked        (código SHAKE50, precio/stock, MealPlan, addItem al carrito)
```

---

## 3. Código actual comentado

### 3.1 Constantes del algoritmo — `src/data/calculadora.js:1-4`

```js
// Phillips et al. 2016, Morton et al. 2018
const BASE_COEF = { muscle: 1.6, recomp: 1.6, lose: 1.6, maintain: 1.4 };
const TRAINING_DELTA = { strength_high: 0.2, strength_some: 0, none: -0.2 };
const ACTIVITY_DELTA = { very_active: 0.1, moderate: 0, sedentary: -0.1 };
```

- `BASE_COEF`: coeficiente g/kg de partida según objetivo. Tres de los cuatro
  objetivos (músculo, recomposición, perder peso) parten de **1.6 g/kg**; solo
  "mantenerme" parte de **1.4 g/kg**. Estos multiplicadores se muestran al usuario
  en las tarjetas de objetivo (`GoalTile.jsx`, `TILE_META`: "×1.6" / "×1.4").
- `TRAINING_DELTA`: ajuste por frecuencia de entrenamiento de fuerza (+0.2 / 0 / −0.2).
- `ACTIVITY_DELTA`: ajuste por actividad general (+0.1 / 0 / −0.1).

### 3.2 `computeProtein(state)` — `src/data/calculadora.js:6-37` (fórmula principal)

```js
export function computeProtein(state) {
  const { goal, weight, target, training, activity, currentIntake } = state;

  let coef = BASE_COEF[goal] ?? 1.4;          // base según objetivo; fallback 1.4
  coef += TRAINING_DELTA[training] ?? 0;      // delta entreno; fallback 0
  coef += ACTIVITY_DELTA[activity] ?? 0;      // delta actividad; fallback 0
  coef = Math.max(1.2, Math.min(2.0, coef));  // clamp a [1.2, 2.0]

  let baseWeight;
  if (goal === 'lose' || goal === 'recomp') baseWeight = Math.min(weight, target);
  else if (goal === 'muscle') baseWeight = Math.max(weight, Math.min(target, weight + 5));
  else baseWeight = weight;                   // maintain (y cualquier otro valor)

  const grams = Math.round(baseWeight * coef);        // ← LA DOSIS DIARIA
  const rda = Math.round(weight * 0.8);               // RDA oficial de referencia
  const gap = Math.max(0, grams - currentIntake);     // déficit, nunca negativo

  let status;
  if (currentIntake >= grams) status = 'above';       // ya cubre la meta
  else if (currentIntake >= rda) status = 'between';  // sobre la RDA, bajo la meta
  else status = 'below';                              // bajo incluso la RDA

  return {
    grams, rda,
    coef: +coef.toFixed(2),   // coeficiente redondeado a 2 decimales
    baseWeight, currentIntake, gap, status,
  };
}
```

Línea a línea:

1. **Coeficiente** = base por objetivo + delta de entrenamiento + delta de actividad,
   con *clamp* final al rango **[1.2, 2.0] g/kg**. Los `??` hacen que valores
   desconocidos degraden a `1.4` (goal) y `0` (deltas) en vez de romper.
2. **Peso base** (`baseWeight`) — sobre qué kilos se aplica el coeficiente:
   - `lose` / `recomp` → `min(peso actual, peso objetivo)` — se calcula sobre el
     menor de los dos para no sobreestimar en personas que quieren bajar.
   - `muscle` → `max(peso, min(objetivo, peso + 5))` — permite calcular sobre el
     peso objetivo, pero **capado a peso actual + 5 kg** (no puede quedar por
     debajo del peso actual).
   - `maintain` (o goal desconocido) → peso actual.
3. **Salidas**:
   - `grams = round(baseWeight × coef)` — la dosis diaria mostrada en grande.
   - `rda = round(peso actual × 0.8)` — referencia de la RDA oficial (siempre sobre
     el peso actual, no el base).
   - `gap = max(0, grams − currentIntake)` — cuánto le falta al usuario hoy.
   - `status` ∈ `'above' | 'between' | 'below'` según dónde cae su ingesta actual
     respecto de la RDA y la meta.

**Ejemplo numérico** (del test `calculadora.test.js:54-61`): peso 75, objetivo 78,
goal `muscle`, entreno `strength_some`, actividad `moderate`, ingesta 60 g →
coef 1.6, baseWeight `max(75, min(78, 80)) = 78`, `grams = round(78 × 1.6) = 125`,
`rda = 60`, `gap = 65`, `status = 'between'`.

### 3.3 `buildMealPlan({ grams })` — `src/data/calculadora.js:39-84`

```js
export function buildMealPlan({ grams }) {
  const numShakes = grams > 100 ? 2 : 1;              // 2 shakes solo si la meta > 100 g
  const shakeBudget = numShakes * 30;                 // cada shake aporta 30 g de proteína
  const foodBudget = Math.max(20, grams - shakeBudget); // resto en comida, mínimo 20 g

  const breakfast = Math.max(5, Math.round(foodBudget * 0.30)); // 30% desayuno, mín 5 g
  const lunch = Math.max(8, Math.round(foodBudget * 0.45));     // 45% almuerzo, mín 8 g
  const dinner = Math.max(5, foodBudget - breakfast - lunch);   // resto cena, mín 5 g
  // ... arma las comidas y totales (ver abajo)
}
```

Estructura del plan generado:

| Comida | Ítems | Proteína | Kcal |
|---|---|---|---|
| 🌅 Desayuno | Shake Chocolate + "Huevos revueltos con palta" | 30 g + `breakfast` | 189 + `breakfast × 6` |
| ☀️ Almuerzo | "Pechuga de pollo + arroz integral y camote" | `lunch` | `lunch × 6` |
| 💪 Post-entreno | "Shake Mango + plátano" — **solo si `numShakes === 2`** | 30 g | 250 |
| 🌙 Cena | "Lomo de res + camote y ensalada" | `dinner` | `dinner × 6` |

- Las kcal de la comida sólida se estiman con un factor plano de **6 kcal por gramo
  de proteína**; los shakes tienen kcal fijas (189 chocolate, 250 mango+plátano).
- Devuelve `{ meals, total: { grams, kcal } }` donde `total` es la suma de todos
  los ítems.
- **Detalle no obvio:** por los mínimos (`max(20, …)`, `max(5, …)`, `max(8, …)`) y los
  redondeos, `total.grams` **puede no coincidir exactamente con la meta** `grams`.
  Con metas muy bajas queda por encima (ej. meta 40 g → 30 shake + 20 comida = 50 g);
  el test solo garantiza `total.grams ≥ grams − 5`.

### 3.4 Validación del formulario — `CalcForm.jsx:50-55`

```js
function isStepValid(step, formData) {
  if (step === 0) return !!formData.goal;
  if (step === 1) return !!formData.training && !!formData.activity;
  if (step === 2) return !!formData.intakePattern && formData.currentIntake > 0;
  return false;
}
```

El botón "CONFIRMAR" / "EJECUTAR PROTOCOLO" está `disabled` mientras el paso no
sea válido. Nota: en el paso 1 los sliders de peso siempre tienen valor (defaults
75/78), así que solo se exige elegir entrenamiento y actividad.

### 3.5 Selección de cita científica — `CalcResult.jsx:122-125`

```js
let cite;
if (userCoef >= 1.6) cite = CITATIONS.morton;
else if (userCoef >= 1.2) cite = CITATIONS.patrick;
else cite = CITATIONS.phillips;   // inalcanzable en la práctica: el clamp impide coef < 1.2
```

### 3.6 Cálculos de presentación — `CalcResult.jsx` (`ProfileHero`)

```js
const pct = Math.min(100, Math.round((currentIntake / grams) * 100)); // % cubierto (donut)
const eggs = Math.round(gap / 6);                                     // equivalencia: 1 huevo ≈ 6 g
```

- Donut SVG: círculo de radio 58 cuyo `strokeDashoffset` representa `pct`.
- "BRECHA" mostrada = `100 − pct` (%).
- "EQUIVALENCIA" = déficit expresado en huevos (`gap / 6`, redondeado), solo si > 0.
- El número grande de gramos se anima con un *count-up* (hook local `useCountUp`,
  ease-out cúbico de 800 ms) — puramente visual.
- Si `status === 'above'` se muestra el badge "✓ Objetivo cubierto".
- Si `currentIntake === 0` (estado no alcanzable con la validación actual, ver §10)
  se renderiza una versión simple sin donut: solo gramos + `coef g/kg · baseWeight kg base`.

### 3.7 Gate de email — `CalcResult.jsx:6` y `202-232`

```js
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// ...
const valid = name.trim().length > 1 && EMAIL_RE.test(email);
```

Nombre de más de 1 carácter + email con formato básico habilitan el botón
"VER MI PROTOCOLO", que dispara `onUnlock({ name, email })`.

---

## 4. Inputs necesarios para el cálculo

El estado del formulario (`formData`) tiene exactamente **7 campos**, definidos en
`Calculadora.jsx:10-18` con estos defaults:

```js
const DEFAULT_STATE = {
  goal: '', weight: 75, target: 78,
  training: '', activity: '',
  intakePattern: '', currentIntake: 0,
};
```

| Campo | Paso | Control UI | Valores posibles | Usado en la fórmula |
|---|---|---|---|---|
| `goal` | 0 · OBJETIVO | 4 tarjetas `GoalTile` | `muscle` \| `recomp` \| `lose` \| `maintain` | Sí — coeficiente base y regla de `baseWeight` |
| `weight` | 1 · PERFIL | Slider **35–180 kg** (default 75) | entero en rango | Sí — `baseWeight` y RDA |
| `target` | 1 · PERFIL | Slider **35–180 kg** (default 78) | entero en rango | Sí — `baseWeight` (solo lose/recomp/muscle) |
| `training` | 1 · PERFIL | Segmentado | `strength_high` ("3+/sem") \| `strength_some` ("1–2/sem") \| `none` ("Sin entreno") | Sí — delta ±0.2 |
| `activity` | 1 · PERFIL | Segmentado | `sedentary` \| `moderate` \| `very_active` | Sí — delta ±0.1 |
| `intakePattern` | 2 · BASE | 4 tarjetas | `low` \| `average` \| `conscious` \| `custom` | Indirecto — solo fija `currentIntake` |
| `currentIntake` | 2 · BASE | Derivado del patrón, o input numérico **0–400** si `custom` | entero > 0 para avanzar | Sí — `gap`, `status`, % cubierto |

Los patrones de ingesta (`INTAKE_PATTERNS` en `calculadora.js:86-91`) mapean a
gramos preestablecidos:

| Patrón | Gramos asignados | Descripción mostrada |
|---|---|---|
| 🍞 `low` — "Carbs y poco más" | **35 g** | Pan, arroz, fideos. Casi nada de proteína animal o legumbres. |
| 🍗 `average` — "Día promedio peruano" | **60 g** | Algún huevo o pollo en una comida, cena ligera. |
| 🥩 `conscious` — "Como consciente" | **95 g** | Proteína decente en 2–3 comidas, sin contar macros. |
| 📊 `custom` — "Cuento mis macros" | input manual (0–400, clamp inferior a 0) | El usuario escribe su número exacto. |

Al elegir un patrón no-custom, `currentIntake` se sobreescribe con el valor del
patrón; al elegir `custom` se resetea a 0 y aparece el input numérico
(`CalcForm.jsx:144-148, 160-171`).

**No se piden ni usan:** sexo, edad, altura, % de grasa corporal, ni calorías objetivo.

---

## 5. Fórmulas internas (resumen matemático)

```
coef       = clamp( BASE_COEF[goal] + TRAINING_DELTA[training] + ACTIVITY_DELTA[activity], 1.2, 2.0 )

baseWeight = min(weight, target)                      si goal ∈ {lose, recomp}
           = max(weight, min(target, weight + 5))     si goal = muscle
           = weight                                   si goal = maintain (u otro)

grams (dosis diaria) = round( baseWeight × coef )
rda                  = round( weight × 0.8 )
gap                  = max( 0, grams − currentIntake )

status = 'above'    si currentIntake ≥ grams
       = 'between'  si rda ≤ currentIntake < grams
       = 'below'    si currentIntake < rda
```

Rango real del coeficiente por combinación (antes del clamp): mínimo
1.4 − 0.2 − 0.1 = **1.1 → clampa a 1.2**; máximo 1.6 + 0.2 + 0.1 = **1.9**
(el techo de 2.0 nunca se alcanza con las opciones actuales; el clamp superior
es defensivo).

| goal \ ajustes | Mejor caso (+0.2 +0.1) | Neutro | Peor caso (−0.2 −0.1) |
|---|---|---|---|
| muscle / recomp / lose (1.6) | 1.9 | 1.6 | 1.3 |
| maintain (1.4) | 1.7 | 1.4 | 1.2 (clamp desde 1.1) |

---

## 6. Plan de comidas (lógica de `buildMealPlan`)

```
numShakes  = 2  si grams > 100, si no 1
shakeBudget = numShakes × 30          (cada shake = 30 g de proteína)
foodBudget  = max(20, grams − shakeBudget)

desayuno = max(5, round(foodBudget × 0.30))
almuerzo = max(8, round(foodBudget × 0.45))
cena     = max(5, foodBudget − desayuno − almuerzo)
```

- El plan siempre incluye al menos 1 shake (desayuno). El segundo shake
  ("Post-entreno") aparece solo con metas > 100 g.
- Kcal: comida sólida = gramos de proteína × 6; shakes fijos (189 / 250 kcal).
- Los alimentos son fijos (huevos con palta, pollo con arroz y camote, lomo de res);
  solo varían los gramos.
- El total del plan aproxima la meta pero puede desviarse por mínimos y redondeos
  (garantía del test: `total ≥ meta − 5`).

---

## 7. Cálculos de presentación (pantalla de resultado)

| Métrica mostrada | Fórmula | Dónde |
|---|---|---|
| Dosis diaria (número grande) | `grams`, animado con count-up de 800 ms | `ProfileHero` |
| % cubierto (donut) | `min(100, round(currentIntake / grams × 100))` | `ProfileHero` |
| Déficit actual | `gap` | `ProfileHero` |
| Brecha % | `100 − pct` | `ProfileHero` |
| Equivalencia | `round(gap / 6)` huevos (1 huevo ≈ 6 g de proteína) | `ProfileHero` |
| Barras "Tu ingesta / RDA / Tu meta" | altura proporcional a `valor / max(grams, currentIntake, rda) × 108 px` | `SwipeCard`, tab ANÁLISIS |
| Fila resaltada de la tabla de rangos | la fila donde `row.min ≤ coef ≤ row.max` | `SwipeCard`, tab CIENCIA |
| Cita científica | por umbral de coef (ver §8) | `SwipeCard`, tab CIENCIA |

---

## 8. Fuentes mostradas como válidas

Definidas en `CITATIONS` (`calculadora.js:102-106`). Son **referencias de literatura
científica de nutrición deportiva**. En el código no hay URLs, DOI ni enlaces — solo
autor, año, publicación y una nota interpretativa:

| Clave | Autor / Año | Publicación | Afirmación mostrada | Se muestra cuando |
|---|---|---|---|---|
| `morton` | Morton et al., 2018 | *Br. J. Sports Med., 52(6)* | "1.6 g/kg maximiza la ganancia de músculo." | `coef ≥ 1.6` |
| `patrick` | Patrick (FoundMyFitness), 2024 | *The Science of Protein* | "Rango óptimo 1.2–1.6; atletas hasta 2.2." | `1.2 ≤ coef < 1.6` |
| `phillips` | Phillips, Chevalier & Leidy, 2016 | *Appl. Physiol. Nutr. Metab., 41(5)* | "La RDA de 0.8 g/kg está obsoleta para adultos activos." | `coef < 1.2` — **inalcanzable** por el clamp; en la práctica nunca se muestra |

Se muestra **una sola cita a la vez**, elegida por el coeficiente del usuario.
Además, el tab CIENCIA muestra la tabla `RANGE_ROWS` (`calculadora.js:93-100`) con
el rango del usuario resaltado:

| Rango mostrado | Etiqueta | min–max internos (para el resaltado) |
|---|---|---|
| 0.8 g/kg | RDA oficial | 0.8–0.8 |
| 1.2 – 1.6 g/kg | Salud general y mantenimiento | 1.2–1.6 |
| mín. 1.2 g/kg | Adultos mayores | 1.2–1.2 |
| 1.6 g/kg | Entrenamiento de resistencia | 1.6–1.6 |
| > 1.6 g/kg | Recomposición corporal | 1.61–1.99 |
| hasta 2.2 g/kg | Atletas de alto rendimiento | 2.0–2.2 |

Nota: varias filas se solapan (un coef de 1.6 resalta "Salud general" y
"Entrenamiento de resistencia" a la vez; 1.2 resalta "Salud general" y "Adultos
mayores"). La fila "Atletas" (2.0–2.2) solo se resaltaría con coef 2.0, que las
opciones actuales no producen.

Las constantes del algoritmo también referencian estas fuentes en un comentario
(`calculadora.js:1`): base 1.6 (Morton/Phillips) y 1.4 para mantenimiento.

---

## 9. Gate de email y pantalla desbloqueada

**Gate (`GateForm` en `CalcResult.jsx`):**
- Requiere nombre (`trim().length > 1`) y email que pase `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
- Texto de promesa: "Recibe tu plan personalizado + Early Access 50% off en tu primer Shake."
- Al enviar, solo se guarda `{ name, email }` en el estado `user` de la página y se
  cambia a `phase = 'unlocked'`. **No hay envío a servidor ni almacenamiento persistente.**

**Pantalla desbloqueada (`CalcUnlocked.jsx`):**
- Banner "PROTOCOLO ACTIVO — {grams} g/día" con el nombre del usuario. El copy evita
  deliberadamente afirmar que se envió un email (comentario en línea 26).
- Tarjeta de descuento: código `SHAKE50` (`data/promo.js`) con botón copiar
  (usa `navigator.clipboard`, feedback "✓ COPIADO" por 2 s).
- Precio tachado (`OLD_PRICE`), precio actual (`PRICE`) y badge de stock (`STOCK`),
  todos desde `data/config.js` (derivados de la entidad `PRODUCT`, montos en céntimos
  formateados con `formatMoney` en soles peruanos `S/`).
- El plan de comidas (`MealPlan`) con gramos y kcal por ítem.
- CTA final "AGREGAR SHAKE AL CARRITO — 50% OFF" → `addItem('chocolate', 1)` del
  hook global de carrito (`useCart.jsx`).

---

## 10. Casos límite, fallbacks y detalles finos

- **Valores desconocidos no rompen el cálculo**: `goal` desconocido → coef base 1.4 y
  `baseWeight = weight`; `training`/`activity` desconocidos → delta 0
  (operadores `??` en `computeProtein`).
- **El clamp inferior sí actúa** (maintain + sin entreno + sedentario = 1.1 → 1.2);
  **el superior nunca** (máximo real 1.9).
- **`gap` nunca es negativo** (`max(0, …)`); con ingesta ≥ meta, `gap = 0`, el donut
  marca 100% y aparece el badge "Objetivo cubierto".
- **`currentIntake = 0` no puede llegar a resultado** con la UI actual
  (`isStepValid` exige `> 0`), pero `ProfileHero` tiene una rama para ese caso
  (vista simple sin donut) — código defensivo/legado.
- **La cita `phillips` es código muerto en la práctica**: requiere coef < 1.2,
  imposible tras el clamp.
- **`result` y `plan` se recomputan en cada render** (funciones puras, sin memo);
  no hay estado derivado que pueda desincronizarse.
- **El peso objetivo (`target`) solo influye si el goal es lose/recomp/muscle**;
  para maintain se ignora por completo.
- **En `muscle`, subir el objetivo más de +5 kg no cambia nada** (cap `weight + 5`).
- **La RDA siempre se calcula sobre el peso actual**, aunque la dosis use `baseWeight`.
- **El total del plan de comidas es aproximado** (mínimos + redondeos); con metas
  muy bajas queda por encima de la meta.
- **No hay backend**: sin persistencia del lead, sin envío de emails, sin analytics
  específicos de la calculadora en estos archivos. Refrescar la página pierde todo.
- **Especificación formal**: el algoritmo está especificado en `MASTER_PROMPT.md`
  §Algoritmo (referenciado por el header de `calculadora.test.js`), y los 12 tests
  de `src/data/calculadora.test.js` codifican el comportamiento esperado
  (coeficientes, clamp, baseWeight, grams/rda/gap/status, nº de shakes y mínimos).
