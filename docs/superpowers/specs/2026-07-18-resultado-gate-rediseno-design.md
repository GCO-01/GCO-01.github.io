# Rediseño Resultado + Gate — Design Spec

> Diseño aprobado de la pantalla **Resultado + Gate** de la calculadora de proteína.
> Referencia visual (prototipo Artifact): https://claude.ai/code/artifact/5f119aa0-eeb1-4ea0-9b64-275c0e00d3ed
> Estado: diseño cerrado y tokenizado. Colores/tipografía finales **pendientes del documento de lineamientos de marca**; solo cambian tokens, no la estructura.

## Contexto

La pantalla combina resultado + captura de lead en **un solo flujo vertical** ("ficha editorial"), no dos tarjetas. Objetivo: entregar gratis el insight (la dosis + la brecha) como recompensa por completar el cuestionario, y gatear solo el plan accionable + la oferta a cambio del email. Dirección visual: **liquid glass sobre base profunda** con estructura y tipografía editorial. Lenguaje de referencia: Gleb Kuznetsov (profundidad, motion cinematográfico) + Zander Whitehurst (sistema, jerarquía, personalidad en el movimiento). Sin mascotas ni iconografía infantilizada; la personalidad viene del movimiento y la tipografía.

## Estructura (NO tocar)

Flujo vertical único en una hoja de vidrio:
1. **Número hero** de la dosis — display gigante alineado a la izquierda, recorte superior intencional (sangra fuera del borde). Domina la pantalla.
2. **Regla editorial** con versalitas + citas (Wycherley 2012 / Morton 2018).
3. **Brecha como pull-quote asimétrico** con urgencia por identidad ("Tu brecha no se cierra sola") y conexión a producto ("≈ 2 shakes VAGGO"). "65 g" en acento.
4. **Toggle comparativo** (segmented control) + **línea técnica** con escala 0–160 g.
5. **Value stack 01/02/03** (lista numerada editorial, mismo lenguaje que el PhaseBar del formulario).
6. **Captura de email** como líneas editoriales (borde inferior, sin caja).
7. **CTA** rectangular de alto contraste.

## Sistema de diseño (tokens — placeholders hasta el doc de marca)

- **Color:** `--base #0D0A12` (neutro con sesgo violáceo, elegido) + glows ambientales cálido/frío para dar profundidad al glass. `--ink #F6F5F8`, `--ink-dim` ~.72 (captions), `--ink-label` ~.58 (labels). `--accent` coral `#FF6A3D`.
- **Regla de acento (auditada):** **relleno sólido de acento SOLO en el CTA.** En todo lo demás el acento es texto/stroke (65 g, 01/02/03, marcador "Tú", tab activo).
- **Liquid glass** (primitivo `.glass`): `rgba(255,255,255,.055)` + `backdrop-filter: blur(22px)` + highlight superior (`inset 0 1px 0`) + sombra suave + radio 16–24px. Se usa en la hoja, el segmented control y (foco) los inputs.
- **Tipografía:** display editorial (peso alto, tracking negativo, `tabular-nums`) + body sans. En el prototipo es system-stack (placeholder); la fuente final entra por token. Escala de espaciado `--sp`.

## Componentes

| Componente | Notas de implementación |
|---|---|
| **Número hero** | Render en **SVG con `viewBox` del bbox real** → escala al ancho, a prueba de fuente y de 2/3 dígitos. Recorte superior 10% (`clip`). Valor completo en `aria-label`. Count-up en montaje. |
| **Segmented control** | Contenedor glass + **thumb deslizante** translúcido bajo el activo (spring). `role=tablist`, `aria-selected`, focus-visible. Affordance clara sin interactuar. |
| **Línea técnica** | Escala fija **0→160 g** rotulada en extremos. Marcador "Tú" (valor arriba del eje) y comparación (valor abajo) → nunca colisionan. Rango óptimo como **stroke** (no caja rellena). El eje se dibuja con trazo. |
| **Value stack** | Filas 01/02/03: Plan de comidas · Código 50% OFF · Prompt de seguimiento IA. Sin emoji. Reveal escalonado. |
| **Inputs** | Línea editorial (borde inferior), **área tocable ≥44px** (`min-height`), foco con glow glass. |
| **CTA** | Único relleno de acento. Feedback táctil (`scale(.98)` al presionar). |

