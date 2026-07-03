import styles from './ProductPresentation.module.css';
import { RATING, REVIEW_COUNT, STOCK } from '../../data/config';
import { PRESENTATION } from '../../data/presentation';
import { GUARANTEE_NOTE } from '../../data/site';
import { URGENCY_NOTE_MOBILE, withStock } from '../../data/promo';
import { Button } from '../ui/Button';
import { scrollToId } from '../../lib/scroll';

export function ProductPresentation() {
  function scrollToProduct() {
    scrollToId('product-section');
  }

  const { images, badgeIngredients, badgeProtein, headline } = PRESENTATION;

  return (
    <section className={styles.sp} aria-labelledby="sp-headline">
      <div className={styles.inner}>
        {/* Visual elements — display:contents on desktop, flex container on mobile */}
        <div className={styles.visual}>
          <div className={styles.ellipse} aria-hidden="true">
            <img src={images.ellipse.src} alt="" width="511" height="531" loading="lazy" />
          </div>

          <div className={styles.bottles} aria-hidden="true">
            <img
              className={styles.bottleChoc}
              src={images.bottleChoc.src}
              alt={images.bottleChoc.alt}
              loading="lazy"
            />
            <img
              className={styles.bottleMango}
              src={images.bottleMango.src}
              alt={images.bottleMango.alt}
              loading="lazy"
            />
          </div>

          <div className={`${styles.badge} ${styles.badgeIngr}`} aria-label="Hecho con ingredientes naturales">
            <div className={styles.badgeIcons}>
              <div className={`${styles.iconWrap} ${styles.iconAlmond}`}>
                <img src={images.iconAlmond.src} alt="" loading="lazy" />
              </div>
              <div className={`${styles.iconWrap} ${styles.iconMango}`}>
                <img src={images.iconMango.src} alt="" loading="lazy" />
              </div>
            </div>
            <p className={styles.badgeText}>
              {badgeIngredients.line}<br /><strong>{badgeIngredients.strong}</strong>
            </p>
          </div>

          <div className={`${styles.badge} ${styles.badgeProt}`} aria-label="Proteína de clara de huevo">
            <div className={`${styles.iconWrap} ${styles.iconEgg}`}>
              <img src={images.iconEgg.src} alt="" loading="lazy" />
            </div>
            <p className={`${styles.badgeText} ${styles.badgeTextProt}`}>
              {badgeProtein.line}<br /><strong>{badgeProtein.strong}</strong>
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
                {headline.pre}<span className={styles.no}>{headline.highlight}</span>{headline.post}
              </h2>
              <p className={styles.sub}>{PRESENTATION.sub}</p>
              <p className={styles.body}>{PRESENTATION.body}</p>
            </div>
            <div className={styles.ctaGroup}>
              <Button onClick={scrollToProduct} size="md">
                {PRESENTATION.cta}
              </Button>
              <p className={`${styles.note} ${styles.noteDesktop}`}>{GUARANTEE_NOTE}</p>
              <p className={`${styles.note} ${styles.noteMobile}`}>
                {withStock(URGENCY_NOTE_MOBILE, STOCK)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
