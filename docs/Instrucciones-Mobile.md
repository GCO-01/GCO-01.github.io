# Brief: optimizar la Product Page para mobile

> Contexto: ya existe la versión **desktop** (`ProductHeader`, `ProductSection`, `ReviewsSection`, `FloatingCart`). El objetivo es construir la versión **mobile** como componentes separados (`M…`) que reusan los mismos datos, sin tocar el desktop. Misma marca **perfect pal**, mismos tokens, single-column.

---

## 1. Regla de oro: no reescribir el desktop

- Datos y helpers se comparten en un solo archivo (`CartShared.jsx`) y lo leen TODAS las superficies:
  ```js
  window.PP_FLAVORS = [ {id:'chocolate',label:'Chocolate Criollo',desc:'…',img:'assets/bottle-chocolate.png'}, {id:'mango',…}, {id:'combinado',…} ];
  window.PP_PRICE = 2299;  window.PP_OLD_PRICE = 4179.99;
  window.ppMoney = (n) => n.toLocaleString('es-MX',{minimumFractionDigits:2});
  window.ppFlavor = (id) => window.PP_FLAVORS.find(f => f.id === id);
  ```
- Crear componentes mobile nuevos con prefijo `M` (`MProductHeader`, `MProductSection`, `MReviewsSection`, `MFloatingCart`) en archivos propios. Cada uno termina con `Object.assign(window, { … })` para compartir scope entre los `<script type="text/babel">`.
- **No** usar `const styles = {}` global: colisiona entre archivos Babel. Usar estilos inline u objetos con nombre único.

---

## 1.5 Aislamiento desktop/mobile (que NO se rompa el desktop)

Riesgo principal: el mobile y el desktop comparten `window` y, si se descuida, el CSS/JS global de uno pisa al otro. Reglas para evitarlo:

- **Entry points separados.** Mantener `Product Page.html` (desktop) y `Product Page (mobile).html` (mobile) como archivos independientes, cada uno cargando SOLO sus propios componentes. No meter ambos sets en el mismo HTML. Si se quiere un único entry responsivo, renderizar condicionalmente por viewport (`window.matchMedia('(max-width:600px)')`) y montar uno u otro árbol — nunca los dos a la vez.
- **Nada de globales con el mismo nombre.** Los componentes mobile van con prefijo `M`; no redefinir `ProductSection`, `FloatingCart`, etc. `CartShared.jsx` es de **solo lectura** para ambos: no mutar `PP_FLAVORS`/`PP_PRICE` desde mobile.
- **CSS sin fugas globales.** El desktop define reglas globales (`body`, `::-webkit-scrollbar`, `html{scroll-behavior}`). El mobile NO debe redefinir selectores globales que el desktop usa. Todo estilo mobile va inline o bajo clases con prefijo (`.mpp-…`, `.m-cart-…`). Si necesitas keyframes, **nombres únicos** (`mppBarScroll`, `ppBadgePop`) — no `fadeIn` genérico que pueda chocar.
- **No tocar los .jsx desktop.** Cualquier ajuste de datos compartidos va en `CartShared.jsx`, manteniendo las firmas que el desktop ya consume (`onAddToCart(flavorId, qty)`, `updateQty`, `removeItem`, etc.).
- **Prueba de regresión:** tras los cambios, abrir `Product Page.html` (desktop) y confirmar que se ve y funciona igual que antes — header, selector de sabor, carrito drawer y reviews intactos.

---

## 2. Tokens (idénticos al desktop)

| Token | Valor |
|---|---|
| Fondo oscuro | `#05070d` · sección reviews `#111` |
| Fondo claro producto | `radial-gradient(ellipse 150% 60% at 50% -4%, #fff 0%, #f4f4f6 100%)` |
| Texto claro | `#f4f4f6` · sobre claro `#111` / secundario `#555`/`#777` |
| Gradiente CTA | `linear-gradient(180deg,#e3796c 0%,#db5242 38%,#302f9b 100%)` |
| Gradiente franja/badge | `linear-gradient(90deg,#302f9b,#db5242,…)` |
| Accent sólido | `#db5242` (coral) |
| Radios | chips/cards 12–20px · botones 16–18px · pill 999px |
| Sombra botón | `0 8px 24px rgba(219,82,66,.36)` |

