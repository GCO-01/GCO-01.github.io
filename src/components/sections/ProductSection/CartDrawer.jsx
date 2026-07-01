import { useEffect } from 'react';
import styles from './CartDrawer.module.css';
import { useCart } from '../../../hooks/useCart';
import { FLAVORS } from '../../../data/flavors';
import { formatMoney, PRICE } from '../../../data/config';
import { Button } from '../../ui/Button';

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

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
        <div className={styles.itemQty}>
          <button onClick={() => updateQty(item.id, item.qty - 1)} disabled={item.qty <= 1} aria-label="Menos">−</button>
          <span>{item.qty}</span>
          <button onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Más">+</button>
        </div>
        <button onClick={() => removeItem(item.id)} className={styles.removeBtn} aria-label="Eliminar">
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

export function CartDrawer() {
  const { items, isOpen, setIsOpen, count } = useCart();
  const total = items.reduce((sum, i) => sum + PRICE * i.qty, 0);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

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
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Tu carrito ({count})</h2>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Cerrar carrito">
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
              <p className={styles.shipping}>✓ Envío gratis a Lima Metropolitana</p>
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
