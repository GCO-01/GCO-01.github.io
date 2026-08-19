// Placeholder — silueta geométrica simple. Reemplazar por el asset final
// de la mascota VAGGO cuando esté disponible.
const GREEN = '#1B2E22';
const ORANGE = '#E8531C';

export function MascotSilhouette({ variant = 'solidGreen', size = 64 }) {
  const isOutline = variant.startsWith('outline');
  const color = variant.endsWith('Orange') ? ORANGE : GREEN;
  const fillProps = isOutline
    ? { fill: 'none', stroke: color, strokeWidth: 2 }
    : { fill: color, stroke: 'none' };

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="14" r="8" {...fillProps} />
      <path d="M32 22 L32 40 M32 28 L18 36 M32 28 L46 36 M32 40 L20 58 M32 40 L44 58" {...fillProps} />
    </svg>
  );
}
