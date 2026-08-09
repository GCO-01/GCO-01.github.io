# VAGGO — Calculadora de Proteína: Plan de Implementación por Fases

> Plan ejecutable derivado de `VAGGO_Calculadora_Spec_Agente_IA.md` v1.0.
> Cubre frontend (React 18 + Vite + CSS Modules en `frontend/`) y backend (scaffold FastAPI en `backend/`).
> Rutas expresadas post-reorganización del monorepo. Redactado en modo planificación — sin código implementado.

## 0. Contexto arquitectural verificado

- **Hosting: estático.** El repo `vaggo-web/` deploya el `frontend/` a GitHub Pages user-site (`GCO-01.github.io`) vía Actions. **No corre ningún backend en producción.**
- **Backend: scaffold sin lógica.** `backend/app/` tiene Clean Architecture (api → service → repository → domain), pero:
  - `api/v1/leads.py`: `POST /api/v1/leads` devuelve `501 Not Implemented`.
  - `domain/models.py`: `LeadCreate { name, email, calc_payload: dict|None }` y `Lead { id, created_at }`. **Nota:** el payload de la spec (`grams, gap, goal, age, timestamp`) encaja en `calc_payload` sin cambiar el modelo, salvo que se quiera tipar fuerte.
  - `repositories/lead_repository.py`: stub. Sin DB, sin migraciones, sin ORM configurado.
  - Sin hosting, sin CORS configurado, sin variables de entorno de producción.
- **CSP restrictiva.** `backend/deploy/nginx.conf` fija `connect-src 'self'`. Cualquier `POST` a un webhook/API externo (Apps Script, Render, etc.) será **bloqueado por el navegador** hasta ampliar `connect-src`. Esta CSP solo aplica si se sirve el frontend vía ese nginx; GitHub Pages usa su propia cabecera (o ninguna), por lo que hay que auditar **ambos** caminos de deploy.
- **Dependencia documental faltante:** `Protein_101_Base_Cientifica_v1.1.md` (fuente de citas Moore, Newman, ELANS, Wycherley, Ipsos) **no existe en el repo**. La spec trae los números inline pero no el formato completo (journal, volumen, páginas) de cada cita. Bloquea el detalle final de T0.4, T1.1, T1.4, T1.6 (los números se pueden hornear; el texto exacto de la cita queda pendiente).
  - **DECISIÓN (usuario):** el usuario aportará el doc `Protein_101` o el texto exacto de cada cita **antes** de implementar las tareas de Fase 1 que muestran cita nueva (T0.4, T1.1, T1.4, T1.6). Hasta recibirlo: se puede avanzar en los coeficientes/fórmulas (números) pero **no** se publican citas Moore/Newman/ELANS/Wycherley/Ipsos con journal/volumen provisional. Las citas existentes (`morton`/`phillips`/`patrick`) siguen intactas.

## Decisiones del usuario (cerradas en planificación)

1. **T1.8 destino de leads → Opción C híbrido, arrancando por B.** Frontend POSTea a un **Google Apps Script → Google Sheet** ahora (cero hosting, verificable end-to-end, no bloquea lanzamiento). El scaffold FastAPI queda como destino "real" post-lanzamiento, migrando `VITE_LEADS_ENDPOINT` cuando tenga hosting + Postgres. **Prerequisito del usuario:** proveer la cuenta Google + Sheet destino (o autorizar su creación) y la URL del Apps Script desplegado.
2. **Citas científicas → AMBOS docs RECIBIDOS** (en `docs/`): `Protein_101_Base_Cientifica.md` (Moore 2015, Newman 2023, Wycherley 2012, Nunes 2022, Phillips 2016, Morton 2018) y `Consumo_Proteina_Peru_LATAM.md` (ELANS/Herrera-Cuenca 2023 e Ipsos-Perú21 2024). **T0.4 y T1.6 quedan DESBLOQUEADAS** — ver "CITATIONS a implementar" abajo. Ya no hay dependencias documentales abiertas para Fase 0/1.
3. **T2.8 → eliminar la fila "Atletas 2.0–2.2".** Ver T2.8 abajo (decisión cerrada del founder).
4. **T2.2 → ELIMINADA del alcance** (decisión del usuario): la micro-pantalla de refuerzo emocional se descarta por ahora ("es distracción"). Impacta T2.7 (la barra pasa a **4 segmentos**: hook, form, result, unlocked — no 5).
5. **T2.4 → queda ABIERTA** (sin implementar): el valor del segundo código de descuento y el mecanismo de suscripción quedan pendientes de decisión de producto. T2.5 (que depende de T2.4) también queda en espera.

