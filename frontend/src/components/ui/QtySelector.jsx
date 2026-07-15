import styles from './QtySelector.module.css';

export function QtySelector({ value, onChange, className = '' }) {
  return (
    <div className={`${styles.qtyStepper} ${className}`}>
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
