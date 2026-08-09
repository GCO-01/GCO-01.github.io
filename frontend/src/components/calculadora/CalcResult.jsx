import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { selectCitation } from '../../data/calculadora';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import styles from './Calculadora.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── count-up ease-out cúbico (M2). Con reduced-motion salta al final ──
function useCountUp(target, { duration = 900, reduce = false } = {}) {
  const [value, setValue] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce) return undefined;
    let raf = 0;
    let start = null;
    const step = ts => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setValue(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduce]);
  return reduce ? target : value;
}

// ── Número hero: SVG que escala al ancho por viewBox del bbox real ──
function DoseHero({ grams, reduce }) {
  const svgRef = useRef(null);
  const textRef = useRef(null);
  const numRef = useRef(null);
  const display = useCountUp(grams, { reduce });

  // Mide con el valor final (el más ancho → a prueba de 2/3 dígitos) y fija el
  // viewBox al bbox real, con recorte superior intencional del 10%.
  useLayoutEffect(() => {
    const svg = svgRef.current;
    const textEl = textRef.current;
    const numEl = numRef.current;
    if (!svg || !textEl || !numEl) return undefined;

    const fit = () => {
      const prev = numEl.textContent;
      numEl.textContent = String(grams);
      let bb;
      try {
        bb = textEl.getBBox();
      } catch {
        numEl.textContent = prev;
        return;
      }
      numEl.textContent = prev;
      if (!bb.width || !bb.height) return;
      const clip = 0.1;
      const padX = bb.width * 0.01;
      svg.setAttribute(
        'viewBox',
        `${bb.x - padX} ${bb.y + bb.height * clip} ${bb.width + padX * 2} ${bb.height * (1 - clip)}`
      );
    };

    fit();
    window.addEventListener('resize', fit);
    // Refit tras cargar fuentes (por si el branding define otra display luego).
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit).catch(() => {});
    return () => window.removeEventListener('resize', fit);
  }, [grams]);

  return (
    <div className={styles.calcHeroClip}>
      <svg
        ref={svgRef}
        className={styles.calcDoseSvg}
        role="img"
        aria-label={`Tu dosis diaria: ${grams} gramos por día`}
        viewBox="0 0 300 120"
        preserveAspectRatio="xMinYMax meet"
      >
        <text ref={textRef} x="0" y="100">
          <tspan ref={numRef}>{display}</tspan>
          <tspan className={styles.calcUnit} dx="4"> g</tspan>
        </text>
      </svg>
    </div>
  );
}