## CITATIONS a implementar (de `Protein_101_Base_Cientifica.md`)

Agregar a `CITATIONS` en `frontend/src/data/calculadora.js` (formato consistente con las existentes `{ author, year, journal, note }`):

```js
moore:    { author: 'Moore et al.',   year: '2015', journal: 'J. Gerontol. A Biol. Sci. Med. Sci., 70(1)', note: 'Los adultos mayores requieren ~0.40 g/kg por comida (vs. 0.24 en jóvenes) por resistencia anabólica.' },
newman:   { author: 'Newman et al.',  year: '2023', journal: 'J. Gerontol. A Biol. Sci. Med. Sci., 78(11)', note: 'En adultos mayores, ≥1.2 g/kg/día preserva músculo; el nivel de actividad no cambia la dosis total (Health ABC).' },
wycherley:{ author: 'Wycherley et al.', year: '2012', journal: 'Am. J. Clin. Nutr., 96(6)', note: 'Recomposición corporal: ~1.25 g/kg/día preserva masa magra en déficit (24 estudios, 1,063 participantes).' },
// opcional, refuerza el corte por edad de T1.1:
nunes:    { author: 'Nunes et al.',   year: '2022', journal: 'J. Cachexia Sarcopenia Muscle, 13(2)', note: '<65 años: ≥1.6 g/kg/día; ≥65 años: 1.2–1.59 g/kg/día (74 RCTs).' },
// consumo poblacional Perú (T0.4 hook, T1.6 patrones):
elans:    { author: 'Herrera-Cuenca et al. (ELANS)', year: '2023', journal: 'Nutrients, 15, 669', note: 'El consumo promedio en Perú (~78–80 g/día ≈ 1.1–1.2 g/kg) está en el borde inferior del rango óptimo, sin margen.' },
ipsos:    { author: 'Ipsos / Perú21', year: '2024', journal: 'Situación Social — Alimentación', note: 'Solo 1 de cada 3 peruanos come proteína animal a diario; 42% no pudo comer por falta de dinero en el último mes.' },
```

Ajuste de la cita `morton` existente si se quiere precisión: el punto de inflexión real es **1.62 g/kg** (IC 95% 1.03–2.20), con ~2.2 como techo "prudente" — coherente con el texto informativo de T2.8.

---

## FASE 0 — Quick wins (copy, timing, reuso). No toca lógica de cálculo.

Todas paralelizables. DoD: review manual visual de 5 min del flujo completo. Sin QA de cálculo.

### T0.1 — Delay dramático en reveal del Paso 3
- **Archivo:** `frontend/src/components/calculadora/CalcResult.jsx` (`ProfileHero`).
- **Cambio:** estado local `showTarget` (default `false`); `useEffect` con `setTimeout` 600–800 ms al montar → `true`. Renderizar "consumo actual" con su count-up siempre; "objetivo real" solo cuando `showTarget`, con highlight gradiente `#e8453c→#7b5ea7`.
- **Tests:** ninguno (visual). Limpiar el timeout en cleanup del effect.
- **Aceptación:** el número objetivo aparece con delay perceptible, no simultáneo.

