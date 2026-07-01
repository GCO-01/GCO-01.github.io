import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { RANGE_ROWS, CITATIONS } from '../../data/calculadora';
import styles from './Calculadora.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RADIUS = 58;
const CIRC = 2 * Math.PI * RADIUS;

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

function ProfileHero({ result }) {
  const { grams, rda, currentIntake, gap, status } = result;
  const displayGrams = useCountUp(grams);

  if (currentIntake > 0) {
    const pct = Math.min(100, Math.round((currentIntake / grams) * 100));
    const targetOffset = CIRC - (pct / 100) * CIRC;
    const eggs = Math.round(gap / 6);

    return (
      <div className={styles.profileHero}>
        <p className={styles.missionTag}>TU DOSIS DIARIA</p>

        <div className={styles.heroLayout}>
          <div className={styles.donut} style={{ width: 140, height: 140 }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              <circle
                cx="70" cy="70" r={RADIUS} fill="none"
                stroke="url(#dGrad)" strokeWidth="12"
                strokeDasharray={CIRC}
                strokeDashoffset={targetOffset}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)' }}
              />
              <defs>
                <linearGradient id="dGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#e3796c" />
                  <stop offset="100%" stopColor="#302f9b" />
                </linearGradient>
              </defs>
            </svg>
            <div className={styles.donutLabel}>
              <span className={styles.donutPct}>{pct}%</span>
              <span className={styles.donutSub}>cubierto</span>
            </div>
          </div>

          <div className={styles.heroNumbers}>
            <p className={styles.heroLabel}>Necesitas</p>
            <p className={styles.heroNumber}>
              {displayGrams}<span className={styles.heroUnit}> g</span>
            </p>
            <p className={styles.heroSecondary}>Hoy comes: {currentIntake} g</p>
          </div>
        </div>

        {gap > 0 && (
          <div className={styles.gapStats}>
            <div className={styles.gapStat}>
              <span className={styles.gapStatVal}>{gap} g</span>
              <span className={styles.gapStatLabel}>DÉFICIT ACTUAL</span>
            </div>
            <div className={styles.gapStat}>
              <span className={styles.gapStatVal}>{100 - pct}%</span>
              <span className={styles.gapStatLabel}>BRECHA</span>
            </div>
            {eggs > 0 && (
              <div className={styles.gapStat}>
                <span className={styles.gapStatVal}>≈ {eggs}</span>
                <span className={styles.gapStatLabel}>EQUIVALENCIA</span>
              </div>
            )}
          </div>
        )}

        {status === 'above' && (
          <p className={styles.statusBadge}>
            ✓ Objetivo cubierto — optimiza timing y calidad
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.profileHero}>
      <p className={styles.missionTag}>TU DOSIS DIARIA</p>
      <p className={styles.heroNumber}>
        {displayGrams}<span className={styles.heroUnit}> g</span>
      </p>
      <p className={styles.heroSecondary}>
        {result.coef.toFixed(1)} g/kg · {result.baseWeight} kg base
      </p>
    </div>
  );
}

function SwipeCard({ result }) {
  const [tab, setTab] = useState(0);
  const startX = useRef(null);

  const { grams, rda, currentIntake } = result;
  const maxVal = Math.max(grams, currentIntake > 0 ? currentIntake : 0, rda);
  const userCoef = result.coef;
  const cite = userCoef >= 1.6 ? CITATIONS.morton : userCoef >= 1.2 ? CITATIONS.patrick : CITATIONS.phillips;

  const handleTouchStart = e => { startX.current = e.touches[0].clientX; };
  const handleTouchEnd = e => {
    if (startX.current === null) return;
    const delta = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(delta) > 50) setTab(delta < 0 ? 1 : 0);
    startX.current = null;
  };

  return (
    <div className={styles.swipeCard} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className={styles.swipeTabs}>
        <button className={`${styles.swipeTab} ${tab === 0 ? styles.swipeTabActive : ''}`} onClick={() => setTab(0)}>
          ANÁLISIS
        </button>
        <button className={`${styles.swipeTab} ${tab === 1 ? styles.swipeTabActive : ''}`} onClick={() => setTab(1)}>
          CIENCIA
        </button>
      </div>

      <div className={styles.swipeBody}>
        {tab === 0 && (
          <div className={styles.tanksRow}>
            {currentIntake > 0 && (
              <div className={styles.tankWrap}>
                <div className={styles.tankVal}>{currentIntake} g</div>
                <div className={styles.tankBar} style={{
                  height: `${Math.round((currentIntake / maxVal) * 108)}px`,
                  background: 'rgba(255,255,255,0.1)',
                }} />
                <div className={styles.tankLbl}>Tu ingesta</div>
              </div>
            )}
            <div className={styles.tankWrap}>
              <div className={styles.tankVal}>{rda} g</div>
              <div className={styles.tankBar} style={{
                height: `${Math.round((rda / maxVal) * 108)}px`,
                background: '#302f9b',
              }} />
              <div className={styles.tankLbl}>RDA</div>
            </div>
            <div className={styles.tankWrap}>
              <div className={styles.tankVal}>{grams} g</div>
              <div className={styles.tankBar} style={{
                height: `${Math.round((grams / maxVal) * 108)}px`,
                background: 'linear-gradient(to top, #302f9b, #db5242)',
              }} />
              <div className={styles.tankLbl}>Tu meta</div>
            </div>
          </div>
        )}

        {tab === 1 && (
          <div className={styles.rangeTable}>
            {RANGE_ROWS.map(r => {
              const isUser = userCoef >= r.min && userCoef <= r.max;
              return (
                <div key={r.range} className={`${styles.rangeRow} ${isUser ? styles.rangeHighlight : ''}`}>
                  <span className={styles.rangeLabel}>{r.label}</span>
                  <span className={styles.rangeVal}>{r.range}</span>
                </div>
              );
            })}
            <div className={styles.citation}>
              <p className={styles.citationText}>
                <strong>{cite.author}</strong> ({cite.year}) — {cite.note}{' '}
                <em style={{ opacity: 0.6 }}>{cite.journal}</em>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GateForm({ onUnlock }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const valid = name.trim().length > 1 && EMAIL_RE.test(email);

  return (
    <div className={styles.gateCard}>
      <h3 className={styles.gateTitle}>DESBLOQUEAR PROTOCOLO</h3>
      <p className={styles.gateSub}>Recibe tu plan personalizado + Early Access 50% off en tu primer Shake.</p>
      <div className={styles.gateInputs}>
        <input
          className={styles.gateInput}
          type="text"
          placeholder="Tu nombre"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className={styles.gateInput}
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <Button variant="primary" size="md" fullWidth disabled={!valid} onClick={() => onUnlock({ name: name.trim(), email })}>
        VER MI PROTOCOLO
      </Button>
    </div>
  );
}

export function CalcResult({ result, onUnlock }) {
  return (
    <div className={styles.resultWrap}>
      <ProfileHero result={result} />
      <SwipeCard result={result} />
      <GateForm onUnlock={onUnlock} />
    </div>
  );
}