// ── Segmented control liquid glass + línea técnica comparativa ──────
function CompareSegment({ result, reduce }) {
  const [tab, setTab] = useState(0);
  const axisRef = useRef(null);

  // Datos DERIVADOS del result real (nunca hardcodeados), salvo el promedio
  // peruano, que es una cifra poblacional ABSOLUTA de ELANS (78.6–79.8 g/día,
  // no una tasa g/kg escalada por el peso del usuario).
  const you = result.grams;
  const promedioPeru = 79;                                          // ELANS: consumo promedio real en Perú (Herrera-Cuenca 2023)
  const optMin = Math.round(result.baseWeight * 1.2);
  const optMax = Math.round(result.baseWeight * 1.6);
  const atleta = Math.round(result.baseWeight * 2.2);               // techo Morton

  // Escala fija: 0 → valor Atleta (el más alto) → no cambia entre pestañas.
  const MIN = 0;
  const MAX = Math.max(atleta, you, promedioPeru, optMax, 1);
  // Clamp a [6, 94] % para que el valor/etiqueta del marcador no se recorte en
  // los extremos en móvil chico (≤360px).
  const pos = g => Math.max(6, Math.min(94, ((g - MIN) / (MAX - MIN)) * 100));

  const TABS = [
    {
      key: 'prom',
      label: 'Promedio Perú',
      value: promedioPeru,
      short: 'Promedio',
      band: null,
      caption: (
        <><b>El promedio peruano ronda 79 g/día</b> — el borde inferior del rango óptimo (ELANS 2023).</>
      ),
    },
    {
      key: 'opt',
      label: 'Rango óptimo',
      value: null,
      short: 'Óptimo',
      band: [optMin, optMax],
      caption: (
        <>La franja marca el <b>rango óptimo de salud</b>: 1.2–1.6 g/kg (Phillips 2016).</>
      ),
    },
    {
      key: 'atl',
      label: 'Atleta',
      value: atleta,
      short: 'Atleta',
      band: null,
      caption: (
        <>El <b>techo de rendimiento</b> (2.2 g/kg, Morton) — referencia, no tu meta.</>
      ),
    },
  ];

  const active = TABS[tab];

  // Eje dibujado con trazo al montar (M1).
  useEffect(() => {
    const axis = axisRef.current;
    if (!axis) return;
    if (reduce) { axis.style.transform = 'scaleX(1)'; return; }
    axis.style.transition = 'none';
    axis.style.transform = 'scaleX(0)';
    const t = setTimeout(() => {
      axis.style.transition = 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
      axis.style.transform = 'scaleX(1)';
    }, 260);
    return () => clearTimeout(t);
  }, [reduce]);

  return (
    <>
      <div className={styles.calcSeg} role="tablist" aria-label="Comparar tu dosis">
        <span
          className={styles.calcSegThumb}
          aria-hidden="true"
          style={{ transform: `translateX(${tab * 100}%)` }}
        />
        {TABS.map((t, i) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === i}
            aria-label={t.label}
            onClick={() => setTab(i)}
          >
            {t.short}
          </button>
        ))}
      </div>

      <div className={styles.calcSpecline}>
        <div ref={axisRef} className={styles.calcAxis} />
        <div className={styles.calcScaleEnd} style={{ left: 0 }}>0</div>
        <div className={styles.calcScaleEnd} style={{ right: 0 }}>{MAX} g</div>

        <div
          className={styles.calcBand}
          style={
            active.band
              ? { opacity: 1, left: `${pos(active.band[0])}%`, width: `${pos(active.band[1]) - pos(active.band[0])}%` }
              : { opacity: 0 }
          }
        />

        {/* Marcador "Tú" — valor arriba del eje */}
        <div className={`${styles.calcMk} ${styles.calcMkYou}`} style={{ left: `${pos(you)}%` }}>
          <span className={styles.calcV}>{you}</span>
          <span className={styles.calcDot} />
          <span className={styles.calcKk}>Tú</span>
        </div>

        {/* Marcador comparativo — valor abajo del eje (nunca colisionan) */}
        <div
          className={`${styles.calcMk} ${styles.calcMkCmp}`}
          style={{ left: `${pos(active.value ?? 0)}%`, opacity: active.value == null ? 0 : 1 }}
        >
          <span className={styles.calcV}>{active.value ?? ''}</span>
          <span className={styles.calcDot} />
          <span className={styles.calcKk}>{active.short}</span>
        </div>
      </div>

      <p className={styles.calcCaption} aria-live="polite">{active.caption}</p>
    </>
  );
}

const VALUE_STACK = [
  { no: '01', title: 'Plan de comidas', sub: grams => `Desayuno, almuerzo y cena para tus ${grams} g.` },
  { no: '02', title: 'Código 50% OFF', sub: () => 'En tu primer shake, al instante.' },
  { no: '03', title: 'Prompt de seguimiento IA', sub: () => 'Copia y pega para tu rutina diaria.' },
];

