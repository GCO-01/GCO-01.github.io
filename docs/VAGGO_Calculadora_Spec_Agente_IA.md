# VAGGO — Calculadora de Proteína: Especificación de Implementación
## Formato para ejecución por agente de IA (frontend/backend). v1.0

---

## 0. Contexto para el agente (leer antes de ejecutar cualquier tarea)

Este documento especifica cambios sobre una calculadora de proteína ya funcional en producción semi-activa (React + Vite, CSS Modules, sin backend). El objetivo NO es reescribir el sistema — es aplicar un conjunto de parches quirúrgicos, ordenados por fase y prioridad.

**Stack existente:**
- React + Vite, componentes funcionales con hooks. CSS Modules (`Calculadora.module.css`).
- Ruta `/calculadora` con lazy loading en `src/App.jsx`.
- Núcleo de lógica puro y testeado en `src/data/calculadora.js` (`computeProtein()`, `buildMealPlan()`, `INTAKE_PATTERNS`, `RANGE_ROWS`, `CITATIONS`).
- Tests en `src/data/calculadora.test.js` (vitest) — **toda tarea que modifique `calculadora.js` debe actualizar o extender estos tests, no romperlos silenciosamente.**
- Árbol de componentes: `Calculadora.jsx` (orquestador) → `CalcIntro` → `CalcForm` (3 pasos, `PhaseBar`, `GoalTile`) → `CalcResult` (`ProfileHero`, `SwipeCard`, `GateForm`) → `CalcUnlocked` (`MealPlan`).
- Estado: `phase` (`intro→form→result→unlocked`) + `step` (`0|1|2`), todo vive en `Calculadora.jsx`, hijos controlados vía props.

**Reglas de ejecución para el agente:**
1. No eliminar ni reescribir componentes/archivos existentes salvo que la tarea lo pida explícitamente.
2. Cada tarea es atómica y debe poder implementarse y verificarse de forma independiente, salvo que su campo `Depende de` diga lo contrario.
3. Toda cifra o afirmación científica debe llevar su cita correspondiente de `CITATIONS` — no introducir números sin fuente.
4. Correr `calculadora.test.js` después de cualquier cambio a `src/data/calculadora.js`.
5. Ejecutar las fases en orden: **Fase 0 → Fase 1 → Fase 2**. No empezar Fase 2 sin haber cerrado Fase 1 (ver criterios de "Definition of Done" al final).

---

## FASE 0 — Quick wins (bajo esfuerzo, alto impacto en percepción y conversión)

Ninguna tarea de esta fase toca lógica de cálculo. Son copy, timing y reuso de componentes/hooks ya existentes. Se pueden implementar todas en paralelo.

### T0.1 — Delay dramático en el reveal del Paso 3

- **Objetivo:** el momento de mayor tensión emocional del funnel (consumo actual vs. objetivo real) actualmente no tiene separación temporal entre ambos números.
- **Archivo:** `CalcResult.jsx`, componente `ProfileHero`.
- **Estado actual:** ambos valores (consumo actual, meta) se renderizan en el mismo ciclo de render, sin secuencia.
- **Estado objetivo:** renderizar primero el bloque de "consumo actual" (con su count-up existente), esperar 600-800ms (usar `setTimeout` + estado local `showTarget`), luego renderizar el bloque de "objetivo real" con su propio count-up y un leve highlight con el gradiente de marca (`#e8453c → #7b5ea7`) al aparecer.
- **Criterio de aceptación:** al cargar la pantalla de resultado, el usuario ve el número de "consumo actual" primero, y el de "objetivo real" aparece con un delay perceptible (no simultáneo).

### T0.2 — Extender `useCountUp` a todos los números clave

