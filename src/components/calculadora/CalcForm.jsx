import { Button } from '../ui/Button';
import { GoalTile } from './GoalTile';
import { INTAKE_PATTERNS } from '../../data/calculadora';
import styles from './Calculadora.module.css';

const TRAINING_OPTS = [
  { id: 'strength_high', label: '3+/sem' },
  { id: 'strength_some', label: '1–2/sem' },
  { id: 'none',          label: 'Sin entreno' },
];

const ACTIVITY_OPTS = [
  { id: 'sedentary',   label: 'Sedentario' },
  { id: 'moderate',    label: 'Moderado' },
  { id: 'very_active', label: 'Muy activo' },
];

const PHASE_NAMES = ['OBJETIVO', 'PERFIL', 'BASE'];

function PhaseBar({ step }) {
  return (
    <div className={styles.phaseBar}>
      {PHASE_NAMES.map((name, i) => (
        <div key={name} className={styles.phaseSegment}>
          <span className={[
            styles.phaseLabel,
            i === step ? styles.phaseLabelActive : '',
            i < step  ? styles.phaseLabelDone  : '',
          ].join(' ')}>
            {String(i + 1).padStart(2, '0')} · {name}
          </span>
          <div className={styles.phaseTrack}>
            <div className={[
              styles.phaseFill,
              i === step ? styles.phaseFillActive : '',
              i < step  ? styles.phaseFillDone  : '',
            ].join(' ')} />
          </div>
        </div>
      ))}
    </div>
  );
}

function sliderPct(val, min, max) {
  return `${Math.round(((val - min) / (max - min)) * 100)}%`;
}

function isStepValid(step, formData) {
  if (step === 0) return !!formData.goal;
  if (step === 1) return !!formData.training && !!formData.activity;
  if (step === 2) return !!formData.intakePattern && formData.currentIntake > 0;
  return false;
}

export function CalcForm({ step, formData, onChange, onNext, onBack }) {
  const set = (key, val) => onChange({ ...formData, [key]: val });
  const valid = isStepValid(step, formData);

  const STEP_TITLES = ['ELIGE TU MODO', 'CONFIGURA TU PERFIL', 'ESTABLECE TU BASE'];

  return (
    <div className={styles.formWrap}>
      <div className={styles.stepHeader}>
        <PhaseBar step={step} />
        <h2 className={styles.stepTitle}>{STEP_TITLES[step]}</h2>
      </div>

      {/* ── Paso 0: Objetivo ── */}
      {step === 0 && (
        <div className={styles.goalGrid}>
          {['muscle', 'recomp', 'lose', 'maintain'].map(id => (
            <GoalTile key={id} id={id} active={formData.goal === id} onSelect={g => set('goal', g)} />
          ))}
        </div>
      )}

      {/* ── Paso 1: Datos ── */}
      {step === 1 && (
        <>
          <div className={styles.fieldGroup}>
            <p className={styles.fieldLabel}>Peso actual</p>
            <p className={styles.sliderVal}>
              {formData.weight}<span className={styles.sliderValUnit}> kg</span>
            </p>
            <input
              type="range" min={35} max={180} value={formData.weight}
              className={styles.slider}
              style={{ '--pct': sliderPct(formData.weight, 35, 180) }}
              onChange={e => set('weight', Number(e.target.value))}
            />
          </div>

          <div className={styles.fieldGroup}>
            <p className={styles.fieldLabel}>Peso objetivo</p>
            <p className={styles.sliderVal}>
              {formData.target}<span className={styles.sliderValUnit}> kg</span>
            </p>
            <input
              type="range" min={35} max={180} value={formData.target}
              className={styles.slider}
              style={{ '--pct': sliderPct(formData.target, 35, 180) }}
              onChange={e => set('target', Number(e.target.value))}
            />
          </div>

          <div className={styles.fieldGroup}>
            <p className={styles.fieldLabel}>Entrenamiento de fuerza</p>
            <div className={styles.segmented}>
              {TRAINING_OPTS.map(o => (
                <button
                  key={o.id} type="button"
                  className={`${styles.segBtn} ${formData.training === o.id ? styles.segBtnActive : ''}`}
                  onClick={() => set('training', o.id)}
                >{o.label}</button>
              ))}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <p className={styles.fieldLabel}>Actividad general</p>
            <div className={styles.segmented}>
              {ACTIVITY_OPTS.map(o => (
                <button
                  key={o.id} type="button"
                  className={`${styles.segBtn} ${formData.activity === o.id ? styles.segBtnActive : ''}`}
                  onClick={() => set('activity', o.id)}
                >{o.label}</button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Paso 2: Ingesta ── */}
      {step === 2 && (
        <>
          <div className={styles.patternGrid}>
            {INTAKE_PATTERNS.map(p => (
              <button
                key={p.id} type="button"
                className={`${styles.patternCard} ${formData.intakePattern === p.id ? styles.patternCardActive : ''}`}
                onClick={() => {
                  const next = { ...formData, intakePattern: p.id };
                  next.currentIntake = p.grams !== null ? p.grams : 0;
                  onChange(next);
                }}
              >
                <span className={styles.patternEmoji}>{p.emoji}</span>
                <p className={styles.patternTitle}>{p.title}</p>
                <p className={styles.patternSub}>{p.sub}</p>
                {p.grams !== null && (
                  <p className={styles.patternGrams}>~{p.grams} g/día</p>
                )}
              </button>
            ))}
          </div>

          {formData.intakePattern === 'custom' && (
            <div className={styles.customIntakeRow}>
              <span className={styles.customIntakeLabel}>G / día</span>
              <input
                type="number" min={0} max={400}
                value={formData.currentIntake || ''}
                placeholder="0"
                className={styles.numInput}
                onChange={e => set('currentIntake', Math.max(0, Number(e.target.value)))}
              />
            </div>
          )}
        </>
      )}

      <div className={styles.formActions}>
        {step > 0 && (
          <Button variant="secondary" size="md" onClick={onBack}>← Atrás</Button>
        )}
        <Button
          variant="primary" size="md"
          fullWidth={step === 0}
          disabled={!valid}
          onClick={onNext}
        >
          {step < 2 ? 'CONFIRMAR' : 'EJECUTAR PROTOCOLO'}
        </Button>
      </div>
    </div>
  );
}