### T0.2 — Extender `useCountUp` a gap/pct/eggs
- **Archivo:** `CalcResult.jsx` (`ProfileHero`).
- **Cambio:** aplicar el hook `useCountUp` existente (ease-out cúbico, 800 ms) a `gap`, `pct`, `eggs` además de `grams`.
- **Tests:** ninguno. Cuidar que el count-up de `pct` alimente el `strokeDashoffset` del donut sin romper el render inicial (empezar en 0).
- **Aceptación:** los 4 valores animan al montar.

### T0.3 — Copy del gate sin promesa de email
- **Archivo:** `CalcResult.jsx` (`GateForm`).
- **Cambio:** reemplazar "Recibe tu plan personalizado + Early Access 50% off" por copy de desbloqueo inmediato en pantalla (ej. "Desbloquea tu protocolo completo ahora — plan de comidas + código de acceso"). Independiente de T1.8.
- **Aceptación:** ningún texto del gate implica envío de correo. (Coherente con el comentario ya existente en `CalcUnlocked.jsx:26`.)

### T0.4 — Hook de apertura con dato ELANS
- **Archivo:** `frontend/src/components/calculadora/CalcIntro.jsx`.
- **Cambio:** copy principal basado en "El peruano promedio consume ~1.1–1.2 g/kg/día — el borde inferior del rango óptimo, sin margen (ELANS, Nutrients 2023)". Cita visible (tooltip o nota al pie) usando `CITATIONS.elans`.
- **Fuente:** `Consumo_Proteina_Peru_LATAM.md` (ELANS: 78.6–79.8 g/día ≈ 1.1–1.2 g/kg). **Hook alternativo más potente** (opcional, a validar con marca): la brecha de *frecuencia* — "solo 1 de cada 3 peruanos come proteína a diario" (Ipsos 2024, `CITATIONS.ipsos`) — es un gancho emocional más fuerte que el g/kg. Considerar A/B.
- **Aceptación:** el copy cita ELANS (o Ipsos) con atribución visible.

### T0.5 — CTAs verbo + beneficio
- **Archivos:** `CalcForm.jsx` (botón confirmar), `CalcResult.jsx` (`GateForm`), `CalcUnlocked.jsx` (CTA carrito).
- **Cambio:** todos los CTAs con patrón verbo+beneficio, tono VAGGO. Prohibidos "Enviar/Continuar/Siguiente" como texto de botón final.
- **Aceptación:** auditoría de botones sin texto genérico.

---

## FASE 1 — Correctness científica y de negocio. Toca `calculadora.js`; correr tests tras cada cambio.

**Orden obligatorio:** T1.1 → T1.2 → T1.3 → T1.8. El resto (T1.5, T1.6, T1.7) en paralelo. T1.4 depende de T1.1 + T1.3.
**DoD Fase 1:** `frontend/src/data/calculadora.test.js` verde con casos nuevos (T1.1, T1.3, T1.5, T1.6); **T1.8 con un registro end-to-end real** llegando al destino. Solo entonces la calculadora está lista para tráfico pagado.

### T1.1 — Edad como input y factor de cálculo (primero)
- **Archivos:** `frontend/src/pages/Calculadora.jsx` (`DEFAULT_STATE`), `CalcForm.jsx` (control paso 1 · PERFIL), `frontend/src/data/calculadora.js` (`computeProtein`, `CITATIONS`).
- **Cambio:**
  - `DEFAULT_STATE.age = 'under65'` (valores `'under65' | 'over65'`).
  - Control UI de 2 botones (no slider) en paso 1. Incluir en la validación solo si se decide obligatorio (default ya cubre el caso).
  - En `computeProtein()`, **después del clamp**: `if (age === 'over65') coef = Math.max(coef, 1.2)`. Exponer un flag `coefFloorApplied` en el retorno (booleano: el piso 1.2 fue el que fijó el coef final) para que T1.4 seleccione la cita Newman.
  - Agregar `CITATIONS.moore` y `CITATIONS.newman` (texto pendiente de `Protein_101` §7/§3 — ver D2).
- **Tests:** caso `over65` + deltas que darían coef < 1.2 → coef == 1.2 y `coefFloorApplied === true`. Caso `over65` con coef base alto (ej. 1.6) → sin cambio, `coefFloorApplied === false`.
- **Aceptación:** usuario `over65` con combinación baja recibe coef 1.2 con cita Moore/Newman.