- **Objetivo:** ya existe un hook de count-up (ease-out cúbico, 800ms) usado solo para `grams`. Reusarlo eleva la percepción de pulido sin desarrollo nuevo.
- **Archivo:** `CalcResult.jsx` (`ProfileHero`).
- **Estado actual:** count-up solo en el número grande de gramos.
- **Estado objetivo:** aplicar el mismo hook a: `gap` (déficit), `pct` (% cubierto en el donut), `eggs` (equivalencia en huevos).
- **Criterio de aceptación:** los cuatro valores numéricos de `ProfileHero` animan con count-up al montar el componente.

### T0.3 — Corregir copy del gate para no prometer envío de email

- **Objetivo:** el texto actual de `GateForm` ("Recibe tu plan personalizado + Early Access 50% off") implica que se enviará algo por correo. Hoy no hay backend que lo haga (ver T1.8) — la promesa es falsa hasta que T1.8 esté implementada.
- **Archivo:** `CalcResult.jsx`, componente `GateForm`.
- **Estado actual:** copy que promete recepción por email.
- **Estado objetivo:** cambiar a un copy que promete desbloqueo inmediato en pantalla, sin mencionar envío: ej. *"Desbloquea tu protocolo completo ahora — plan de comidas + código de acceso."* Este cambio es independiente de si T1.8 se implementa o no; si T1.8 se implementa después, el copy puede volver a mencionar email en un cambio posterior.
- **Criterio de aceptación:** ningún texto de la pantalla de gate afirma o implica el envío de un correo.

### T0.4 — Reemplazar el hook/copy de apertura con el dato real de ELANS

- **Objetivo:** usar el dato ya citado y validado en `Protein_101_Base_Cientifica_v1.1.md` (Sección 10) como gancho principal, en vez de copy genérico.
- **Archivo:** `CalcIntro.jsx`.
- **Estado actual:** copy de apertura genérico (revisar contenido actual del componente).
- **Estado objetivo:** copy principal basado en: *"El peruano promedio consume ~1.17 g/kg de proteína al día — el borde inferior del rango óptimo, sin margen (ELANS, Nutrients 2023)."* Incluir cita visible o accesible (tooltip/nota al pie), consistente con el estándar de transparencia del resto de la calculadora.
- **Criterio de aceptación:** el copy de `CalcIntro` cita el dato ELANS con atribución visible.

### T0.5 — CTA con verbo + beneficio, no genérico

- **Objetivo:** subir conversión con cambios de texto de bajo riesgo.
- **Archivos:** `CalcForm.jsx` (botón "CONFIRMAR"/"EJECUTAR PROTOCOLO"), `GateForm` (botón "VER MI PROTOCOLO" — ya tiene beneficio, revisar consistencia de tono), `CalcUnlocked.jsx` (CTA final de carrito).
- **Estado objetivo:** todos los CTAs siguen el patrón verbo de acción + beneficio explícito, tono VAGGO (directo, sin genérico tipo "Enviar" o "Continuar"). Ejemplo de dirección: "Cerrar mi brecha →" en vez de textos neutros.
- **Criterio de aceptación:** ningún botón del flujo usa texto genérico sin beneficio (auditar: "Enviar", "Continuar", "Siguiente" quedan prohibidos como texto de botón final).

---

## FASE 1 — Correctness científica y de negocio (antes de tráfico pagado)

Estas tareas sí tocan `calculadora.js` y requieren correr los tests después de cada cambio. Prioridad de ejecución: **T1.1 → T1.2 → T1.3 → T1.8**, el resto puede ir en paralelo.

### T1.1 — Agregar edad como input y usarla en el cálculo

