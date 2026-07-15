# FloatingCartFAB — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-implement el botón circular flotante (FAB) de compra rápida que estuvo en toda la home page, portándolo como componente React con carrusel de sabores, qty stepper y popover en esquina inferior derecha.

**Architecture:** El FAB vive en `App.jsx` (nivel raíz, dentro de `CartProvider`) para estar visible en toda la app. El `CartDrawer` se sube también a `App.jsx` para que pueda abrirse desde el FAB aunque el usuario esté fuera de `ProductSection`. El FAB tiene su propio popover con carrusel de sabores y llama a `addItem` del `useCart` existente.

**Tech Stack:** React 18, CSS Modules, Design tokens CSS (`src/styles/tokens.css`), `useCart` Context existente.

## Global Constraints

- CSS Modules para todos los estilos nuevos (sin estilos inline salvo `transform` dinámico del carrusel)
- Usar variables CSS de `tokens.css`: `--font-poppins`, `--color-accent-red`, `--color-accent-blue`, `--radius-btn`, `--transition-smooth`
- `addItem(flavorId: string, qty: number)` — API exacta del hook (no objeto)
- El FAB se oculta cuando `isOpen === true` (CartDrawer abierto)
- z-index: FAB/Popover < CartDrawer. FAB: 291, popover: 290, popover-backdrop: 289, CartDrawer drawer: 301, CartDrawer backdrop: 300

---

## File Map

| Acción | Archivo | Responsabilidad |
|---|---|---|
| **Crear** | `src/components/ui/FloatingCartFAB/index.jsx` | Componente FAB + popover + carrusel |
| **Crear** | `src/components/ui/FloatingCartFAB/FloatingCartFAB.module.css` | Estilos FAB, popover, carousel |
| **Modificar** | `src/App.jsx` | Montar `<FloatingCartFAB />` y `<CartDrawer />` a nivel raíz |
| **Modificar** | `src/components/sections/ProductSection/index.jsx` | Quitar `<CartDrawer />` (se sube a App.jsx) |

---

## Task 1: Crear FloatingCartFAB component

**Files:**
- Create: `src/components/ui/FloatingCartFAB/index.jsx`
- Create: `src/components/ui/FloatingCartFAB/FloatingCartFAB.module.css`

**Interfaces:**
- Consumes: `useCart()` → `{ items, count, isOpen, setIsOpen, addItem }`
- Consumes: `FLAVORS` de `src/data/flavors.js`
- Consumes: `PRICE, formatMoney` de `src/data/config.js`
- Produce: `export function FloatingCartFAB()` sin props

---

- [ ] **Step 1: Crear el archivo de estilos `FloatingCartFAB.module.css`**

Crear el archivo `src/components/ui/FloatingCartFAB/FloatingCartFAB.module.css` con el siguiente contenido:

