import { useState } from 'react';
import styles from './ProductSection.module.css';
import { useIntersection } from '../../../hooks/useIntersection';
import { useCartActions } from '../../../hooks/useCart';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { AnnouncementBar } from '../../ui/AnnouncementBar';
import { TrustStrip } from '../../ui/TrustStrip';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { StarRating } from '../../ui/StarRating';
import { ProductGallery } from './ProductGallery';
import { FlavorSelector } from './FlavorSelector';
import { QtySelector } from './QtySelector';
import { StickyBar } from './StickyBar';
import { CountdownClock } from './CountdownClock';
import { FAQ } from './FAQ';
import { FLAVORS } from '../../../data/flavors';
import { PRODUCT_BENEFITS } from '../../../data/benefits';
import {
  PRICE,
  OLD_PRICE,
  STOCK,
  RATING,
  REVIEW_COUNT,
  SAVINGS,
  DISCOUNT_PCT,
  formatMoney,
  formatMoneyRound,
} from '../../../data/config';
import { ANNOUNCEMENT, URGENCY_NOTE, withStock } from '../../../data/promo';
import { PRODUCT, PRODUCT_COPY } from '../../../data/product';

export function ProductSection() {
  const isMobile = useIsMobile(900);
  const { addItem } = useCartActions();
  const [flavor, setFlavor] = useState('combinado');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [ctaRef, ctaVisible] = useIntersection({ threshold: 0.5 });

  const cur = FLAVORS.find(f => f.id === flavor) ?? FLAVORS[0];

  function handleAdd() {
    addItem(flavor, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2400);
  }

  return (
    <section id="product-section" className={styles.root}>
      {!isMobile && (
        <StickyBar
          visible={!ctaVisible}
          flavor={flavor}
          qty={qty}
          added={added}
          onAdd={handleAdd}
        />
      )}

      <AnnouncementBar text={ANNOUNCEMENT} />

      <div className={styles.layout}>
        {/* LEFT — Gallery */}
        <ProductGallery selectedFlavor={flavor} onFlavorSelect={setFlavor} />

        {/* RIGHT — Purchase panel */}
        <div className={styles.panel}>
          <div className={styles.badges}>
            <Badge variant="brand">Early Access</Badge>
            <Badge variant="neutral">{PRODUCT_COPY.packLabel} · {PRODUCT.proteinG}G</Badge>
          </div>

          <h1 className={styles.productTitle}>{cur.label}</h1>

          <div className={styles.ratingRow}>
            <StarRating rating={5} size={14} filled="#db5242" empty="#e4e4ea" />
            <span className={styles.ratingNum}>{RATING}</span>
            <a href="#reviews" className={styles.ratingLink}>{REVIEW_COUNT} reseñas verificadas</a>
          </div>

          <div>
            <div className={styles.priceRow}>
              <span className={styles.priceOld}>{formatMoney(OLD_PRICE)}</span>
              <span className={styles.priceCurrent}>{formatMoney(PRICE)}</span>
              <Badge variant="danger">Ahorras {formatMoneyRound(SAVINGS)} · {DISCOUNT_PCT}%</Badge>
            </div>
            <p className={styles.priceDesc}>{PRODUCT_COPY.priceDesc}</p>
          </div>

          <div className={styles.urgency}>
            <span>⚡ Solo quedan <strong>{STOCK} unidades</strong></span>
            <div className={styles.timer}>
              <span>Oferta termina en</span>
              <CountdownClock className={styles.clock} />
            </div>
          </div>

          <FlavorSelector selected={flavor} onSelect={setFlavor} />

          <div ref={ctaRef} className={styles.ctaSection}>
            <span className={styles.label}>Cantidad</span>
            <div className={styles.ctaRow}>
              <QtySelector value={qty} onChange={setQty} />
              <Button fullWidth confirmed={added} onClick={handleAdd} size="lg">
                {added ? '¡Agregado! ✓' : `Agregar — ${formatMoney(PRICE * qty)}`}
              </Button>
            </div>
            <p className={styles.ctaNote}>{withStock(URGENCY_NOTE, STOCK)}</p>
          </div>

          <TrustStrip />

          <div className={styles.benefitsGrid}>
            {PRODUCT_BENEFITS.map(b => (
              <div key={b} className={styles.benefitItem}>
                <div className={styles.benefitCheck}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span>{b}</span>
              </div>
            ))}
          </div>

          <div className={styles.huevito}>
            <img src={PRODUCT_COPY.eggCard.img.src} alt={PRODUCT_COPY.eggCard.img.alt} loading="lazy" />
            <div>
              <strong>{PRODUCT_COPY.eggCard.title}</strong>
              <p>{PRODUCT_COPY.eggCard.body}</p>
            </div>
          </div>

          <FAQ />
        </div>
      </div>

    </section>
  );
}