- **Archivos:** `Calculadora.jsx` (`DEFAULT_STATE`), `CalcForm.jsx` (nuevo control en paso 1 · PERFIL), `calculadora.js` (`computeProtein()`, `CITATIONS`).
- **Estado actual:** no existe campo `age`. `computeProtein()` no diferencia por edad.
- **Estado objetivo:**
  - Nuevo campo `age: 'under65' | 'over65'` en `DEFAULT_STATE` (default `'under65'`).
  - Nuevo control UI de 2 botones en el paso 1 (no slider — mantener el formulario rápido).
  - En `computeProtein()`, después del clamp existente, aplicar: `if (age === 'over65') coef = Math.max(coef, 1.2);` — documentado en comentario de código como decisión basada en Moore et al. 2015 / Newman et al. 2023.
  - Agregar `CITATIONS.moore` y `CITATIONS.newman` (fuente: `Protein_101_Base_Cientifica_v1.1.md`, Sección 7 y 3 respectivamente).
  - Lógica de selección de cita (ver T1.4) debe poder mostrar Moore/Newman cuando `age === 'over65'` sea el factor decisivo (es decir, cuando el piso de 1.2 haya sido el que fijó el coeficiente final, no el cálculo base).
- **Criterio de aceptación:** un usuario con `age: 'over65'` y combinación de deltas que resultaría en coef < 1.2 recibe coef = 1.2 con cita Moore/Newman visible. Tests nuevos en `calculadora.test.js` cubren este caso.

### T1.2 — Eliminar `ACTIVITY_DELTA` del cálculo, sin fusionar `activity` con `training` — DECISIÓN CERRADA
 
- **Archivo:** `calculadora.js`, línea 3, `computeProtein()`.
- **Estado actual:** `ACTIVITY_DELTA = { very_active: 0.1, moderate: 0, sedentary: -0.1 }`, sumado independientemente de `TRAINING_DELTA = { strength_high: 0.2, strength_some: 0, none: -0.2 }`.
- **Estado objetivo:** eliminar `ACTIVITY_DELTA` del cálculo de `coef`. `TRAINING_DELTA` **no se modifica — queda confirmado sin cambios**, con sus tres valores actuales (`strength_high: +0.2, strength_some: 0, none: -0.2`) tal como están hoy en `calculadora.js`. El campo `activity` se conserva en el formulario, pero pasa a ser puramente informativo/de segmentación (no afecta `coef` ni `grams`).
- **Decisión del founder (cerrada):** `training` y `activity` siguen siendo dos preguntas separadas — no se fusionan en un solo campo. Cualquier mención previa de "fusionar" en versiones anteriores del documento queda descartada.
- **Justificación científica:** se elimina `ACTIVITY_DELTA` por ausencia de evidencia que lo sustente en adultos jóvenes (no porque esté probado que es irrelevante para toda edad). Newman et al. 2023 confirma la irrelevancia de la actividad sobre el requerimiento total solo en 70-79 años. `training` sí tiene base directa y no acotada por edad (Morton et al. 2018).
- **Nota editorial (tensión conocida, decisión final):** Protein_101 (Sección 7, citando a Patrick 2024) reporta que reducir pasos diarios solo 2 semanas induce resistencia anabólica medible. Esto no contradice la decisión: Newman/Health ABC es un estudio observacional cuya muestra ya incluye el espectro sedentario-activo real de adultos mayores, y encontró que el umbral protector no difiere entre esos estratos — la resistencia anabólica de las personas sedentarias ya está contenida en ese hallazgo. El estudio de reducción de pasos que cita Patrick es una intervención experimental extrema (near-inmovilización), no equivalente a la opción "sedentario" de un formulario de autopercepción. Se descarta deliberadamente agregar una categoría extrema adicional (ej. "reposo/casi no camino") para capturar ese escenario — el founder decidió no introducir esa granularidad en esta fase. No reabrir esta decisión sin nueva evidencia que la justifique.
- **Criterio de aceptación:** `computeProtein()` ya no referencia `ACTIVITY_DELTA`; `TRAINING_DELTA` sigue presente sin modificar. El formulario mantiene ambos campos separados. Tests: dos usuarios idénticos salvo en `activity` obtienen el mismo `grams`; dos usuarios idénticos salvo en `training` obtienen `grams` distinto.

### T1.3 — Diferenciar `recomp`/`lose` de `muscle` en `BASE_COEF` — DECISIÓN CERRADA

