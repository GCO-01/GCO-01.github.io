import { useRef, useEffect, useLayoutEffect } from 'react';
import { GoalTile } from './GoalTile';
import { INTAKE_PATTERNS, intakeForPattern } from '../../data/calculadora';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import styles from './Calculadora.module.css';

// ── Opciones de cada control (chips de selección única) ───────────────
const AGE_RANGE_OPTS = [
  { id: '18-24', label: '18–24' },
  { id: '25-34', label: '25–34' },
  { id: '35-44', label: '35–44' },
  { id: '45-54', label: '45–54' },
  { id: '55-64', label: '55–64' },
  { id: '65+',   label: '65+' },
];

const GENDER_OPTS = [
  { id: 'male',   label: 'Hombre' },
  { id: 'female', label: 'Mujer' },
  { id: 'other',  label: 'Otro' },
];

const TRAINING_OPTS = [
  { id: 'strength_high', label: '3+ / sem' },
  { id: 'strength_some', label: '1–2 / sem' },
  { id: 'none',          label: 'No entreno' },
];

const ACTIVITY_OPTS = [
  { id: 'sedentary',   label: 'Sedentario' },
  { id: 'moderate',    label: 'Moderado' },
  { id: 'very_active', label: 'Muy activo' },
];

const STEPS = [
  { kicker: 'Paso 1 de 3', title: 'Tu objetivo' },
  { kicker: 'Paso 2 de 3', title: 'Tu perfil' },
  { kicker: 'Paso 3 de 3', title: 'Tu base actual' },
];

// Fuente única del conteo de pasos (la página deriva su LAST_STEP de acá).
export const STEP_COUNT = STEPS.length;
const LAST_STEP = STEPS.length - 1;

function sliderPct(val, min, max) {
  return `${Math.round(((val - min) / (max - min)) * 100)}%`;
}

