import styles from './ProductSection.module.css';
import { Button } from '../../ui/Button';
import { FLAVORS } from '../../../data/flavors';
import { formatMoney, PRICE } from '../../../data/config';

export function BottomBar({ flavor, qty, visible, onAdd }) {
  const cur = FLAVORS.find(f => f.id === flavor) ?? FLAVORS[0];

  return (
    <div className={`${styles.bottomBar} ${visible ? styles.bottomBarVisible : ''}`} aria-hidden={!visible}>
      <img src={cur.img} alt={cur.label} />
      <div className={styles.bottomBarInfo}>
        <span>{cur.label} · 6 Pack</span>
        <span className={styles.priceCurrent}>{formatMoney(PRICE * qty)}</span>
      </div>
      <Button size="sm" onClick={onAdd}>
        Agregar
      </Button>
    </div>
  );
}