- **Archivo:** `calculadora.js`, línea 1-2.
- **Estado actual:** `BASE_COEF = { muscle: 1.6, recomp: 1.6, lose: 1.6, maintain: 1.4 }`.
- **Estado objetivo:** `BASE_COEF = { muscle: 1.6, recomp: 1.3, lose: 1.3, maintain: 1.4 }`.
- **Decisión del founder (cerrada):** `recomp` y `lose` comparten un único coeficiente de **1.3**, sin diferenciarlos entre sí. Razón: no existe en Protein_101 una fuente que trate "bajar de peso" como pregunta de investigación distinta de "recomposición corporal" — ambas describen el mismo escenario fisiológico (déficit calórico + preservación muscular), y para la filosofía de marca de VAGGO "bajar de peso" sin preservar músculo no es un objetivo que la marca promueva.
- **Justificación científica:** Wycherley et al. 2012 (24 estudios, 1,063 participantes) es la única fuente específica de recomposición corporal, y midió **~1.25 g/kg/día real** en el brazo alto-en-proteína. 1.3 es el redondeo más fiel a ese dato medido — no un punto intermedio con la opinión editorial de Patrick (2024) sobre déficit agresivo (esa opinión sugiere ir hacia 1.6, pero es una nota de margen, no el dato base, y no debe hornearse en el coeficiente por defecto).
- **Nota de UI opcional (no bloqueante):** considerar un microcopy tipo "si tu déficit es agresivo, puede convenir acercarte a 1.6 g/kg" como información adicional, no como ajuste automático del cálculo — mantiene la distinción entre dato duro (base) y opinión informada (margen).
- **Copy asociado (`GoalTile.jsx`):** actualizar el multiplicador mostrado en la tarjeta de "recomposición"/"bajar de peso" de "×1.6" a "×1.3", con nota de fuente (Wycherley et al. 2012) si el diseño lo permite.
- **Criterio de aceptación:** tests reflejan `BASE_COEF.recomp === 1.3` y `BASE_COEF.lose === 1.3`.

### T1.4 — Reparar lógica de selección de cita científica

- **Archivo:** `CalcResult.jsx`, líneas 122-125.
- **Estado actual:**
  ```js
  if (userCoef >= 1.6) cite = CITATIONS.morton;
  else if (userCoef >= 1.2) cite = CITATIONS.patrick;
  else cite = CITATIONS.phillips;   // inalcanzable, coef nunca < 1.2
  ```
- **Estado objetivo:**
  ```js
  if (age === 'over65' && coefFloorApplied) cite = CITATIONS.newman;   // ver T1.1
  else if (userCoef >= 1.6) cite = CITATIONS.morton;
  else if (userCoef >= 1.4) cite = CITATIONS.phillips;
  else cite = CITATIONS.patrick;
  ```
- **Depende de:** T1.1 (para la rama `newman`) y T1.3 (el umbral 1.4 debe coincidir con el nuevo `BASE_COEF.maintain`/`recomp`/`lose`).
- **Criterio de aceptación:** con las combinaciones de test existentes, verificar que `CITATIONS.phillips` se muestra en al menos un caso real (antes era código muerto).

### T1.5 — Unificar base de peso entre `rda` y `grams`

- **Archivo:** `calculadora.js`, línea 174.
- **Estado actual:** `rda = Math.round(weight * 0.8)` (peso actual); `grams` usa `baseWeight`.
- **Estado objetivo:** `rda = Math.round(baseWeight * 0.8)` — misma base que `grams`, para que las tres barras comparativas (`ProfileHero`/`SwipeCard`) sean comparables entre sí.
- **Copy asociado:** agregar o confirmar existencia de un micro-texto colapsable ("¿de dónde sale este número?") indicando que el cálculo usa peso objetivo/ideal declarado, no peso corporal total.
- **Criterio de aceptación:** test que verifica `rda` calculado sobre `baseWeight`, no `weight`, para los casos donde ambos difieren (`goal` ∈ `{muscle, lose, recomp}`).

