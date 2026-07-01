import styles from './ProductSection.module.css';
import { FLAVORS } from '../../../data/flavors';

export function FlavorSelector({ selected, onSelect }) {
  const cur = FLAVORS.find(f => f.id === selected);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.label}>Sabor</span>
        {cur && <span className={styles.desc}>{cur.desc}</span>}
      </div>
      <div className={styles.flavorGrid}>
        {FLAVORS.map(f => (
          <button
            key={f.id}
            onClick={() => onSelect(f.id)}
            className={`${styles.flavorCard} ${selected === f.id ? styles.flavorCardActive : ''}`}
            aria-pressed={selected === f.id}
          >
            <img src={f.img} alt="" loading="lazy" />
            <span>{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