// Selección única con semántica de radiogroup (chips como <button aria-pressed>).
function ChipGroup({ label, options, value, onSelect }) {
  return (
    <div className={styles.calcChips} role="radiogroup" aria-label={label}>
      {options.map(o => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-pressed={active}
            className={styles.calcChip}
            onClick={() => onSelect(o.id)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function isStepValid(step, formData) {
  if (step === 0) return !!formData.goal;
  // Paso "Perfil": peso + edad + género + entrenamiento + actividad, todo junto.
  if (step === 1) {
    return (
      formData.weight > 0 && formData.target > 0 && formData.height > 0 &&
      !!formData.age_range && !!formData.gender &&
      !!formData.training && !!formData.activity
    );
  }
  if (step === 2) return !!formData.intakePattern && formData.currentIntake > 0;
  return false;
}

export function CalcForm({ step, formData, onChange, onNext, onBack }) {
  const reduce = usePrefersReducedMotion();
  const scrollRef = useRef(null);
  const titleRef = useRef(null);

  const set = (key, val) => onChange({ ...formData, [key]: val });
  const valid = isStepValid(step, formData);
  const meta = STEPS[step];

  // Al setear el rango de edad derivamos `age` en paralelo → el cálculo
  // (computeProtein, que lee `age`) queda intacto; `age_range` es segmentación.
  const setAgeRange = id =>
    onChange({ ...formData, age_range: id, age: id === '65+' ? 'over65' : 'under65' });

  // A11y — mover el foco al título del paso al avanzar/retroceder. El header es
  // aria-live: al cambiar kicker+título el lector anuncia el nuevo paso.
  useEffect(() => {
    const t = titleRef.current;
    if (t) t.focus({ preventScroll: true });
  }, [step]);

  // Entrada ADITIVA de tarjetas: visibles por defecto; solo el JS agrega
  // .calcAnim (que las oculta) y luego escalona .calcIn. Sin JS o con
  // prefers-reduced-motion las tarjetas se ven completas.
  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll || reduce) return undefined;

    scroll.classList.add(styles.calcAnim);
    const cards = scroll.querySelectorAll('[data-card]');
    cards.forEach(c => c.classList.remove(styles.calcIn));
    void scroll.offsetWidth; // fuerza reflow para comprometer el estado oculto

    const timers = [];
    cards.forEach((c, i) =>
      timers.push(window.setTimeout(() => c.classList.add(styles.calcIn), 80 * i))
    );
    return () => timers.forEach(clearTimeout);
  }, [step, reduce]);

  return (
    <div className={styles.calcStage}>
      <div
        ref={scrollRef}
        className={`${styles.calcScroll} ${styles.calcHasBar} ${styles.calcFormScroll} ${
          step === 1 ? styles.calcFormPerfil : ''
        }`}
      >
        <div className={styles.calcHead} aria-live="polite">
          <span className={styles.calcHeadKicker}>{meta.kicker}</span>
          <h2 ref={titleRef} tabIndex={-1} className={`${styles.calcHeadTitle} ${styles.calcStepTitle}`}>
            {meta.title}
          </h2>
        </div>

        {/* ── Paso 1: Objetivo ── */}
        {step === 0 && (
          <div data-card className={styles.calcCard}>
            <p className={styles.calcCardLbl}>Elige tu meta</p>
            <div className={styles.calcGoalGrid} role="radiogroup" aria-label="Objetivo">
              {['muscle', 'recomp', 'lose', 'maintain'].map(id => (
                <GoalTile key={id} id={id} active={formData.goal === id} onSelect={g => set('goal', g)} />
              ))}
            </div>
          </div>
        )}

        {/* ── Paso 2 · Perfil: peso + altura (en desktop ocupa el ancho completo del grid) ── */}
        {step === 1 && (
          <div data-card className={`${styles.calcCard} ${styles.calcFormPesoCard}`}>
            <p className={styles.calcCardLbl}>Peso y altura</p>

            <div className={styles.calcWeightGroup}>
              <div className={styles.calcWeightRow}>
                <span className={styles.calcWeightLbl}>Peso actual</span>
                <span className={styles.calcWeightVal}>
                  {formData.weight}<span> kg</span>
                </span>
              </div>
              <input
                type="range" min={35} max={180} value={formData.weight}
                className={styles.calcSlider}
                aria-label="Peso actual en kilogramos"
                style={{ '--pct': sliderPct(formData.weight, 35, 180) }}
                onChange={e => set('weight', Number(e.target.value))}
              />
            </div>

            <div className={styles.calcWeightGroup}>
              <div className={styles.calcWeightRow}>
                <span className={styles.calcWeightLbl}>Peso objetivo</span>
                <span className={styles.calcWeightVal}>
                  {formData.target}<span> kg</span>
                </span>
              </div>
              <input
                type="range" min={35} max={180} value={formData.target}
                className={styles.calcSlider}
                aria-label="Peso objetivo en kilogramos"
                style={{ '--pct': sliderPct(formData.target, 35, 180) }}
                onChange={e => set('target', Number(e.target.value))}
              />
            </div>

            <div className={styles.calcWeightGroup}>
              <div className={styles.calcWeightRow}>
                <span className={styles.calcWeightLbl}>Altura</span>
                <span className={styles.calcWeightVal}>
                  {formData.height}<span> cm</span>
                </span>
              </div>
              <input
                type="range" min={140} max={210} value={formData.height}
                className={styles.calcSlider}
                aria-label="Altura en centímetros"
                style={{ '--pct': sliderPct(formData.height, 140, 210) }}
                onChange={e => set('height', Number(e.target.value))}
              />
            </div>

            <p className={styles.calcFieldHint}>
              La altura se usa para estimar tus calorías en el prompt de tu coach IA.
            </p>
          </div>
        )}

        {/* ── Paso 2 · Perfil: edad + género ── */}
        {step === 1 && (
          <>
            <div data-card className={styles.calcCard}>
              <p className={styles.calcCardLbl}>Edad</p>
              <ChipGroup
                label="Edad"
                options={AGE_RANGE_OPTS}
                value={formData.age_range}
                onSelect={setAgeRange}
              />
            </div>

            <div data-card className={styles.calcCard}>
              <p className={styles.calcCardLbl}>Género</p>
              <ChipGroup
                label="Género"
                options={GENDER_OPTS}
                value={formData.gender}
                onSelect={g => set('gender', g)}
              />
              <p className={styles.calcFieldHint}>Nos ayuda a conocerte, no cambia tu dosis.</p>
            </div>
          </>
        )}

        {/* ── Paso 2 · Perfil: entrenamiento + actividad ── */}
        {step === 1 && (
          <>
            <div data-card className={styles.calcCard}>
              <p className={styles.calcCardLbl}>Entrenamiento de fuerza</p>
              <ChipGroup
                label="Entrenamiento de fuerza"
                options={TRAINING_OPTS}
                value={formData.training}
                onSelect={t => set('training', t)}
              />
            </div>

            <div data-card className={styles.calcCard}>
              <p className={styles.calcCardLbl}>Actividad general</p>
              <ChipGroup
                label="Actividad general"
                options={ACTIVITY_OPTS}
                value={formData.activity}
                onSelect={a => set('activity', a)}
              />
              <p className={styles.calcFieldHint}>La actividad no cambia tu dosis.</p>
            </div>
          </>
        )}

        {/* ── Paso 3: Base (patrón de ingesta + ingesta actual) ── */}
        {step === 2 && (
          <div data-card className={styles.calcCard}>
            <p className={styles.calcCardLbl}>¿Cómo comes hoy?</p>
            <div className={styles.calcPatternGrid} role="radiogroup" aria-label="Patrón de ingesta">
              {INTAKE_PATTERNS.map(p => {
                const patternGrams = intakeForPattern(p);
                const active = formData.intakePattern === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-pressed={active}
                    className={styles.calcPatternCard}
                    onClick={() => {
                      const next = { ...formData, intakePattern: p.id };
                      next.currentIntake = patternGrams ?? 0;
                      onChange(next);
                    }}
                  >
                    <span className={styles.calcPatternEmoji}>{p.emoji}</span>
                    <span className={styles.calcPatternTitle}>{p.title}</span>
                    <span className={styles.calcPatternSub}>{p.sub}</span>
                    {patternGrams !== null && (
                      <span className={styles.calcPatternGrams}>~{patternGrams} g/día</span>
                    )}
                  </button>
                );
              })}
            </div>

            {formData.intakePattern === 'custom' && (
              <div className={styles.calcField}>
                <label htmlFor="calc-intake">Gramos de proteína por día</label>
                <input
                  id="calc-intake"
                  type="number" min={0} max={400} inputMode="numeric"
                  value={formData.currentIntake || ''}
                  placeholder="0"
                  onChange={e => set('currentIntake', Math.max(0, Number(e.target.value)))}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Barra persistente — SOLO navegación del formulario */}
      <div className={styles.calcNavbar}>
        <button
          type="button"
          className={styles.calcFab}
          aria-label={step === 0 ? 'Volver a la introducción' : 'Paso anterior'}
          onClick={onBack}
        >
          <span aria-hidden="true">←</span>
        </button>

        <div className={styles.calcNavDots} aria-hidden="true">
          {STEPS.map((s, i) => (
            <span
              key={s.kicker}
              className={[
                styles.calcNavDot,
                i === step ? styles.calcNavDotOn : '',
                i < step ? styles.calcNavDotDone : '',
              ].join(' ')}
            />
          ))}
        </div>

        <button
          type="button"
          className={styles.calcNavCta}
          disabled={!valid}
          onClick={onNext}
        >
          {step < LAST_STEP ? 'Continuar' : 'Confirmar'} <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