### T1.6 — Recalibrar `INTAKE_PATTERNS` con datos reales (Ipsos/ELANS)

- **Archivo:** `calculadora.js`, `INTAKE_PATTERNS`.
- **Estado actual:** valores fijos sin relación al peso: `low: 35`, `average: 60`, `conscious: 95`.
- **Estado objetivo:** convertir a función de `weight`:
  ```
  low       = round(weight × 0.85)   // Ipsos/Perú21 2024: segmento NSE D/E, restricción económica
  average   = round(weight × 1.17)   // ELANS 2023 (Herrera-Cuenca et al.): 1.12–1.23 g/kg/día real, punto medio
  conscious = round(weight × 1.35)   // extremo alto ELANS / urbano, interpolación editorial declarada
  custom    = input manual (sin cambio)
  ```
- **Copy asociado:** actualizar el micro-texto de cada tarjeta de patrón para citar la fuente real ("Estimado según ELANS 2023 e Ipsos/Perú21 2024" para `low`/`average`; "Estimación editorial" para `conscious`).
- **Fuente completa:** `Protein_101_Base_Cientifica_v1.1.md`, Sección 10.
- **Criterio de aceptación:** `currentIntake` calculado por patrón escala con `weight` (dos usuarios de peso distinto con el mismo patrón ya no reciben el mismo gramaje absoluto). Tests actualizados.

### T1.7 — Etiquetar kcal de comida sólida como estimado

- **Archivo:** `MealPlan.jsx`, `calculadora.js` (`buildMealPlan()`).
- **Estado actual:** kcal de comida sólida = gramos de proteína × 6, sin etiqueta.
- **Estado objetivo:** prefijo `~` antes de cada valor de kcal en el render (`MealPlan.jsx`), y leyenda fija al pie del plan: *"Calorías aproximadas, varían según preparación."*
- **Criterio de aceptación:** todo valor de kcal en el plan de comidas se muestra con `~` y existe la leyenda visible.

### T1.8 — Capture mínimo de leads (sin backend completo)
 
- **Objetivo:** evitar quemar CAC en leads que no persisten en ningún lado.
- **Archivo:** `CalcResult.jsx` (`GateForm`, función `handleUnlock` en `Calculadora.jsx`).
- **Estado actual:** `{name, email}` solo vive en estado de React de la sesión.
- **Estado objetivo:** al ejecutar `onUnlock`, hacer un `POST` (fetch, no bloqueante para la UX — no esperar respuesta para avanzar de fase) a un webhook mínimo (Google Apps Script → Sheets, o endpoint serverless a un servicio de email tipo Resend/SendGrid) con el payload `{name, email, grams, gap, goal, age, training, activity, timestamp}`.
- **Nota:** `training` y `activity` se incluyen aunque `activity` no afecte el cálculo (ver T1.2) — es precisamente el dato de segmentación que esa tarea declara como su único valor restante. Sin este campo en el payload, `activity` no tendría ningún efecto en ninguna parte del sistema.
- **No incluido en esta tarea (fuera de alcance):** CRM completo, segmentación de listas, automatizaciones de email lifecycle — eso es trabajo posterior, no bloqueante para lanzar tráfico.
- **Criterio de aceptación:** al completar el gate, se registra un nuevo registro verificable en la hoja/servicio de destino con los 9 campos indicados, incluyendo `training` y `activity`.
---

## FASE 2 — Experiencia lúdica y de conversión (post-lanzamiento, no bloquea tráfico)

Cada tarea de esta fase es independiente entre sí salvo donde se indique dependencia. No requieren cambios a `calculadora.js` salvo T2.3.

### T2.1 — Paso de curiosidad (hook) antes del formulario

