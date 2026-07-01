import styles from './ProductSection.module.css';

const OPTIONS = [
  { id: '30g', label: '30G', badge: '★ Más popular' },
  { id: '20g', label: '20G', badge: null },
];

export function ProteinSelector({ selected, onSelect }) {
  return (
    <div className={styles.section}>
      <span className={styles.label}>Proteína por botella</span>
      <div className={styles.proteinGrid}>
        {OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`${styles.proteinCard} ${selected === opt.id ? styles.proteinCardActive : ''}`}
            aria-pressed={selected === opt.id}
          >
            <span className={styles.proteinLabel}>{opt.label}</span>
            {opt.badge && <span className={styles.proteinBadge}>{opt.badge}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
