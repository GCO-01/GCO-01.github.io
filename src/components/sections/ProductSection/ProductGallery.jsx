import styles from './ProductSection.module.css';
import { FLAVORS } from '../../../data/flavors';

export function ProductGallery({ selectedFlavor, onFlavorSelect }) {
  const cur = FLAVORS.find(f => f.id === selectedFlavor) ?? FLAVORS[0];

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImage}>
        <div className={styles.earlyBadge}>EARLY ACCESS · 50% OFF</div>
        <img
          key={selectedFlavor}
          src={cur.img}
          alt={cur.label}
          className="pp-fade"
          loading="eager"
        />
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statNum}>30G</span>
            <span className={styles.statLabel}>Proteína</span>
          </div>
          <div className={`${styles.statItem} ${styles.statDark}`}>
            <span className={styles.statNum}>189</span>
            <span className={styles.statLabel}>Calorías</span>
          </div>
        </div>

        <div className={styles.statsBar}>
          <div className={styles.statsBarLeft}>
            <span className={styles.statsBarNum}>30G</span>
            <span className={styles.statsBarLabel}>Proteína</span>
          </div>
          <div className={styles.statsBarRight}>
            <span className={styles.statsBarNum}>189</span>
            <span className={styles.statsBarLabel}>Calorías</span>
          </div>
        </div>
      </div>

      <div className={styles.thumbnails}>
        {FLAVORS.map(f => (
          <button
            key={f.id}
            onClick={() => onFlavorSelect(f.id)}
            className={`${styles.thumb} ${selectedFlavor === f.id ? styles.thumbActive : ''}`}
            aria-label={`Ver sabor ${f.label}`}
            aria-pressed={selectedFlavor === f.id}
          >
            <img src={f.img} alt={f.label} loading="lazy" />
          </button>
        ))}
      </div>

    </div>
  );
}