- **Archivo nuevo:** `CalcHook.jsx` (nuevo componente), integrado en `Calculadora.jsx` como nueva fase `'hook'` entre `'intro'` y `'form'`.
- **Estado objetivo:** pantalla de una sola pregunta de opción múltiple sin captura de datos personales, con 3 opciones que llevan todas al mismo siguiente paso pero disparan una variable de estado `hookResponse` que condiciona el copy de transición hacia el formulario. Ejemplo de estructura (copy final a definir con equipo de marca):
  - Pregunta ancla: usar el dato ELANS/Ipsos (ver T0.4) como base.
  - 3 opciones tipo tarjeta, sin inputs de texto.
- **Criterio de aceptación:** nueva fase renderiza antes del formulario, captura `hookResponse` en el estado de `Calculadora.jsx`, y el copy de la primera pantalla de `CalcForm` cambia según la respuesta.

### T2.2 — Micro-pantalla de refuerzo emocional pre-formulario

- **Archivo:** integrar como transición dentro de `CalcHook.jsx` (T2.1) o como fase independiente `'reward'`.
- **Estado objetivo:** pantalla de 1-2 segundos (auto-avance o CTA "Continuar") con copy de validación positiva antes de pedir datos personales — no un formulario, un momento narrativo.
- **Depende de:** T2.1 (comparten la misma fase de transición).
- **Criterio de aceptación:** existe una pantalla/transición visible entre el hook y el primer campo de datos del formulario, con copy de refuerzo (no genérico).

### T2.3 — Generador de prompt personalizado (nuevo entregable central)

- **Archivos:** nuevo módulo `src/data/promptBuilder.js` (función pura `buildPrompt(result, formData)` → string), nuevo componente `PromptCard.jsx` dentro de `CalcUnlocked.jsx`.
- **Estado actual:** el desbloqueo solo entrega plan de comidas fijo.
- **Estado objetivo:** `buildPrompt()` genera un string estructurado (para copiar y pegar en un chat de IA) que incluye: objetivo del usuario, edad, peso, coeficiente objetivo con su cita, gap actual, y una instrucción clara para que una IA genere seguimiento diario. `PromptCard.jsx` renderiza el prompt en un bloque tipo consola con botón "Copiar" (`navigator.clipboard`, ya existe el patrón de feedback "✓ COPIADO" reusable de `GateForm`/descuento).
- **Criterio de aceptación:** al desbloquear, aparece un bloque de prompt personalizado (no genérico) con botón de copiar funcional.

### T2.4 — Código de descuento condicionado a suscripción

- **Archivos:** `CalcUnlocked.jsx`, `src/data/promo.js`.
- **Estado actual:** `SHAKE50` se muestra siempre, incondicionalmente.
- **Estado objetivo:** agregar un toggle/checkbox "Sí, quiero mi código de -X% si me suscribo a entrega semanal" dentro de `CalcUnlocked.jsx`. El código de descuento actual (compra única) se mantiene visible sin condición; un segundo código (mayor descuento, ej. `SUBSCRIBE20`) se revela solo si el toggle está activo.
- **Depende de:** decisión de negocio sobre el mecanismo de suscripción (fuera de alcance técnico — requiere definición de producto antes de codificar el valor exacto del segundo código).
- **Criterio de aceptación:** existe un segundo código de descuento visible solo condicionalmente al toggle de suscripción.

### T2.5 — Plan de comidas semanal desbloqueable

- **Archivos:** `calculadora.js` (`buildMealPlan()` extendido a `buildWeeklyPlan()`), `MealPlan.jsx`.
- **Depende de:** T2.4 (el desbloqueo de la semana completa se ata a la decisión de suscripción).
- **Estado objetivo:** el día 1 se muestra gratis (comportamiento actual); un CTA adicional "Desbloquea tu semana completa" revela 6 días más, condicionado a la misma acción de suscripción de T2.4.
- **Criterio de aceptación:** existe una vista de plan semanal, accesible solo tras la acción condicionante definida.

### T2.6 — Tarjeta de resultado compartible