### T1.2 — Eliminar `ACTIVITY_DELTA` del cálculo (segundo)
- **Archivo:** `calculadora.js` (const línea 3, `computeProtein`).
- **Cambio (Opción A, recomendada):** quitar `ACTIVITY_DELTA` de la fórmula de `coef`. Conservar el campo `activity` en el form solo como segmentación; microcopy aclaratorio si es visible ("Esto nos ayuda a conocerte, no cambia tu dosis"). No borrar el campo del estado ni del form (se sigue capturando para el lead).
- **Impacto en rango de coef:** el techo real baja de 1.9 a 1.8 (1.6 + 0.2 training) y el piso de 1.1→1.2 pasa a 1.2 (1.4 − 0.2). **Insumo directo para T2.7 y T2.8.**
- **Tests:** dos usuarios idénticos salvo `activity` → mismo `grams`. Actualizar cualquier test existente que asumiera el delta de actividad.
- **Aceptación:** `computeProtein` ya no referencia `ACTIVITY_DELTA` en `coef`.

### T1.3 — `BASE_COEF` recomp/lose = 1.3 (tercero, decisión cerrada)
- **Archivos:** `calculadora.js` (líneas 1-2), `frontend/src/components/calculadora/GoalTile.jsx` (`TILE_META`).
- **Cambio:** `BASE_COEF = { muscle: 1.6, recomp: 1.3, lose: 1.3, maintain: 1.4 }`. Actualizar multiplicador mostrado en la tarjeta recomp/lose de "×1.6" a "×1.3" con fuente Wycherley 2012 si el diseño lo permite.
- **Impacto en rango de coef:** recomp/lose ahora produce 1.1→clamp 1.2 (peor caso) a 1.5 (mejor, tras T1.2). Reconsiderar el clamp inferior y las filas de `RANGE_ROWS` (T2.8).
- **Tests:** `BASE_COEF.recomp === 1.3`, `BASE_COEF.lose === 1.3`. Actualizar el ejemplo numérico de test que use recomp/lose.
- **Aceptación:** tests reflejan 1.3.

### T1.4 — Reparar selección de cita (depende de T1.1 y T1.3)
- **Archivo:** `CalcResult.jsx` (~líneas 122-125).
- **Cambio (refinado con Protein_101 — usa Wycherley para recomp/lose):**
  ```js
  if (age === 'over65' && coefFloorApplied) cite = CITATIONS.newman;   // T1.1
  else if (userCoef >= 1.6) cite = CITATIONS.morton;                   // maximizar músculo
  else if (goal === 'recomp' || goal === 'lose') cite = CITATIONS.wycherley; // recomp ~1.3
  else if (userCoef >= 1.4) cite = CITATIONS.phillips;                 // salud general 1.4–1.6
  else cite = CITATIONS.patrick;                                       // fallback (maintain con deltas bajos)
  ```
  Wycherley es la fuente **específica** de recomposición corporal (~1.25 g/kg), más precisa que Patrick para los objetivos `recomp`/`lose` (coef 1.3 post-T1.3). Sin esta rama, esos usuarios verían una cita genérica. El umbral 1.4 coincide con `BASE_COEF.maintain` post-T1.3.
- **Tests:** verificar que cada rama es alcanzable con combinaciones reales: `morton` (muscle), `wycherley` (recomp/lose), `phillips` (maintain + training alto → 1.4–1.6), `patrick` (maintain neutro/bajo), `newman` (over65 con piso). Ninguna debe quedar como código muerto.
- **Aceptación:** phillips deja de ser código muerto; cada objetivo muestra la cita más específica disponible.

