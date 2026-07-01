import styles from './ProductSection.module.css';

export function QtySelector({ value, onChange }) {
  return (
    <div className={styles.qtyStepper}>
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label="Reducir cantidad"
        disabled={value <= 1}
      >
        −
      </button>
      <span aria-label={`Cantidad: ${value}`}>{value}</span>
      <button onClick={() => onChange(value + 1)} aria-label="Aumentar cantidad">
        +
      </button>
    </div>
  );
}
