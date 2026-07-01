const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

export function StarRating({
  rating = 5,
  total = 5,
  size = 14,
  filled = '#db5242',
  empty = 'rgba(255,255,255,0.15)',
}) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: total }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < rating ? filled : empty}>
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}