### T1.5 — Unificar base de peso rda/grams (paralelo)
- **Archivo:** `calculadora.js` (~línea 174).
- **Cambio:** `rda = Math.round(baseWeight * 0.8)` en vez de `weight * 0.8`. Microcopy colapsable "¿de dónde sale este número?" aclarando peso objetivo/ideal, no peso corporal total.
- **Tests:** para `goal ∈ {muscle, lose, recomp}` donde `weight ≠ baseWeight`, `rda` calculado sobre `baseWeight`.
- **Aceptación:** las tres barras comparativas (ingesta/RDA/meta) usan la misma base.

### T1.6 — Recalibrar `INTAKE_PATTERNS` a función de peso (paralelo)
- **Archivo:** `calculadora.js` (`INTAKE_PATTERNS`) y donde se resuelve `currentIntake` al elegir patrón (`CalcForm.jsx`).
- **Cambio:** convertir de valores fijos a función de `weight`:
  - `low = round(weight × 0.85)`, `average = round(weight × 1.17)`, `conscious = round(weight × 1.35)`, `custom = manual`.
  - **Refactor de contrato:** hoy `INTAKE_PATTERNS` es un mapa a números; pasa a requerir `weight`. Definir si se expone como función `intakeFor(pattern, weight)` o si `CalcForm` calcula al setear el patrón. Auditar todos los consumidores (form + tests + cualquier display de gramos del patrón).
  - Actualizar microcopy de cada tarjeta con fuente real (`CITATIONS.elans`/`CITATIONS.ipsos` para low/average; "estimación editorial" para conscious).
- **Validación de multiplicadores contra `Consumo_Proteina_Peru_LATAM.md`:**
  - `average = weight × 1.17` ✓ coincide con ELANS Perú (~1.1–1.2 g/kg real).
  - `low = weight × 0.85` — ancla editorial en el segmento con restricción económica (Ipsos: 42% no pudo comer por dinero; NSE D/E); por debajo del promedio, coherente.
  - `conscious = weight × 1.35` — **interpolación editorial declarada**: está por encima del promedio real peruano (representa a quien come conscientemente); etiquetar como estimación, no como dato ELANS.
- **Tests:** dos usuarios de peso distinto, mismo patrón → distinto `currentIntake` absoluto.
- **Aceptación:** `currentIntake` por patrón escala con `weight`.

### T1.7 — Etiquetar kcal como estimadas (paralelo)
- **Archivos:** `frontend/src/components/calculadora/MealPlan.jsx`, `calculadora.js` (`buildMealPlan`).
- **Cambio:** prefijo `~` antes de cada kcal en el render; leyenda fija al pie "Calorías aproximadas, varían según preparación". (El cálculo `gramos × 6` puede quedarse en `buildMealPlan`; el `~` es presentación.)
- **Aceptación:** toda kcal con `~` + leyenda visible.

### T1.8 — Captura mínima de leads (ÚNICO backend que bloquea tráfico pagado)

**Frontend (fijo, común a todas las opciones):**
- **Archivos:** `CalcResult.jsx` (`GateForm`) y `handleUnlock` en `Calculadora.jsx`.
- **Cambio:** en `onUnlock`, `fetch` POST **no bloqueante** (no esperar respuesta para avanzar de fase; `.catch` silencioso o log) con payload `{ name, email, grams, gap, goal, age, timestamp }`. La URL destino viene de una variable de entorno de build (`import.meta.env.VITE_LEADS_ENDPOINT`) para no hornear la URL.
- **Impacto CSP/seguridad (obligatorio documentar):** el destino del POST es un host externo. Hay que **ampliar `connect-src`** en `backend/deploy/nginx.conf` (agregar el origen exacto del webhook/API, ej. `connect-src 'self' https://script.google.com` o el dominio del backend). En GitHub Pages, verificar que no exista un `<meta http-equiv="Content-Security-Policy">` que lo bloquee. **No usar comodines** en `connect-src`.
- **Tests:** el fetch debe estar aislado de `computeProtein` (lógica pura intacta). Mock del fetch en el test de `handleUnlock` si se agrega; garantizar que un fallo de red NO impide `phase = 'unlocked'`.

**Decisión de backend — trade-off:**