- **Archivo nuevo:** `ShareCard.jsx`, posiblemente usando `canvas`/`html-to-image` para exportar el resultado (gap + objetivo) como imagen tipo story de Instagram.
- **Estado objetivo:** botón "Compartir mi resultado" en `CalcUnlocked.jsx` que genera y descarga/comparte una imagen con el gap del usuario, sin exponer el prompt completo (privacidad) ni datos personales.
- **Criterio de aceptación:** el botón genera una imagen descargable con el resultado numérico y branding VAGGO.

### T2.7 — Barra de progreso animada con trazo (reemplaza `PhaseBar` actual)

- **Archivo:** `PhaseBar.jsx` (dentro de `CalcForm.jsx`).
- **Estado objetivo:** relleno animado por trazo (stroke-dasharray/CSS transition) en vez de barra de porcentaje genérica, extendida para cubrir también las nuevas fases `hook`/`reward` de T2.1/T2.2 (5 segmentos totales en vez de 3).
- **Criterio de aceptación:** la barra de progreso refleja las 5 fases del funnel completo (hook, reward, form, result, unlocked) con animación de trazo al avanzar.

### T2.8 — Corregir resaltados superpuestos en `RANGE_ROWS`

- **Archivo:** `calculadora.js`, `RANGE_ROWS`; `SwipeCard.jsx` (lógica de resaltado).
- **Estado actual:** un `coef` de 1.6 resalta simultáneamente dos filas ("Salud general" y "Entrenamiento de resistencia"); la fila "Atletas" (2.0-2.2) nunca se resalta.
- **Estado objetivo:** redefinir rangos como mutuamente excluyentes (sin solapamiento) y ajustar el techo superior real del `coef` (post T1.2/T1.3) para que sea matemáticamente alcanzable si se quiere mantener la fila de atletas, o eliminar esa fila si el producto no la necesita.
- **Depende de:** T1.2 y T1.3 (el rango real de `coef` cambia con esas tareas).
- **Criterio de aceptación:** para cualquier valor de `coef` producido por `computeProtein()`, exactamente una fila de `RANGE_ROWS` queda resaltada.

### T2.9 — Ocultar/explicar el campo `target` cuando `goal === 'maintain'`

- **Archivo:** `CalcForm.jsx` (paso 1 · PERFIL).
- **Estado objetivo:** si `formData.goal === 'maintain'`, ocultar el slider de peso objetivo o reemplazarlo por un texto explicativo ("Tu objetivo es mantener tu peso actual, no necesitamos este dato").
- **Criterio de aceptación:** el slider de `target` no se muestra (o se explica) cuando el objetivo seleccionado es `maintain`.

---

## Fuera de alcance (explícitamente, para que el agente no lo asuma)

- CRM completo, automatizaciones de email lifecycle, segmentación de listas — solo el capture mínimo de T1.8.
- Sistema de suscripción real (checkout, recurrencia, gestión de pagos) — T2.4/T2.5 solo preparan el gancho de UI, no implementan la lógica de negocio de suscripción.
- Contenido del plan de comidas semanal completo (7 días de recetas) — T2.5 solo construye el mecanismo de desbloqueo; el contenido nutricional de los 6 días adicionales requiere validación de Zulema (ingeniería alimentaria) antes de redactarse.
- Rediseño visual completo del sistema — todas las tareas usan el UI Kit y componentes ya existentes (`Button.jsx`, `Calculadora.module.css`).

---

## Definition of Done por fase

**Fase 0:** todas las tareas T0.1-T0.5 implementadas y verificables visualmente en un review manual de 5 minutos del flujo completo. No requiere QA de lógica de cálculo.

**Fase 1:** todos los tests de `calculadora.test.js` pasan (incluyendo los nuevos casos de T1.1, T1.3, T1.5, T1.6). T1.8 verificado con al menos un registro de prueba end-to-end llegando al destino configurado. Solo al cerrar Fase 1 se considera la calculadora lista para tráfico pagado.

**Fase 2:** cada tarea se considera un incremento independiente — no hay gate de "todo o nada"; se puede lanzar tráfico con Fase 1 cerrada y Fase 2 en progreso.
