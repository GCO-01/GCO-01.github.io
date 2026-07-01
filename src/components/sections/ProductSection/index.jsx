import { useState } from 'react';
import styles from './ProductSection.module.css';
import { useIntersection } from '../../../hooks/useIntersection';
import { useCountdown, padTime } from '../../../hooks/useCountdown';
import { useCart } from '../../../hooks/useCart';
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
import { BottomBar } from './BottomBar';
import { FAQ } from './FAQ';
import { FLAVORS } from '../../../data/flavors';
import { PRODUCT_BENEFITS } from '../../../data/benefits';
import { PRICE, OLD_PRICE, RATING, REVIEW_COUNT, formatMoney } from '../../../data/config';

const ANNOUNCEMENT =
  '⚡ Early Access — 50% de descuento en primera compra · Envío gratis a Lima Metropolitana · Solo 12 unidades';

export function ProductSection() {
  const isMobile = useIsMobile(900);
  const { addItem, isOpen } = useCart();
  const [flavor, setFlavor] = useState('combinado');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [ctaRef, ctaVisible] = useIntersection({ threshold: 0.5 });
  const timeLeft = useCountdown();

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
            <Badge variant="neutral">6 Pack · 30G</Badge>
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
              <Badge variant="danger">Ahorras S/ 1,880 · 45%</Badge>
            </div>
            <p className={styles.priceDesc}>
              Six pack de shakes con proteína de clara de huevo e ingredientes naturales.
            </p>
          </div>

          <div className={styles.urgency}>
            <span>⚡ Solo quedan <strong>12 unidades</strong></span>
            <div className={styles.timer}>
              <span>Oferta termina en</span>
              <div className={styles.clock}>
                {padTime(timeLeft.h)}:{padTime(timeLeft.m)}:{padTime(timeLeft.s)}
              </div>
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
            <p className={styles.ctaNote}>
              ⚡ Solo quedan 12 unidades · Early Access · Envío gratis a Lima
            </p>
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

          {/* <div className={styles.proofStrip}>
            {[['🥛', 'Sin lactosa'], ['🌿', 'Natural'], ['✓', 'Sin azúcar']].map(([icon, label]) => (
              <div key={label} className={styles.proofItem}>
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div> */}

          <div className={styles.huevito}>
            <img src="/assets/huevito.png" alt="" loading="lazy" />
            <div>
              <strong>Proteína de clara de huevo</strong>
              <p>Limpia, sin lactosa y con perfil completo de aminoácidos.</p>
            </div>
          </div>

          <FAQ />
        </div>
      </div>

      {isMobile && (
        <BottomBar
          flavor={flavor}
          qty={qty}
          visible={!ctaVisible && !isOpen}
          onAdd={handleAdd}
        />
      )}

    </section>
  );
}
