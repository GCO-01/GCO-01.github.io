import { Link } from 'react-router-dom';
import styles from './Hero.module.css';
import { RATING, REVIEW_COUNT } from '../../data/config';

export function Hero() {
  return (
    <section className={styles.section} aria-labelledby="hero-title">
      <div className={styles.inner}>
        <div className={styles.media} aria-label="Imagen principal del producto">
          <figure className={styles.eggFrame}>
            <img
              className={styles.eggImage}
              src="/assets/huevito-hero.png"
              alt="Huevo entero marrón sobre fondo claro"
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
            <span>Lima, Perú</span>
          </span>
          <h1 id="hero-title" className={styles.title}>El huevo fue<br />primero</h1>
          <p className={styles.subtitle}>Deja la leche para las gallinas.</p>
          <Link className={styles.cta} to="#product-section">Pruébalo hoy →</Link>
          <p className={styles.trust} aria-label="Garantías de compra">
            Envío gratis a Lima
            <span className={styles.trustDot} aria-hidden="true">·</span>
            Garantía 30 días
            <span className={styles.trustDot} aria-hidden="true">·</span>
            Pago seguro
          </p>
        </div>
      </div>
    </section>
  );
}
