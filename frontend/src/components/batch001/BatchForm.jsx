import { useRef, useLayoutEffect } from 'react';
import { PillGroup } from './PillGroup';
import { CommitmentChecklist } from './CommitmentChecklist';
import { LIFESTYLE_OPTIONS, GOAL_OPTIONS, GENDER_OPTIONS } from '../../data/batch001';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { ArrowRightIcon } from '../ui/icons';
import styles from './BatchLanding.module.css';

// Fuente única del conteo de pasos.
export const STEP_COUNT = 4;
const LAST_STEP = STEP_COUNT - 1;

export function isStepValid(step, formData) {
  if (step === 0) {
    return (
      !!formData.fullName.trim() &&
      Number(formData.age) > 0 &&
      !!formData.gender &&
      !!formData.address.trim() &&
      /\S+@\S+\.\S+/.test(formData.email)
    );
  }
  if (step === 1) return formData.lifestyle.length > 0;
  if (step === 2) {
    const goalOk = !!formData.goal && (formData.goal !== 'other' || !!formData.goalOther.trim());
    return goalOk && !!formData.expectations.trim();
  }
  if (step === 3) return Object.values(formData.commitments).every(Boolean);
  return false;
}

export function BatchForm({ step, formData, onChange, onNext, onBack }) {
  const reduce = usePrefersReducedMotion();
  const scrollRef = useRef(null);

  const set = (key, val) => onChange({ ...formData, [key]: val });
  const setCommitment = (key, val) => onChange({ ...formData, commitments: { ...formData.commitments, [key]: val } });
  const valid = isStepValid(step, formData);

  // Entrada de la tarjeta del paso — mismo patrón aditivo que CalcForm:
  // JS agrega .stepAnim (oculta) y luego escalona .stepIn.
  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll || reduce) return undefined;

    scroll.classList.add(styles.stepAnim);
    void scroll.offsetWidth; // fuerza reflow

    const timer = window.setTimeout(() => scroll.classList.add(styles.stepIn), 40);
    return () => clearTimeout(timer);
  }, [step, reduce]);

  return (
    <div>
      <div className={styles.progressBar}>
        {Array.from({ length: STEP_COUNT }).map((_, i) => (
          <span
            key={i}
            className={`${styles.progressSegment} ${i <= step ? styles.progressSegmentDone : ''}`}
          />
        ))}
        <span className={styles.progressCounter}>{step + 1}/{STEP_COUNT}</span>
      </div>

      <div ref={scrollRef} className={styles.stepBody} data-card>
        {step === 0 && (
          <>
            <span className={styles.eyebrow}>Paso 1 de 4</span>
            <h2 className={styles.headline}>Cuéntanos sobre ti</h2>
            <div className={styles.field}>
              <label htmlFor="batch-fullName">Nombre completo</label>
              <input
                id="batch-fullName"
                type="text"
                value={formData.fullName}
                onChange={e => set('fullName', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="batch-age">Edad</label>
              <input
                id="batch-age"
                type="number"
                min={1}
                value={formData.age}
                onChange={e => set('age', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label>Género</label>
              <PillGroup label="Género" options={GENDER_OPTIONS} mode="single" value={formData.gender} onChange={v => set('gender', v)} />
            </div>
            <div className={styles.field}>
              <label htmlFor="batch-address">Dirección</label>
              <input
                id="batch-address"
                type="text"
                value={formData.address}
                onChange={e => set('address', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="batch-email">Email</label>
              <input
                id="batch-email"
                type="email"
                value={formData.email}
                onChange={e => set('email', e.target.value)}
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <span className={styles.eyebrow}>Paso 2 de 4</span>
            <h2 className={styles.headline}>Tu estilo de vida</h2>
            <p className={styles.subtitle}>Selecciona todas las que apliquen.</p>
            <PillGroup label="Estilo de vida" options={LIFESTYLE_OPTIONS} mode="multi" value={formData.lifestyle} onChange={v => set('lifestyle', v)} />
          </>
        )}

        {step === 2 && (
          <>
            <span className={styles.eyebrow}>Paso 3 de 4</span>
            <h2 className={styles.headline}>Tu objetivo</h2>
            <PillGroup label="Objetivo" options={GOAL_OPTIONS} mode="single" value={formData.goal} onChange={v => set('goal', v)} />
            {formData.goal === 'other' && (
              <div className={styles.field}>
                <label htmlFor="batch-goalOther">Cuéntanos cuál</label>
                <input
                  id="batch-goalOther"
                  type="text"
                  value={formData.goalOther}
                  onChange={e => set('goalOther', e.target.value)}
                />
              </div>
            )}
            <div className={styles.field}>
              <label htmlFor="batch-expectations">¿Qué esperas de este proceso?</label>
              <textarea
                id="batch-expectations"
                value={formData.expectations}
                onChange={e => set('expectations', e.target.value)}
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <span className={styles.eyebrow}>Paso 4 de 4</span>
            <h2 className={styles.headline}>Tu compromiso</h2>
            <CommitmentChecklist commitments={formData.commitments} onChange={setCommitment} />
          </>
        )}
      </div>

      <div className={styles.navRow}>
        {step > 0 ? (
          <button type="button" className={styles.backLink} onClick={onBack}>← Atrás</button>
        ) : (
          <span />
        )}
        <button type="button" className={styles.ctaPrimary} disabled={!valid} onClick={onNext}>
          {step < LAST_STEP ? 'Continuar' : 'Enviar formulario'} <ArrowRightIcon size={14} stroke="#fff" />
        </button>
      </div>
    </div>
  );
}