```css
/* FAB wrapper — posición fija bottom-right */
.wrap {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 291;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
  pointer-events: none; /* los hijos re-activan según necesiten */
}

/* Botón circular FAB */
.fab {
  pointer-events: auto;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(180deg, #e3796c 0%, #db5242 38%, #302f9b 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(48, 47, 155, 0.35);
  transition: transform 0.18s var(--transition-smooth), background 0.18s;
  position: relative;
  flex-shrink: 0;
}

.fab:hover {
  transform: scale(1.07);
}

.fab:active {
  transform: scale(0.96);
}

.fabOpen {
  background: #111;
}

/* Badge contador */
.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 10px;
  background: #db5242;
  border: 2px solid #fff;
  color: #fff;
  font-family: var(--font-poppins), sans-serif;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.fabOpen .badge {
  display: none;
}

/* Popover de compra rápida */
.popover {
  pointer-events: auto;
  width: 320px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 40px rgba(5, 7, 13, 0.18);
  overflow: hidden;
  animation: popIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.92) translateY(8px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}

/* Header del popover */
.popHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid #f0f0f4;
}

.popTitle {
  font-family: var(--font-poppins), sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #111;
  margin: 0;
}

.popClose {
  width: 28px;
  height: 28px;
  border: none;
  background: #f4f4f6;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  transition: background 0.15s;
}

.popClose:hover { background: #e8e8ec; }

/* Carrusel */
.carouselViewport {
  width: 320px;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  cursor: grab;
}

.carouselViewport:active {
  cursor: grabbing;
}

.carouselTrack {
  display: flex;
  will-change: transform;
}

/* Slide individual */
.slide {
  width: 320px;
  flex-shrink: 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.slideTop {
  display: flex;
  align-items: center;
  gap: 14px;
}

.slideImgWrap {
  position: relative;
  flex-shrink: 0;
}

.slideImg {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: 12px;
  background: #f4f4f6;
}

.slideCartBadge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-accent-red, #db5242);
  border: 2px solid #fff;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-poppins), sans-serif;
}

.slideInfo {
  flex: 1;
  min-width: 0;
}

.slideName {
  font-family: var(--font-poppins), sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #111;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.slidePriceRow {
  display: flex;
  align-items: center;
  gap: 6px;
}

.slideOldPrice {
  font-size: 11px;
  color: #999;
  text-decoration: line-through;
  font-family: var(--font-poppins), sans-serif;
}

.slidePrice {
  font-family: var(--font-poppins), sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #111;
}

.slideCartStatus {
  font-size: 11px;
  color: #888;
  font-family: var(--font-poppins), sans-serif;
}

.slideCartStatus.inCart {
  color: #2d9645;
  font-weight: 500;
}

/* Qty stepper */
.stepper {
  display: flex;
  align-items: center;
  border: 1.5px solid #dcdce4;
  border-radius: 17px;
  overflow: hidden;
  height: 44px;
  align-self: flex-start;
}

.stepperBtn {
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s;
  flex-shrink: 0;
}

.stepperBtn:hover { background: #f4f4f6; }
.stepperBtn:disabled { opacity: 0.35; cursor: default; }

.stepperVal {
  width: 30px;
  text-align: center;
  font-family: var(--font-poppins), sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #111;
  flex-shrink: 0;
}

/* Botón Agregar */
.addBtn {
  width: 100%;
  height: 44px;
  border-radius: var(--radius-btn, 20px);
  background: linear-gradient(180deg, #e3796c 0%, #db5242 38%, #302f9b 100%);
  border: none;
  color: #fff;
  font-family: var(--font-poppins), sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.12s;
}

.addBtn:hover { opacity: 0.9; }
.addBtn:active { transform: scale(0.98); }

/* Dots indicadores */
.dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 8px 0 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #dcdce4;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: background 0.15s, transform 0.15s;
}

.dotActive {
  background: var(--color-accent-red, #db5242);
  transform: scale(1.3);
}

/* Link "Ver carrito" */
.viewCartBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 12px;
  border: none;
  background: #f4f4f6;
  border-top: 1px solid #f0f0f4;
  font-family: var(--font-poppins), sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: background 0.12s;
}

.viewCartBtn:hover { background: #e8e8ec; }

/* Backdrop del popover */
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 289;
  background: rgba(5, 7, 13, 0.4);
  backdrop-filter: blur(2px);
}

/* Ocultar en pantallas donde la BottomBar ya resuelve el problema */
@media (max-width: 600px) {
  .wrap {
    right: 16px;
    bottom: 90px; /* sobre la BottomBar */
  }

  .fab {
    width: 52px;
    height: 52px;
  }

  .popover {
    width: calc(100vw - 32px);
    max-width: 320px;
  }

  .carouselViewport {
    width: calc(100vw - 32px);
    max-width: 320px;
  }

  .slide {
    width: calc(100vw - 32px);
    max-width: 320px;
  }
}
```

- [ ] **Step 2: Crear el componente `index.jsx`**

Crear el archivo `src/components/ui/FloatingCartFAB/index.jsx`:

