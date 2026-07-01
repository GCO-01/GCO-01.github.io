import styles from './ProductPresentation.module.css';
import { RATING, REVIEW_COUNT } from '../../data/config';
import { Button } from '../ui/Button';

export function ProductPresentation() {
  function scrollToProduct() {
    document.getElementById('product-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section className={styles.sp} aria-labelledby="sp-headline">
      <div className={styles.inner}>
        {/* Visual elements — display:contents on desktop, flex container on mobile */}
        <div className={styles.visual}>
          <div className={styles.ellipse} aria-hidden="true">
            <img src="/assets/sp-ellipse.svg" alt="" width="511" height="531" loading="lazy" />
          </div>

          <div className={styles.bottles} aria-hidden="true">
            <img
              className={styles.bottleChoc}
              src="/assets/sp-bottle-chocolate.png"
              alt="Shake de proteína sabor Chocolate Criollo"
              loading="lazy"
            />
            <img
              className={styles.bottleMango}
              src="/assets/sp-bottle-mango.png"
              alt="Shake de proteína sabor Mango"
              loading="lazy"
            />
          </div>

          <div className={`${styles.badge} ${styles.badgeIngr}`} aria-label="Hecho con ingredientes naturales">
            <div className={styles.badgeIcons}>
              <div className={`${styles.iconWrap} ${styles.iconAlmond}`}>
                <img src="/assets/sp-icon-almond.png" alt="" loading="lazy" />
              </div>
              <div className={`${styles.iconWrap} ${styles.iconMango}`}>
                <img src="/assets/sp-icon-mango.png" alt="" loading="lazy" />
              </div>
            </div>
            <p className={styles.badgeText}>
              Hecho con<br /><strong>ingredientes naturales</strong>
            </p>
          </div>

          <div className={`${styles.badge} ${styles.badgeProt}`} aria-label="Proteína de clara de huevo">
            <div className={`${styles.iconWrap} ${styles.iconEgg}`}>
              <img src="/assets/sp-icon-egg.png" alt="" loading="lazy" />
            </div>
            <p className={`${styles.badgeText} ${styles.badgeTextProt}`}>
              Proteína de<br /><strong>clara de huevo</strong>
            </p>
          </div>
        </div>

        {/* Left copy */}
        <div className={styles.left}>
          <p className={styles.label}>
            {RATING} estrellas · {REVIEW_COUNT} clientes verificados
          </p>
          <div className={styles.content}>
            <div className={styles.text}>
              <h2 id="sp-headline" className={styles.headline}>
                La proteína <span className={styles.no}>NO</span> se negocia.
              </h2>
              <p className={styles.sub}>El sabor y los ingredientes tampoco.</p>
              <p className={styles.body}>
                Olvídate de los shakes con químicos y sabor artificial. Combinamos proteína de
                clara de huevo con fruta real — para que tengas los sabores que amas y la proteína
                que tu cuerpo necesita, sin compromisos.
              </p>
            </div>
            <div className={styles.ctaGroup}>
              <Button onClick={scrollToProduct} size="md">
                Pruébalo hoy
              </Button>
              <p className={`${styles.note} ${styles.noteDesktop}`}>
                ✓ Garantía de 30 días &nbsp;·&nbsp; Envío gratis a Lima &nbsp;·&nbsp; Pago 100% seguro
              </p>
              <p className={`${styles.note} ${styles.noteMobile}`}>
                ⚡ Solo quedan 12 unidades — Early Access
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
