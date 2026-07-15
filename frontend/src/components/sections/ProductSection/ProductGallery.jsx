import styles from './ProductSection.module.css';
import { FLAVORS } from '../../../data/flavors';
import { PRODUCT } from '../../../data/product';

// Mismos datos para los chips desktop (.stats) y el footer mobile (.statsBar)
const STATS = [
  { num: `${PRODUCT.proteinG}G`, label: 'Proteína' },
  { num: String(PRODUCT.kcal), label: 'Calorías' },
];

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
          {STATS.map((s, i) => (
            <div key={s.label} className={`${styles.statItem} ${i === 1 ? styles.statDark : ''}`}>
              <span className={styles.statNum}>{s.num}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.statsBar}>
          <div className={styles.statsBarLeft}>
            <span className={styles.statsBarNum}>{STATS[0].num}</span>
            <span className={styles.statsBarLabel}>{STATS[0].label}</span>
          </div>
          <div className={styles.statsBarRight}>
            <span className={styles.statsBarNum}>{STATS[1].num}</span>
            <span className={styles.statsBarLabel}>{STATS[1].label}</span>
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