| | A) FastAPI real | B) Apps Script → Sheets | C) Híbrido |
|---|---|---|---|
| Hosting | Requiere host (Render/Railway/Fly free tier) | Ninguno (Google lo hostea) | Frontend→Apps Script ahora; FastAPI después |
| Persistencia | SQLite (efímera en free tier) o Postgres gestionado | Google Sheet | Sheet ahora, DB luego |
| CORS | Configurar `CORSMiddleware` con el origin de Pages | Apps Script devuelve CORS abierto; usar `mode:'no-cors'` o `text/plain` para evitar preflight | ídem B |
| Trabajo | Alto: implementar service+repo+migración+deploy+secrets+CI | Bajo: 1 script `doPost(e)` + `SpreadsheetApp.appendRow` | Bajo ahora |
| CSP | `connect-src` = dominio del backend | `connect-src https://script.google.com` | igual que B |
| Free-tier gotchas | Cold starts, sleep del servicio, DB efímera → leads perdidos si SQLite en disco efímero | Cuotas de Apps Script (generosas para este volumen) | — |
| Aprovecha scaffold | Sí | No (queda para después) | Sí, diferido |

**Recomendación única: Opción C (híbrido), arrancando por B.**
- **Por qué:** T1.8 es lo único de backend que bloquea el lanzamiento. El objetivo es no perder leads con CAC pagado, no construir infraestructura. Apps Script→Sheets da un destino verificable end-to-end en horas, sin hosting ni riesgo de DB efímera, y cumple el criterio de aceptación (registro real en Sheet). El scaffold FastAPI **no se tira**: queda como el destino "real" para la fase post-lanzamiento (CRM, dedupe, email lifecycle), migrando la URL del `VITE_LEADS_ENDPOINT` cuando el backend tenga hosting + Postgres. Opción A pura arriesga el lanzamiento por cold starts y persistencia efímera; Opción B pura desperdicia el scaffold ya escrito.
- **Nota sobre "cambios en frontend y backend":** el híbrido satisface ambos frentes: frontend gana el POST + config CSP ahora; el trabajo de backend (implementar `lead_service` + `lead_repository` + persistencia real + deploy) queda especificado y agendado como fase inmediatamente posterior, sin ser gate del tráfico. Si el usuario exige backend propio funcional en este ciclo, escalar a Opción A con Postgres gestionado (no SQLite efímero) y aceptar el riesgo de cold-start en el free tier.
- **Ítems concretos si/cuando se active el FastAPI (Opción A / fase C-2):** implementar persistencia en `lead_repository.py`, lógica en `lead_service.py`, quitar el 501 de `leads.py`, `CORSMiddleware` con el origin de Pages, tipar el payload (extender `LeadCreate` o dejar `calc_payload` como dict), variables de entorno/secrets, deploy en el host elegido, actualizar `VITE_LEADS_ENDPOINT` y `connect-src`.

- **Aceptación (DoD Fase 1):** al completar el gate en un build de prueba, aparece un registro verificable en el destino (Sheet o API) con `{name, email, grams, gap, goal, age, timestamp}`.

---

## FASE 2 — Experiencia lúdica y conversión. Post-lanzamiento, NO bloquea tráfico.

Cada tarea es un incremento independiente (sin gate todo-o-nada). Solo T2.3 y T2.5/T2.8 tocan lógica.

### T2.1 — Paso hook antes del formulario (depende conceptual de T0.4)
- **Archivo nuevo:** `frontend/src/components/calculadora/CalcHook.jsx`. Integrar en `Calculadora.jsx` como fase `'hook'` entre `'intro'` y `'form'`.
- **Cambio:** pantalla de 1 pregunta de opción múltiple (dato ELANS/Ipsos como ancla), 3 tarjetas sin inputs de texto, todas avanzan al form pero setean `hookResponse` en el estado de `Calculadora.jsx`; el copy de la 1ª pantalla de `CalcForm` cambia según la respuesta. Actualizar la máquina de estados (`goPhase`) y `scrollToTop`.
- **Aceptación:** la fase hook renderiza antes del form y condiciona el copy.

