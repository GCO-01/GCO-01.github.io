import { useState, useRef } from 'react';
import { useCart } from '../../../hooks/useCart';
import { FLAVORS } from '../../../data/flavors';
import { PRICE, OLD_PRICE, formatMoney } from '../../../data/config';
import styles from './FloatingCartFAB.module.css';

const SNAP_THRESHOLD = 48;
const SLIDE_W = 320;

const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const CloseSmIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const CloseLgIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
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
  const dragOffset = useRef(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const trackRef = useRef(null);

  // Ocultar FAB cuando el CartDrawer está abierto
  if (drawerOpen) return null;

  function applyTrackTransform() {
    if (!trackRef.current) return;
    trackRef.current.style.transition = isDragging.current
      ? 'none'
      : 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    trackRef.current.style.transform =
      `translateX(calc(${-activeIdx * SLIDE_W}px + ${dragOffset.current}px))`;
  }

  // --- Drag handlers (mouse) ---
  function handleMouseDown(e) {
    isDragging.current = true;
    startX.current = e.clientX;
    dragOffset.current = 0;
  }

  function handleMouseMove(e) {
    if (!isDragging.current) return;
    dragOffset.current = e.clientX - startX.current;
    applyTrackTransform();
  }

  function handleMouseUp() {
    if (!isDragging.current) return;
    commitDrag();
  }

  // --- Drag handlers (touch) ---
  function handleTouchStart(e) {
    isDragging.current = true;
    startX.current = e.touches[0].clientX;
    dragOffset.current = 0;
  }

  function handleTouchMove(e) {
    if (!isDragging.current) return;
    dragOffset.current = e.touches[0].clientX - startX.current;
    applyTrackTransform();
  }

  function handleTouchEnd() {
    if (!isDragging.current) return;
    commitDrag();
  }

  function commitDrag() {
    isDragging.current = false;
    if (dragOffset.current < -SNAP_THRESHOLD && activeIdx < FLAVORS.length - 1) {
      setActiveIdx(i => i + 1);
    } else if (dragOffset.current > SNAP_THRESHOLD && activeIdx > 0) {
      setActiveIdx(i => i - 1);
    }
    dragOffset.current = 0;
    applyTrackTransform();
    setQty(1);
  }

  function handleAdd() {
    addItem(FLAVORS[activeIdx].id, qty);
    setPopOpen(false);
    setQty(1);
    // addItem abre el CartDrawer internamente (useCart.jsx línea 15)
  }

  function handleViewCart() {
    setPopOpen(false);
    setIsOpen(true);
  }

  return (
    <>
      {popOpen && (
        <div className={styles.backdrop} onClick={() => setPopOpen(false)} />
      )}

      <div className={styles.wrap}>
        {popOpen && (
          <div className={styles.popover}>
            {/* Header */}
            <div className={styles.popHeader}>
              <p className={styles.popTitle}>Compra rápida</p>
              <button className={styles.popClose} onClick={() => setPopOpen(false)} aria-label="Cerrar">
                <CloseSmIcon />
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
              <div className={styles.carouselTrack} ref={trackRef} style={{ transform: `translateX(${-activeIdx * SLIDE_W}px)` }}>
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
                          <span className={`${styles.slideCartStatus}${fInCart ? ' ' + styles.inCart : ''}`}>
                            {fInCart ? `${fInCart.qty} en tu carrito` : 'Aún no agregado'}
                          </span>
                        </div>
                      </div>

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
                  className={`${styles.dot}${idx === activeIdx ? ' ' + styles.dotActive : ''}`}
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
          className={`${styles.fab}${popOpen ? ' ' + styles.fabOpen : ''}`}
          onClick={() => setPopOpen(p => !p)}
          aria-label={popOpen ? 'Cerrar compra rápida' : 'Abrir compra rápida'}
        >
          {popOpen ? <CloseLgIcon /> : <CartIcon />}
          {count > 0 && !popOpen && (
            <span className={styles.badge}>{count}</span>
          )}
        </button>
      </div>
    </>
  );
}