export function CalcResult({ result, onUnlock }) {
  const reduce = usePrefersReducedMotion();
  const scrollRef = useRef(null);
  const heroRef = useRef(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const valid = name.trim().length > 1 && EMAIL_RE.test(email);

  const { grams, gap, status } = result;
  const cite = selectCitation(result); // fuente de la dosis
  const gapValue = useCountUp(gap, { reduce });
  const shakes = Math.max(1, Math.round(gap / 30));

  // Montaje "vivo" (M3/M6): sheen del hero + entrada escalonada de tarjetas y
  // filas. La animación es ADITIVA — sin JS o con reduced-motion las tarjetas se
  // ven completas (la clase .calcAnim, que las oculta, solo la añade el JS).
  // useLayoutEffect: aplica el estado oculto antes de pintar → sin parpadeo.
  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (hero) hero.classList.add(styles.calcPlay); // sheen (el @media lo ignora bajo reduced-motion)

    const scroll = scrollRef.current;
    if (!scroll || reduce) return undefined;

    scroll.classList.add(styles.calcAnim);
    const cards = scroll.querySelectorAll('[data-card]');
    const rows = scroll.querySelectorAll('[data-row]');
    void scroll.offsetWidth; // fuerza reflow para comprometer el estado oculto

    const timers = [];
    cards.forEach((c, i) => timers.push(window.setTimeout(() => c.classList.add(styles.calcIn), 90 * i)));
    rows.forEach((r, i) => timers.push(window.setTimeout(() => r.classList.add(styles.calcIn), 560 + i * 120)));
    return () => timers.forEach(clearTimeout);
  }, [reduce]);

  return (
    <div className={styles.calcStage}>
      <div ref={scrollRef} className={`${styles.calcScroll} ${styles.calcResultScroll}`}>
        <div className={styles.calcHead}>
          <span className={styles.calcHeadKicker}>Tu resultado</span>
          <h2 className={styles.calcHeadTitle}>Tu dosis diaria</h2>
        </div>

        {/* Tarjeta 1 — dosis hero (en desktop: columna izquierda sticky) */}
        <div ref={heroRef} data-card className={`${styles.calcCard} ${styles.calcHeroCard}`}>
          <DoseHero grams={grams} reduce={reduce} />
          <p className={styles.calcHeroLbl}>Necesitas al día · {cite.author} {cite.year}</p>

          {gap > 0 ? (
            <p className={styles.calcPull}>
              Te faltan <b>{gapValue} g</b> de proteína al día.
              <span className={styles.calcPullId}>
                Tu brecha no se cierra sola — son ≈ {shakes} shakes VAGGO.
              </span>
            </p>
          ) : (
            <p className={styles.calcPull}>
              Ya llegas a tus <b>{grams} g</b> diarios.
              <span className={styles.calcPullId}>
                {status === 'above'
                  ? 'Objetivo cubierto — ahora optimiza timing y calidad con VAGGO.'
                  : 'Objetivo cubierto — mantené el ritmo con VAGGO.'}
              </span>
            </p>
          )}
        </div>

        {/* En desktop, las 3 tarjetas secundarias forman la columna derecha.
            En mobile el wrapper es display:contents → stack idéntico al actual. */}
        <div className={styles.calcResultAside}>
        {/* Tarjeta 2 — comparador */}
        <div data-card className={styles.calcCard}>
          <p className={styles.calcCardLbl}>Cómo te comparás</p>
          <CompareSegment result={result} reduce={reduce} />
        </div>

        {/* Tarjeta 3 — lo que desbloqueas */}
        <div data-card className={styles.calcCard}>
          <p className={styles.calcCardLbl}>Lo que desbloqueas</p>
          <div className={styles.calcStack}>
            {VALUE_STACK.map(row => (
              <div key={row.no} data-row className={styles.calcRow}>
                <span className={styles.calcNo}>{row.no}</span>
                <span className={styles.calcTx}>
                  <b>{row.title}</b>
                  <small>{row.sub(grams)}</small>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tarjeta 4 — gate (CTA DENTRO de la card) */}
        <div data-card className={styles.calcCard}>
          <div className={styles.calcField}>
            <label htmlFor="calc-name">Nombre</label>
            <input
              id="calc-name"
              type="text"
              placeholder="Tu nombre"
              autoComplete="name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className={styles.calcField}>
            <label htmlFor="calc-email">Email</label>
            <input
              id="calc-email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <button
            type="button"
            className={styles.calcCta}
            disabled={!valid}
            onClick={() => onUnlock({ name: name.trim(), email })}
          >
            Desbloquear mi plan <span aria-hidden="true">→</span>
          </button>

          <p className={styles.calcConsent}>
            Se desbloquea al instante en tu pantalla. Guardamos tu email para novedades;
            sin spam, baja cuando quieras.
          </p>
        </div>
        </div>{/* /calcResultAside */}
      </div>
    </div>
  );
}