## Contenido / copy (aprobado)

- Dosis (ej.): "125 g · Tu dosis diaria". Brecha: "Te faltan **65 g** de proteína al día. Tu brecha no se cierra sola — son ≈ 2 shakes VAGGO."
- Toggle: Promedio Perú → "Menos del 35% de peruanos llega a un número como el tuyo (ELANS 2023)." / Rango óptimo → "Estás dentro del rango óptimo de salud (1.2–1.6 g/kg)." / Atleta → "El techo de rendimiento (2.2 g/kg, Morton) — referencia, no tu meta."
- Consentimiento (solo desbloqueo en pantalla, **no** prometer envío por email): "Se desbloquea al instante en tu pantalla. Guardamos tu email para novedades; sin spam, baja cuando quieras."

## Urgencia (sin cronómetro)

Por **comparación social** (dato real ELANS/Ipsos: <35% de peruanos) y por **identidad** ("Tu brecha no se cierra sola"). Coherente con posicionamiento "The Biohacker". Nada de countdown.

## Motion (M1–M6, recalibrado a esta composición)

- **M1** la línea técnica se **dibuja con trazo** (reemplaza la barra que rellenaba).
- **M2** count-up en dosis y brecha (ease-out cúbico ~800–900 ms).
- **M3** reveal escalonado de 01/02/03 (translateY+fade, pop spring en el numeral, ~130 ms de stagger).
- **M4** profundidad: el glass + glow ambiental (no sombra plana).
- **M5** táctil: CTA `scale(.98)`; inputs con glow al focus; thumb del segmented con spring.
- **M6** **sheen** sutil que barre el glass (una vez al montar).
- **`prefers-reduced-motion`** respetado (CSS + JS).

## Criterios de aceptación (QA)

- Número entra/recorta bien y **ningún texto se corta** en ≥3 viewports.
- Segmented control se percibe **tocable sin interactuar** (E1).
- **Único relleno de acento = CTA** (E2, auditado).
- Escala de referencia comunica proporción (E3).
- Labels **WCAG AA** documentado (`.58` ≈6:1, `.72` ≈7:1 sobre `#0D0A12`) (E4).
- Inputs **≥44px** tocable; número con `aria-label` completo; recorte consistente entre viewports (E5).
- Al cargar (hard refresh) la pantalla se ve "viva": frame 0 ≠ estado final (DoD motion).

## Integración futura en el código real (fase siguiente)

Cuando lleguen los lineamientos de marca:
1. Mapear tokens del prototipo a `frontend/src/styles/tokens.css` (o un scope de la calculadora) y aplicar en `frontend/src/components/calculadora/CalcResult.jsx` + `Calculadora.module.css`.
2. El toggle comparativo es **nueva funcionalidad** (estado + datos ELANS/Morton) — hoy no existe en `CalcResult`.
3. Reusar `computeProtein()` (`frontend/src/data/calculadora.js`) para dosis/brecha/coef; los datos de comparación (promedio/óptimo/atleta) derivan del peso y de constantes ya citadas.
4. Consistencia con T1.8: el payload de lead (hoy `{name,email,grams,gap,goal,age,timestamp}`, spec pide sumar `training,activity`, y el rediseño suma `gender` y edad granular) — cerrar el esquema antes de implementar la captura definitiva (Camino C, Supabase).

## Pendiente del usuario

- **Documento de lineamientos de marca** (paleta + tipografía finales) → se aplican sobre los tokens, sin rehacer estructura.
