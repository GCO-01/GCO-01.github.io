import { CheckIcon } from '../ui/icons';
import styles from './BatchLanding.module.css';

const COMMITMENTS = [
  { key: 'consumeWeek', label: 'Consumiré el producto durante una semana' },
  { key: 'whatsappCheckins', label: 'Responderé los check-ins por WhatsApp' },
  { key: 'finalSurvey', label: 'Completaré la encuesta final' },
  { key: 'honestFeedback', label: 'Daré feedback completamente honesto, incluyendo lo negativo' },
  {
    key: 'termsAccepted',
    label: 'Estoy de acuerdo con los términos y condiciones para el uso y tratamiento de la información generada en este proceso',
  },
];

export function CommitmentChecklist({ commitments, onChange }) {
  return (
    <div className={styles.checklistGroup}>
      {COMMITMENTS.map(c => {
        const checked = !!commitments[c.key];
        return (
          <label key={c.key} className={styles.checkboxRow}>
            <button
              type="button"
              role="checkbox"
              aria-checked={checked}
              className={`${styles.checkbox} ${checked ? styles.checkboxChecked : ''}`}
              onClick={() => onChange(c.key, !checked)}
            >
              {checked && <CheckIcon size={12} stroke="#fff" />}
            </button>
            <span>{c.label}</span>
          </label>
        );
      })}
    </div>
  );
}
