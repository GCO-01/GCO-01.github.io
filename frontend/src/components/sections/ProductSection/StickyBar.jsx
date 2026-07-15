import styles from './ProductSection.module.css';
import { Button } from '../../ui/Button';
import { FLAVORS } from '../../../data/flavors';
import { formatMoney, PRICE, OLD_PRICE } from '../../../data/config';

export function StickyBar({ visible, flavor, qty, added, onAdd }) {
  const cur = FLAVORS.find(f => f.id === flavor) ?? FLAVORS[0];

  return (
    <div className={`${styles.stickyBar} ${visible ? styles.stickyBarVisible : ''}`} aria-hidden={!visible}>
      <div className={styles.stickyInfo}>
        <img src={cur.img} alt={cur.label} />
        <div>
          <span>{cur.label} · 6 Pack</span>
          <div>
            <span className={styles.priceCurrent}>{formatMoney(PRICE * qty)}</span>
            <span className={styles.priceOld}>{formatMoney(OLD_PRICE)}</span>
          </div>
        </div>
      </div>
      <Button size="sm" confirmed={added} onClick={onAdd}>
        {added ? '¡Agregado! ✓' : 'Agregar al carrito'}
      </Button>
    </div>
  );
}