```jsx
import { useState, useRef } from 'react';
import { useCart } from '../../../hooks/useCart';
import { FLAVORS } from '../../../data/flavors';
import { PRICE, OLD_PRICE, formatMoney } from '../../../data/config';
import styles from './FloatingCartFAB.module.css';

const SNAP_THRESHOLD = 48; // px de drag para cambiar slide

const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export function FloatingCartFAB() {
  const { items, count, isOpen: drawerOpen, setIsOpen, addItem } = useCart();
  const [popOpen, setPopOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);
  const startX = useRef(0);

  // Ocultar FAB cuando el CartDrawer está abierto
  if (drawerOpen) return null;

  const flavor = FLAVORS[activeIdx];
  const itemInCart = items.find(i => i.id === flavor.id);
  const slideWidth = 320; // debe coincidir con .slide width en CSS

  // --- Drag handlers (mouse) ---
  function handleMouseDown(e) {
    isDragging.current = true;
    startX.current = e.clientX;
    setDragOffset(0);
  }

  function handleMouseMove(e) {
    if (!isDragging.current) return;
    setDragOffset(e.clientX - startX.current);
  }

  function handleMouseUp() {
    if (!isDragging.current) return;
    commitDrag();
  }

  // --- Drag handlers (touch) ---
  function handleTouchStart(e) {
    isDragging.current = true;
    startX.current = e.touches[0].clientX;
    setDragOffset(0);
  }

  function handleTouchMove(e) {
    if (!isDragging.current) return;
    setDragOffset(e.touches[0].clientX - startX.current);
  }

  function handleTouchEnd() {
    if (!isDragging.current) return;
    commitDrag();
  }

  function commitDrag() {
    isDragging.current = false;
    if (dragOffset < -SNAP_THRESHOLD && activeIdx < FLAVORS.length - 1) {
      setActiveIdx(i => i + 1);
    } else if (dragOffset > SNAP_THRESHOLD && activeIdx > 0) {
      setActiveIdx(i => i - 1);
    }
    setDragOffset(0);
    setQty(1);
  }

  function handleAdd() {
    addItem(flavor.id, qty);
    setPopOpen(false);
    setQty(1);
    // addItem ya abre el CartDrawer internamente (ver useCart.jsx)
  }

  function handleViewCart() {
    setPopOpen(false);
    setIsOpen(true);
  }

  const trackStyle = {
    transform: `translateX(calc(${-activeIdx * slideWidth}px + ${dragOffset}px))`,
    transition: isDragging.current ? 'none' : 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  };

  return (
    <>
      {popOpen && (
        <div className={styles.backdrop} onClick={() => setPopOpen(false)} />
      )}

      <div className={styles.wrap}>
        {/* Popover */}
        {popOpen && (
          <div className={styles.popover}>
            {/* Header */}
            <div className={styles.popHeader}>
              <p className={styles.popTitle}>Compra rápida</p>
              <button className={styles.popClose} onClick={() => setPopOpen(false)} aria-label="Cerrar">
                <CloseIcon />
              </button>
            </div>

            {/* Carrusel */}
            <div
              className={styles.carouselViewport}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className={styles.carouselTrack} style={trackStyle}>
                {FLAVORS.map((f, idx) => {
                  const fInCart = items.find(i => i.id === f.id);
                  return (
                    <div key={f.id} className={styles.slide}>
                      <div className={styles.slideTop}>
                        <div className={styles.slideImgWrap}>
                          <img src={f.img} alt={f.label} className={styles.slideImg} draggable={false} />
                          {fInCart && (
                            <span className={styles.slideCartBadge}>{fInCart.qty}</span>
                          )}
                        </div>
                        <div className={styles.slideInfo}>
                          <p className={styles.slideName}>{f.label}</p>
                          <div className={styles.slidePriceRow}>
                            <span className={styles.slideOldPrice}>{formatMoney(OLD_PRICE)}</span>
                            <span className={styles.slidePrice}>{formatMoney(PRICE)}</span>
                          </div>
                          <span className={`${styles.slideCartStatus} ${fInCart ? styles.inCart : ''}`}>
                            {fInCart ? `${fInCart.qty} en tu carrito` : 'Aún no agregado'}
                          </span>
                        </div>
                      </div>

                      {/* Qty stepper — solo para el slide activo */}
                      {idx === activeIdx && (
                        <div className={styles.stepper}>
                          <button
                            className={styles.stepperBtn}
                            onClick={() => setQty(q => Math.max(1, q - 1))}
                            disabled={qty <= 1}
                            aria-label="Menos"
                          >
                            −
                          </button>
                          <span className={styles.stepperVal}>{qty}</span>
                          <button
                            className={styles.stepperBtn}
                            onClick={() => setQty(q => q + 1)}
                            aria-label="Más"
                          >
                            +
                          </button>
                        </div>
                      )}

                      {/* Botón Agregar */}
                      {idx === activeIdx && (
                        <button className={styles.addBtn} onClick={handleAdd}>
                          Agregar — {formatMoney(PRICE * qty)}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dots indicadores */}
            <div className={styles.dots}>
              {FLAVORS.map((f, idx) => (
                <button
                  key={f.id}
                  className={`${styles.dot} ${idx === activeIdx ? styles.dotActive : ''}`}
                  onClick={() => { setActiveIdx(idx); setQty(1); }}
                  aria-label={`Sabor ${f.label}`}
                />
              ))}
            </div>

            {/* Ver carrito */}
            <button className={styles.viewCartBtn} onClick={handleViewCart}>
              Ver carrito {count > 0 && `(${count})`} <ArrowIcon />
            </button>
          </div>
        )}

        {/* Botón FAB */}
        <button
          className={`${styles.fab} ${popOpen ? styles.fabOpen : ''}`}
          onClick={() => setPopOpen(p => !p)}
          aria-label={popOpen ? 'Cerrar compra rápida' : 'Abrir compra rápida'}
        >
          {popOpen ? <CloseIcon /> : <CartIcon />}
          {count > 0 && !popOpen && (
            <span className={styles.badge}>{count}</span>
          )}
        </button>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Verificar que el componente existe**

```bash
ls /Users/gabriel/Desktop/Perfect\ Pal/perfectpal-pagina-web/sitio/src/components/ui/FloatingCartFAB/
```

Esperado: `index.jsx` y `FloatingCartFAB.module.css`

- [ ] **Step 4: Commit**

```bash
cd "/Users/gabriel/Desktop/Perfect Pal/perfectpal-pagina-web/sitio"
git add src/components/ui/FloatingCartFAB/
git commit -m "feat: add FloatingCartFAB component with quick-buy popover and flavor carousel"
```

---

## Task 2: Subir CartDrawer al nivel de App.jsx

El CartDrawer actualmente solo está montado en `ProductSection/index.jsx`. Como el FAB vive a nivel de App, necesita poder abrirlo desde cualquier sección. Se mueve el `<CartDrawer />` a `App.jsx` y se quita de `ProductSection`.

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/sections/ProductSection/index.jsx`

