import { useState } from 'react';
import styles from './Calculadora.module.css';

const SVG_PATHS = {
  muscle: (
    <svg width="100%" height="60" viewBox="0 0 120 60" fill="none">
      <defs>
        <linearGradient id="gm" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#db5242" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#db5242" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <path d="M4 54 C30 48 60 24 116 6" stroke="#db5242" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M4 54 C30 48 60 24 116 6 L116 60 L4 60 Z" fill="url(#gm)" />
    </svg>
  ),
  recomp: (
    <svg width="100%" height="60" viewBox="0 0 120 60" fill="none">
      <path d="M4 10 C40 16 80 44 116 52" stroke="#db5242" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" fill="none" />
      <path d="M4 50 C40 42 80 18 116 8" stroke="#302f9b" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="60" cy="30" r="3" fill="#6b3fa0" opacity="0.6" />
    </svg>
  ),
  lose: (
    <svg width="100%" height="60" viewBox="0 0 120 60" fill="none">
      <defs>
        <linearGradient id="gl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#302f9b" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#302f9b" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <path d="M4 10 C30 18 80 42 116 54" stroke="#302f9b" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M4 10 C30 18 80 42 116 54 L116 60 L4 60 Z" fill="url(#gl)" />
    </svg>
  ),
  maintain: (
    <svg width="100%" height="60" viewBox="0 0 120 60" fill="none">
      <path d="M4 30 Q20 24 32 30 Q52 40 72 30 Q92 20 116 30" stroke="#6b3fa0" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="4"   cy="30" r="2.5" fill="#6b3fa0" opacity="0.5" />
      <circle cx="116" cy="30" r="2.5" fill="#6b3fa0" opacity="0.5" />
    </svg>
  ),
};

const TILE_META = {
  muscle:   { title: 'Ganar músculo',   desc: 'Máx. síntesis proteica', multiplier: '×1.6' },
  recomp:   { title: 'Recomposición',   desc: 'Músculo ↑ · Grasa ↓',   multiplier: '×1.6' },
  lose:     { title: 'Perder peso',     desc: 'Saciedad + retención',   multiplier: '×1.6' },
  maintain: { title: 'Mantenerme',      desc: 'Optimizar lo actual',    multiplier: '×1.4' },
};

export function GoalTile({ id, active, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const meta = TILE_META[id];

  return (
    <button
      type="button"
      className={[
        styles.tile,
        active ? styles.tileActive : '',
        hovered ? styles.tileHovered : '',
      ].join(' ')}
      onClick={() => onSelect(id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className={styles.tileStat}>{meta.multiplier}</span>
      {SVG_PATHS[id]}
      <p className={styles.tileLabel}>{meta.title}</p>
      <p className={styles.tileDesc}>{meta.desc}</p>
    </button>
  );
}
