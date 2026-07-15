import { useEffect, useRef } from 'react';
import styles from './CartDrawer.module.css';
import { useCart } from '../../hooks/useCart';
import { useScrollLock } from '../../hooks/useScrollLock';
import { FLAVORS } from '../../data/flavors';
import { formatMoney, PRICE } from '../../data/config';
import { SHIPPING_FULL } from '../../data/site';
import { Button } from '../ui/Button';
import { QtySelector } from '../ui/QtySelector';
import { CloseIcon, TrashIcon } from '../ui/icons';

function CartItem({ item }) {
  const { updateQty, removeItem } = useCart();
  const flavor = FLAVORS.find(f => f.id === item.id);
  if (!flavor) return null;

  return (
    <div className={styles.item}>
      <img src={flavor.img} alt={flavor.label} className={styles.itemImg} />
      <div className={styles.itemInfo}>
        <span className={styles.itemName}>{flavor.label}</span>
        <span className={styles.itemDesc}>6 Pack · 30G Proteína</span>
        <span className={styles.itemPrice}>{formatMoney(PRICE * item.qty)}</span>
      </div>
      <div className={styles.itemActions}>
        <QtySelector
          value={item.qty}
          onChange={v => updateQty(item.id, v)}
        />
        <button onClick={() => removeItem(item.id)} className={styles.removeBtn} aria-label="Eliminar">
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

export function CartDrawer() {
  const { items, isOpen, setIsOpen, count, total } = useCart();
  const closeBtnRef = useRef(null);

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    // Foco al botón de cierre al abrir; Escape cierra.
    closeBtnRef.current?.focus();
    function onKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, setIsOpen]);

  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
        aria-label="Carrito de compras"
        aria-hidden={!isOpen}
        inert={!isOpen ? '' : undefined}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Tu carrito ({count})</h2>
          <button ref={closeBtnRef} className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Cerrar carrito">
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <span>🛒</span>
            <p>Tu carrito está vacío</p>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map(item => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            <div className={styles.footer}>
              <div className={styles.totalRow}>
                <span>Total</span>
                <span className={styles.totalPrice}>{formatMoney(total)}</span>
              </div>
              <p className={styles.shipping}>✓ {SHIPPING_FULL}</p>
              <Button fullWidth size="lg">
                Ir a pagar
              </Button>
              <button className={styles.continueBtn} onClick={() => setIsOpen(false)}>
                Seguir comprando
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