**Interfaces:**
- `CartDrawer` no recibe props — lee todo de `useCart()` internamente
- `setIsOpen(true)` del useCart abre el drawer desde cualquier lugar

---

- [ ] **Step 1: Agregar CartDrawer y FloatingCartFAB en App.jsx**

Abrir `src/App.jsx` (contenido actual):

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './hooks/useCart';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Calculadora } from './pages/Calculadora';
import './styles/global.css';
import './styles/animations.css';

export function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculadora" element={<Calculadora />} />
          </Routes>
        </main>
        <Footer />
      </CartProvider>
    </BrowserRouter>
  );
}
```

Reemplazar con:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './hooks/useCart';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/sections/ProductSection/CartDrawer';
import { FloatingCartFAB } from './components/ui/FloatingCartFAB';
import { Home } from './pages/Home';
import { Calculadora } from './pages/Calculadora';
import './styles/global.css';
import './styles/animations.css';

export function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculadora" element={<Calculadora />} />
          </Routes>
        </main>
        <Footer />
        <CartDrawer />
        <FloatingCartFAB />
      </CartProvider>
    </BrowserRouter>
  );
}
```

- [ ] **Step 2: Quitar `<CartDrawer />` de `ProductSection/index.jsx`**

En `src/components/sections/ProductSection/index.jsx`, quitar las siguientes líneas:

