import { Link } from 'react-router-dom';
import styles from './Hero.module.css';
import { RATING, REVIEW_COUNT } from '../../data/config';
import { HERO } from '../../data/hero';
import { HERO_TRUST } from '../../data/site';

export function Hero() {
  return (
    <section className={styles.section} aria-labelledby="hero-title">
      <div className={styles.inner}>
        <div className={styles.media} aria-label="Imagen principal del producto">
          <figure className={styles.eggFrame}>
            <img
              className={styles.eggImage}
              src={HERO.image.src}
              alt={HERO.image.alt}
              width={HERO.image.width}
              height={HERO.image.height}
              loading="eager"
              decoding="async"
            />
          </figure>
        </div>

        <div className={styles.content}>
          <span className={styles.proof} aria-label="Calificación de clientes">
            <span className={styles.proofStars} aria-hidden="true">★★★★★</span>
            <span>{RATING} de {REVIEW_COUNT} reseñas</span>
            <span className={styles.proofDivider} aria-hidden="true" />
            <span>{HERO.proofLocation}</span>
          </span>
          <h1 id="hero-title" className={styles.title}>
            {HERO.titleLines[0]}<br />{HERO.titleLines[1]}
          </h1>
          <p className={styles.subtitle}>{HERO.subtitle}</p>
          <Link className={styles.cta} to="#product-section">{HERO.cta}</Link>
          <p className={styles.trust} aria-label="Garantías de compra">
            {HERO_TRUST[0]}
            <span className={styles.trustDot} aria-hidden="true">·</span>
            {HERO_TRUST[1]}
            <span className={styles.trustDot} aria-hidden="true">·</span>
            {HERO_TRUST[2]}
          </p>
        </div>
      </div>
    </section>
  );
}