### T2.2 — ~~Micro-pantalla de refuerzo~~ — ELIMINADA (decisión del usuario)
- Descartada del alcance: se consideró distracción. No se implementa la fase `'reward'`. La barra de progreso (T2.7) queda en 4 segmentos, no 5.

### T2.3 — Generador de prompt personalizado
- **Archivos nuevos:** `frontend/src/data/promptBuilder.js` (función pura `buildPrompt(result, formData)` → string), `PromptCard.jsx` dentro de `CalcUnlocked.jsx`.
- **Cambio:** `buildPrompt` arma string estructurado (objetivo, edad, peso, coef + cita, gap, instrucción para IA de seguimiento diario). `PromptCard` lo renderiza en bloque tipo consola con botón "Copiar" reusando el patrón `navigator.clipboard` + feedback "✓ COPIADO" de `GateForm`/descuento.
- **Tests:** `promptBuilder.test.js` (función pura) — snapshot/estructura del string con inputs conocidos.
- **Aceptación:** al desbloquear aparece prompt personalizado con copiar funcional.

### T2.4 — Segundo código condicionado a suscripción (dep. decisión de negocio)
- **Archivos:** `CalcUnlocked.jsx`, `frontend/src/data/promo.js`.
- **Cambio:** toggle "quiero mi código si me suscribo a entrega semanal". `SHAKE50` sigue visible incondicional; segundo código (ej. `SUBSCRIBE20`) se revela solo con toggle activo.
- **Bloqueo:** valor exacto del segundo código = decisión de producto (ver D3). No codificar el valor hasta definición.
- **Aceptación:** segundo código visible solo con toggle.

### T2.5 — Plan semanal desbloqueable (depende de T2.4 — EN ESPERA)
- **Bloqueo:** T2.4 quedó abierta (decisión de producto), por lo que T2.5 no arranca hasta definir el mecanismo de suscripción.
- **Archivos:** `calculadora.js` (`buildMealPlan` → `buildWeeklyPlan`), `MealPlan.jsx`.
- **Cambio:** día 1 gratis (actual); CTA "Desbloquea tu semana completa" revela 6 días más, atado a la acción de suscripción de T2.4. **Fuera de alcance:** contenido nutricional de los 6 días (requiere validación de Zulema). Solo el mecanismo.
- **Tests:** si `buildWeeklyPlan` es puro, cubrir estructura de 7 días.
- **Aceptación:** vista semanal accesible solo tras la acción condicionante.

### T2.6 — Tarjeta compartible
- **Archivo nuevo:** `ShareCard.jsx`, botón en `CalcUnlocked.jsx`. Posible `html-to-image`/`canvas`.
- **Cambio:** genera imagen tipo story (gap + objetivo + branding VAGGO), sin exponer prompt ni datos personales.
- **Riesgo:** nueva dependencia (`html-to-image`) → validar tamaño de bundle y CSP (`img-src data:` ya permite el export en canvas).
- **Aceptación:** botón genera imagen descargable con resultado + branding.

### T2.7 — Barra de progreso con trazo (reemplaza `PhaseBar`, depende de T2.1)
- **Archivo:** `PhaseBar.jsx` dentro de `CalcForm.jsx`.
- **Cambio:** relleno animado por trazo (stroke-dasharray/CSS transition), **4 segmentos** (hook, form, result, unlocked) — sin `reward`, que fue eliminada (T2.2).
- **Aceptación:** barra refleja las 4 fases con animación de trazo.