```jsx
// QUITAR esta línea de imports:
import { CartDrawer } from './CartDrawer';

// QUITAR esta línea del JSX (línea 143):
<CartDrawer />
```

El archivo debe quedar sin ninguna referencia a `CartDrawer`.

- [ ] **Step 3: Verificar que no hay `<CartDrawer />` duplicado**

```bash
cd "/Users/gabriel/Desktop/Perfect Pal/perfectpal-pagina-web/sitio"
grep -r "CartDrawer" src/
```

Esperado: aparece solo en `src/App.jsx` y en `src/components/sections/ProductSection/CartDrawer.jsx` (el archivo del componente mismo). NO debe aparecer en `ProductSection/index.jsx`.

- [ ] **Step 4: Commit**

```bash
cd "/Users/gabriel/Desktop/Perfect Pal/perfectpal-pagina-web/sitio"
git add src/App.jsx src/components/sections/ProductSection/index.jsx
git commit -m "refactor: lift CartDrawer to App root so FloatingCartFAB can open it from any section"
```

---

## Task 3: Ajuste de z-index del CartDrawer

Con el CartDrawer ahora a nivel de App, confirmar que su z-index (300/301) está por encima del FAB (291) y no hay conflictos de stacking.

**Files:**
- Read: `src/components/sections/ProductSection/CartDrawer.module.css` (verificar, no cambiar a menos que sea necesario)

---

- [ ] **Step 1: Verificar z-index actual del CartDrawer**

```bash
grep -n "z-index" "/Users/gabriel/Desktop/Perfect Pal/perfectpal-pagina-web/sitio/src/components/sections/ProductSection/CartDrawer.module.css"
```

Esperado: backdrop en z-index 300, drawer en z-index 301. Si es así, no se necesita ningún cambio.

Si el z-index fuera menor a 291 (el del FAB), actualizar el backdrop a 300 y el drawer a 301 en `CartDrawer.module.css`.

- [ ] **Step 2: Arrancar el servidor de desarrollo y verificar visualmente**

```bash
cd "/Users/gabriel/Desktop/Perfect Pal/perfectpal-pagina-web/sitio"
npm run dev
```

Abrir `http://localhost:5173` y verificar:

1. El FAB circular aparece en la esquina inferior derecha en toda la home
2. Al hacer click en el FAB, se abre el popover con el carrusel de sabores
3. El carrusel se puede arrastrar (mouse y touch) entre los 3 sabores
4. Los dots indicadores cambian al deslizar
5. El qty stepper funciona (−/+)
6. El botón "Agregar" agrega el item y abre el CartDrawer lateral
7. El CartDrawer se abre correctamente desde el FAB
8. El botón "Ver carrito" en el popover abre el CartDrawer sin agregar
9. El FAB desaparece cuando el CartDrawer está abierto
10. Al cerrar el CartDrawer, el FAB vuelve a aparecer
11. El badge del FAB muestra el conteo correcto de items
12. En la sección de Reviews/Benefits/Hero, el FAB es visible y funcional
13. El FAB no interfiere visualmente con la BottomBar en mobile

---

## Verificación end-to-end

```bash
cd "/Users/gabriel/Desktop/Perfect Pal/perfectpal-pagina-web/sitio"
npm run dev
```

Flujo de prueba completo:

1. Abrir `http://localhost:5173`
2. Hacer scroll hasta la sección de Benefits — FAB visible ✓
3. Click en FAB → popover abre con animación ✓
4. Deslizar carrusel entre Chocolate → Mango → Combinado ✓
5. Seleccionar qty 2 → click "Agregar" → CartDrawer abre con 2 unidades del sabor seleccionado ✓
6. Cerrar CartDrawer → FAB aparece con badge "2" ✓
7. Click FAB → slide del sabor que ya tiene items muestra "2 en tu carrito" ✓
8. Click "Ver carrito" → CartDrawer abre sin agregar ✓
9. En mobile (DevTools 390px): FAB aparece sobre la BottomBar cuando se hace scroll fuera de ProductSection ✓