**Fuentes** (Google Fonts): Poppins (display/CTA, ExtraBold 800, letter-spacing negativo), Arimo (precios, Bold), Lato (body/itálicas), Inter (labels/metadata UPPERCASE), La Belle Aurore (descripción manuscrita). CTAs siempre **MAYÚSCULAS**. Marca **siempre en minúsculas** ("perfect pal").

---

## 3. Estructura de página (single column, scroll propio)

Orden vertical, ancho 100%:

1. **Header sticky** (54px)
2. **Announcement bar** (franja con gradiente animado)
3. **Sección producto** (tarjeta imagen → thumbs → badges → título → rating → precio → urgencia/timer → selector sabor → cantidad+CTA inline → trust trio → checklist beneficios → card huevito → FAQ)
4. **Reviews** (fondo oscuro)
5. **Footer** (`#05070d`, logo + links centrados)
6. **Spacer ~92px** para que la barra inferior no tape el footer
7. **Barra inferior persistente** (fuera del scroll, absolute/fixed)
8. **Bottom-sheet del carrito** (fuera del scroll)

> Si lo presentas dentro de un marco de teléfono, el scroll vive en un contenedor interno (`.page-scroll`, `overflow-y:auto`) y las superficies flotantes (barra + sheet) son `position:absolute` dentro del marco. Si va a pantalla real, usa `position:fixed`.

---

## 4. Header mobile (`MProductHeader`)

- `position:sticky; top:0; z-index:100; height:54px;` fondo `#05070d`, borde inferior `rgba(255,255,255,.08)`.
- Layout: **hamburguesa (izq) · logo centrado absoluto · carrito (der)**. El logo "perfect pal" centrado con `position:absolute; left:50%; transform:translateX(-50%)`.
- Hamburguesa abre un **dropdown** full-width (Tienda · Proteína 101 · Calculadora · Contacto) con transición opacity+translateY; el ícono cambia a "X" cuando está abierto.
- Badge del carrito: animación pop (`scale 1→1.45→1`) cuando sube el contador.
- Hit targets ≥ 44px (padding en los botones de ícono).

---

## 5. Sección producto (`MProductSection`)

**Announcement bar:** `linear-gradient(90deg,#302f9b,#6b3fa0,#db5242,#302f9b)`, `background-size:200%`, animación `barScroll` 8s infinite. Texto 10px UPPERCASE: `⚡ Early Access — 50% OFF · Envío gratis MX · Solo 12 unidades`.

**Tarjeta de imagen** (alto ~380px, radio 20px):
- Stripe superior con gradiente: `EARLY ACCESS · 50% OFF` (Inter italic 10px).
- **Imagen del producto SIEMPRE centrada horizontalmente dentro de la tarjeta** (no pegada a un costado). Patrón: `position:absolute; left:50%; transform:translateX(-50%); bottom:64px;` (el `bottom` la apoya sobre el footer de stats). Nada de `left`/`right` fijos ni `margin` asimétrico que la desplacen a un lado.
  - `key={flavor}` para re-animar el fade al cambiar de sabor; `drop-shadow` para profundidad.
  - **Tamaño:** alto ~268px, `width:auto`, `object-fit:contain`. Si con ese alto la botella se sale o queda chica, ajústalo (rango sugerido 230–280px) de modo que quede **centrada, contenida y sin recortes** dentro de la tarjeta de 380px. La prioridad es que se vea centrada y completa.
- **Footer de stats partido en 2**: izquierda `30G / Proteína` (fondo claro, borde superior negro), derecha `189 / Calorías` (fondo `#111`, texto claro). Números Poppins 800, labels Inter 9px UPPERCASE.

**Thumbnails de sabor:** fila de 3 cuadros 72×72, el activo con borde `#db5242` + halo `box-shadow 0 0 0 3px rgba(219,82,66,.15)`.

