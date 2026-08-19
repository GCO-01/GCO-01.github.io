import styles from './BatchLanding.module.css';

// Generaliza el ChipGroup de CalcForm: soporta selección única (radiogroup)
// o múltiple (checkbox group), con el mismo look de pill.
export function PillGroup({ options, mode = 'single', value, onChange, label }) {
  const isMulti = mode === 'multi';
  const selected = id => (isMulti ? (value || []).includes(id) : value === id);

  const toggle = id => {
    if (isMulti) {
      const arr = value || [];
      onChange(arr.includes(id) ? arr.filter(v => v !== id) : [...arr, id]);
    } else {
      onChange(id);
    }
  };

  return (
    <div
      className={styles.pillGroup}
      role={isMulti ? 'group' : 'radiogroup'}
      aria-label={label}
    >
      {options.map(o => {
        const active = selected(o.id);
        return (
          <button
            key={o.id}
            type="button"
            role={isMulti ? 'checkbox' : 'radio'}
            aria-checked={active}
            className={`${styles.pill} ${active ? styles.pillActive : ''}`}
            onClick={() => toggle(o.id)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
