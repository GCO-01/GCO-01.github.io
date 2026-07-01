import { useRef, useState, useEffect } from 'react';
import styles from './Reviews.module.css';
import { REVIEWS } from '../../data/reviews';
import { RATING, REVIEW_COUNT } from '../../data/config';
import { StarRating } from '../ui/StarRating';
import { Button } from '../ui/Button';
import { useIsMobile } from '../../hooks/useIsMobile';

function ReviewCard({ review }) {
  return (
    <article className={styles.card}>
      <StarRating rating={review.rating} size={14} filled="#db5242" empty="rgba(255,255,255,0.15)" />
      <p className={styles.cardText}>"{review.text}"</p>
      <div className={styles.cardFooter}>
        <div>
          <div className={styles.cardName}>{review.name}</div>
          <div className={styles.cardLocation}>{review.location}</div>
        </div>
        <span className={styles.cardDate}>{review.date}</span>
      </div>
    </article>
  );
}

function DesktopReviews({ onScrollToProduct }) {
  return (
    <section id="reviews" className={styles.section} aria-labelledby="reviews-title">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Reseñas verificadas</span>
            <h2 id="reviews-title" className={styles.title}>Lo que dicen los clientes</h2>
          </div>
          <div className={styles.aggregate}>
            <div className={styles.aggregateNum}>{RATING}</div>
            <div>
              <StarRating rating={5} size={18} filled="#db5242" empty="rgba(255,255,255,0.15)" />
              <div className={styles.aggregateSub}>de {REVIEW_COUNT} reseñas</div>
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          {REVIEWS.map((r, i) => <ReviewCard key={i} review={r} />)}
        </div>

        <div className={styles.cta}>
          <p className={styles.ctaQuote}>
            La proteína NO se negocia. El sabor y los ingredientes tampoco.
          </p>
          <Button onClick={onScrollToProduct} size="lg">
            Quiero mi 6-pack ahora
          </Button>
        </div>
      </div>
    </section>
  );
}

function MobileReviews({ onScrollToProduct }) {
  const trackRef = useRef(null);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (prefersReducedMotion.current) return;
    let idx = 0;
    const id = setInterval(() => {
      if (pausedRef.current || !trackRef.current) return;
      idx = (idx + 1) % REVIEWS.length;
      const w = trackRef.current.offsetWidth;
      trackRef.current.scrollTo({ left: idx * w, behavior: 'smooth' });
      setActiveIdx(idx);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const w = track.offsetWidth;
      if (w) setActiveIdx(Math.round(track.scrollLeft / w));
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  function pauseAutoplay() {
    pausedRef.current = true;
    clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => { pausedRef.current = false; }, 5000);
  }

  function scrollToIdx(i) {
    pauseAutoplay();
    setActiveIdx(i);
    const w = trackRef.current?.offsetWidth ?? 0;
    trackRef.current?.scrollTo({ left: i * w, behavior: 'smooth' });
  }

  return (
    <section id="reviews" className={`${styles.section} ${styles.sectionMobile}`} aria-labelledby="reviews-title-mobile">
      <div className={styles.mobileHeader}>
        <h2 id="reviews-title-mobile" className={styles.title}>Lo que dicen<br />los clientes</h2>
        <div className={styles.aggregate}>
          <div className={styles.aggregateNum}>{RATING}</div>
          <div>
            <StarRating rating={5} size={12} filled="#db5242" empty="rgba(255,255,255,0.15)" />
            <div className={styles.aggregateSub}>de {REVIEW_COUNT} reseñas</div>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        className={styles.carousel}
        onTouchStart={pauseAutoplay}
        onPointerDown={pauseAutoplay}
        role="region"
        aria-label="Carrusel de reseñas"
      >
        {REVIEWS.map((r, i) => (
          <div key={i} className={styles.slide}>
            <ReviewCard review={r} />
          </div>
        ))}
      </div>

      <div className={styles.dots} role="tablist" aria-label="Reseñas">
        {REVIEWS.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIdx(i)}
            className={`${styles.dot} ${activeIdx === i ? styles.dotActive : ''}`}
            role="tab"
            aria-selected={activeIdx === i}
            aria-label={`Reseña ${i + 1}`}
          />
        ))}
      </div>

      <p className={styles.ctaQuote} style={{ textAlign: 'center', marginTop: 28 }}>
        La proteína NO se negocia. El sabor y los ingredientes tampoco.
      </p>
      <Button fullWidth onClick={onScrollToProduct}>
        Quiero mi 6-pack ahora
      </Button>
    </section>
  );
}

export function Reviews({ onScrollToProduct }) {
  const isMobile = useIsMobile(900);
  return isMobile
    ? <MobileReviews onScrollToProduct={onScrollToProduct} />
    : <DesktopReviews onScrollToProduct={onScrollToProduct} />;
}