**Sistema de divisores:** cada bloque se separa con `border-bottom:1px solid #e8e8ec; margin-bottom:18px; padding-bottom:18px;`. Mantén este ritmo en todos los bloques.

**Secuencia de bloques:**
- Badges pill ("Early Access" gradiente + "6 Pack · 30G" gris).
- **Título** Poppins 800, 32px, `letter-spacing:-0.045em`.
- **Rating**: 5 estrellas coral + `4.9` + link "237 reseñas verificadas".
- **Precio**: `$2,299` (Arimo 34px) + tachado `$4,179.99` + pill `Ahorras 45%` (#db5242). Debajo, descripción en **La Belle Aurore** 15px.
- **Urgencia + timer**: caja coral suave; izquierda `⚡ Solo 12 unidades`, derecha countdown `HH:MM:SS` en chip negro. Persistir fin de cuenta en `localStorage` (`pp_timer_end`) y recalcular cada segundo.
- **Selector de sabor**: 3 tarjetas flex iguales; seleccionada = fondo `#111` texto claro, sombra fuerte; default = blanco borde gris. Muestra `cur.desc` a la derecha del label "Sabor".
- **Cantidad + CTA inline** (este bloque lleva `ref={ctaRef}` — clave para la barra inferior, ver §7): stepper `− qty +` (alto 54px) + botón "Agregar — $precio" gradiente. Al agregar: estado `added` → fondo `#302f9b`, texto `¡Agregado! ✓` por ~2.2s.
- **Trust trio**: 3 columnas (Garantía 30d · Envío gratis · Pago seguro) con íconos SVG line.
- **Checklist beneficios**: grid 2 columnas, bullet circular negro con check blanco. 6 items (Sin lactosa, Sin azúcar añadida, Proteína de clara de huevo, Ingredientes 100% naturales, Sin saborizantes artificiales, Solo 189 Calorías).
- **Card huevito**: `assets/huevito.png` + título + texto corto.
- **FAQ accordion**: 4 preguntas; click expande con `max-height` transition y rota el chevron 180°.

---

## 6. Reviews (`MReviewsSection`) — fondo oscuro, **carrusel swipeable**

- Fondo `#111`, padding `40px 16px 44px`.
- Header: label UPPERCASE + título Poppins 800 28px + `4.9` grande (Arimo 40px) con estrellas y "de 237 reseñas".
- **Una sola reseña visible a la vez, en carrusel horizontal con autoscroll + swipe manual.** Implementación nativa (sin librerías):
  - Track: `display:flex; overflow-x:auto; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch;` y ocultar la scrollbar (`scrollbar-width:none` + `::-webkit-scrollbar{display:none}`).
  - Cada card ocupa **el ancho completo del track**: `flex:0 0 100%; scroll-snap-align:center;` → solo se ve UNA reseña a la vez (sin "peek"). Mismo estilo visual: fondo `rgba(255,255,255,.04)`, borde sutil, estrellas + texto + nombre/ubicación/fecha. Dado que solo hay una visible, dale altura cómoda y centra el contenido.
  - **El usuario puede scrollear/deslizar horizontalmente** entre reseñas — es overflow nativo, así que el swipe touch y el drag/trackpad en desktop ya funcionan.
  - **Autoscroll (autoplay) en mobile:** avanzar automáticamente a la siguiente card cada ~4–5s con `scrollTo({left, behavior:'smooth'})`, en **loop** (al llegar a la última, volver a la primera). Calcular el `left` destino con `card.offsetWidth × índice`.
    - **Pausar el autoplay** cuando el usuario interactúa (touchstart/pointerdown o un `scroll` manual) y reanudarlo tras unos segundos de inactividad — el autoplay nunca debe pelear contra el dedo del usuario.
    - Respetar `prefers-reduced-motion: reduce` → no hacer autoplay (deja solo el swipe manual).
  - **Dots de paginación** debajo del track: un punto por review, el activo en coral `#db5242`, el resto `rgba(255,255,255,.2)`. Actualizar el activo con un `scroll` listener (o `IntersectionObserver` sobre cada card) según el índice centrado. Tocar un dot hace `scrollTo` suave a esa card (y cuenta como interacción → pausa el autoplay).
- CTA final full-width (pill 27px) "QUIERO MI 6-PACK AHORA" que hace scroll suave al top del producto (`onScrollToProduct`).

> El desktop (`ReviewsSection`) puede seguir con su propio layout (grid/listado). Este carrusel es exclusivo de `MReviewsSection`; no modificar el componente desktop.

---

## 7. Barra inferior persistente (`MBottomBar`) — patrón mobile clave

- `position:absolute(/fixed); left/right/bottom:0; z-index:250;` fondo blanco, borde y sombra superior.
- Contenido: mini imagen del sabor + precio total (`PP_PRICE × qty`) + `qty × 6 Pack` + botón "Agregar".
- **Aparece solo cuando el CTA inline sale de pantalla.** Usar `IntersectionObserver` sobre `ctaRef` (root = el contenedor de scroll). Mientras el CTA es visible → barra oculta (`translateY(120%)`); cuando deja de serlo → entra. Ocultarla también cuando el carrito está abierto.
- `padding-bottom: calc(10px + env(safe-area-inset-bottom, 18px))` para el notch/home-indicator.

---

## 8. Carrito bottom-sheet (`MobileCart`)

- **Backdrop** `rgba(5,7,13,.55)` con `backdrop-filter:blur(2px)`, fade in/out.
- **Sheet** desde abajo: `height:90%`, `border-radius:22px 22px 0 0`, entra con `translateY(101%)→0` (cubic-bezier 0.25,0.46,0.45,0.94). Grab handle arriba.
- Header "Tu carrito" + contador + botón cerrar (X).
- Ribbon "envío gratis" cuando hay items.
- Lista scrollable: cada item = imagen en card + nombre + "6 Pack · 30G" + `MQtyStepper` + precio + botón eliminar. Estado vacío con ilustración de carrito + CTA "Ver producto".
- Footer: subtotal (Arimo 22px + MXN), envío "Gratis", botón "Finalizar compra" full-width, link "Seguir comprando".
- **Bloquear el scroll de la página** mientras el sheet está abierto (`overflow:hidden` en el scroller).

---

## 9. Reglas mobile-first (no negociables)

- Viewport: `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- **Hit targets ≥ 44px** en todos los botones/íconos.
- Respetar `env(safe-area-inset-bottom)` en barra inferior y footer del sheet.
- Una sola columna; nada de grids desktop. Imágenes con `width:auto` + alto fijo, `object-fit:contain`.
- Tipografía mínima legible: body 12–13px, títulos 28–32px (no “encoger” el desktop).
- Animaciones con `cubic-bezier(0.25,0.46,0.45,0.94)`; transiciones de opacidad 0.2–0.3s.
- Estado del carrito y `flavor`/`qty` viven en el `App` raíz y se pasan por props a todas las superficies (header, sección, barra, sheet) para que el contador y el sheet estén siempre sincronizados.

---

## 10. Checklist de aceptación

- [ ] Header sticky con logo centrado; menú hamburguesa funcional.
- [ ] Cambiar sabor actualiza imagen, thumbs, selector y barra inferior.
- [ ] **Imagen del producto centrada horizontalmente** dentro de la tarjeta (no a un costado), contenida y sin recortes.
- [ ] CTA inline → "¡Agregado! ✓" y abre el sheet.
- [ ] Barra inferior aparece SOLO al scrollear más allá del CTA inline.
- [ ] Sheet sube al 90%, bloquea scroll, permite editar/eliminar items, muestra subtotal y envío gratis.
- [ ] Reviews: **una sola reseña a la vez**, carrusel horizontal con **autoscroll en loop** + swipe manual (autoplay se pausa al interactuar) + dots de paginación.
- [ ] Timer cuenta regresiva persistente entre recargas.
- [ ] Todo en español (es-MX), CTAs en MAYÚSCULAS, marca en minúsculas.
- [ ] **Desktop intacto:** `Product Page.html` se ve y funciona igual que antes (regresión verificada).