### T2.8 — Rangos `RANGE_ROWS` mutuamente excluyentes — DECISIÓN CERRADA (depende de T1.2 y T1.3)
- **Archivos:** `calculadora.js` (`RANGE_ROWS`), `SwipeCard.jsx` (lógica de resaltado).
- **Decisión del founder (cerrada):** **eliminar la fila "Atletas 2.0–2.2"** como fila seleccionable/resaltable. NO agregar un input nuevo de "atleta de alto rendimiento" para forzarla a ser alcanzable — introduce una categoría de usuario sin fuente que la trate como pregunta de investigación distinta (mismo criterio que T1.3) y añade complejidad no justificada en fase POC.
- **Cambio:**
  - Redefinir `RANGE_ROWS` como rangos **mutuamente excluyentes** (sin solapamiento), cubriendo solo el rango real alcanzable por `computeProtein()` post-T1.2/T1.3 (aprox. **1.2–1.8**).
  - Eliminar la fila "Atletas 2.0–2.2" de la tabla seleccionable.
  - **No perder el dato:** mover la cifra de 2.2 g/kg (Morton et al., 2018 — techo prudente para maximizar ganancias, IC 95% 1.03–2.20) a **texto informativo no seleccionable** en la pestaña CIENCIA o en el micro-texto de fuente. Nota tipo: *"El techo teórico para maximizar ganancias en entrenamiento de alta intensidad es 2.2 g/kg (Morton et al., 2018) — fuera del alcance de este formulario, pensado para uso general."*
- **Tests:** para todo `coef` posible de `computeProtein()`, **exactamente una fila** resaltada (test parametrizado sobre el rango real 1.2–1.8); ninguna fila visible es matemáticamente inalcanzable.
- **Aceptación:** resaltado único garantizado; el dato de 2.2 g/kg sigue presente en CIENCIA como texto informativo, no como fila.

### T2.9 — Ocultar `target` cuando `goal === 'maintain'`
- **Archivo:** `CalcForm.jsx` (paso 1 · PERFIL).
- **Cambio:** si `formData.goal === 'maintain'`, ocultar slider de peso objetivo o reemplazar por texto ("Tu objetivo es mantener tu peso actual, no necesitamos este dato"). Coherente con que `computeProtein` ya ignora `target` en maintain.
- **Aceptación:** slider `target` oculto/explicado en maintain.

---

## Riesgos transversales

1. **Producción semi-activa:** cambios a `calculadora.js` (T1.2, T1.3, T1.5, T1.6) alteran el gramaje real que ven usuarios actuales. Desplegar Fase 1 completa y coherente, no parches sueltos, para no mostrar coeficientes inconsistentes con las citas.
2. **Rango de coef cambia:** T1.2 + T1.3 bajan el techo (1.9→1.8) y reconfiguran el piso. Impacta directo T1.4 (umbrales de cita), T2.7 (segmentos) y T2.8 (filas). Ejecutar T1.2/T1.3 antes de tocar cualquiera de esos.
3. **CSP:** `connect-src 'self'` en `nginx.conf` bloquea el POST de T1.8. Ampliar al origen exacto del destino, sin comodines. Auditar también el path de GitHub Pages (cabecera propia o meta CSP). Documentar el nuevo origin permitido como cambio de superficie de seguridad.
4. **Contrato de `INTAKE_PATTERNS` (T1.6):** pasar de mapa fijo a función de peso rompe a todos los consumidores; auditar form, tests y displays antes de mergear.
5. **Citas sin fuente (`Protein_101` ausente):** hornear números está OK; el texto exacto de Moore/Newman/ELANS/Wycherley/Ipsos queda provisional hasta recuperar el doc. No publicar citas con journal/volumen inventados.
6. **Free tier backend (si Opción A):** cold starts y SQLite efímero pueden perder leads — exactamente lo que T1.8 busca evitar. Por eso se recomienda B/C.

## Verificación por fase (DoD)

- **Fase 0:** review manual visual de 5 min del flujo completo. Sin QA de cálculo.
- **Fase 1:** `frontend/src/data/calculadora.test.js` verde con casos nuevos (T1.1, T1.3, T1.5, T1.6). **T1.8 verificado con ≥1 registro end-to-end real** en el destino. Solo entonces: apto para tráfico pagado.
- **Fase 2:** cada tarea es incremento independiente; se lanza con Fase 1 cerrada y Fase 2 en progreso.
