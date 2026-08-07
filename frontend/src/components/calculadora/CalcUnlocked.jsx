import { useState, useRef, useLayoutEffect } from 'react';
import { MealPlan } from './MealPlan';
import { useCartActions } from '../../hooks/useCart';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { PRICE, OLD_PRICE, STOCK, formatMoney } from '../../data/config';
import { DISCOUNT_CODE } from '../../data/promo';
import styles from './Calculadora.module.css';

export function CalcUnlocked({ user, result, plan }) {
  const { addItem } = useCartActions();
  const reduce = usePrefersReducedMotion();
  const scrollRef = useRef(null);
  const heroRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(DISCOUNT_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Montaje "vivo" (coherente con CalcResult): sheen del banner + entrada
  // escalonada de tarjetas. La animación es ADITIVA — sin JS o con
  // reduced-motion las tarjetas se ven completas.
  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (hero) hero.classList.add(styles.calcPlay); // sheen (el @media lo ignora bajo reduced-motion)

    const scroll = scrollRef.current;
    if (!scroll || reduce) return undefined;

    scroll.classList.add(styles.calcAnim);
    const cards = scroll.querySelectorAll('[data-card]');
    void scroll.offsetWidth; // fuerza reflow para comprometer el estado oculto

    const timers = [];
    cards.forEach((c, i) => timers.push(window.setTimeout(() => c.classList.add(styles.calcIn), 90 * i)));
    return () => timers.forEach(clearTimeout);
  }, [reduce]);

  return (
    <div className={styles.calcStage}>
      <div ref={scrollRef} className={`${styles.calcScroll} ${styles.calcUnlockedScroll}`}>
        <div className={styles.calcHead}>
          <span className={styles.calcHeadKicker}>Plan desbloqueado</span>
          <h2 className={styles.calcHeadTitle}>Tu protocolo está listo</h2>
        </div>

        {/* Banner — protocolo activo */}
        <div ref={heroRef} data-card className={`${styles.calcCard} ${styles.calcHeroCard}`}>
          <p className={styles.calcCardLbl}>Protocolo activo</p>
          <p className={styles.calcUnlockGrams}>
            {result.grams}<span>g/día</span>
          </p>
          {/* No afirmar envío por email: hoy no existe backend que lo envíe */}
          <p className={styles.calcUnlockSub}>
            {user.name} · Tu plan y código están listos aquí abajo
          </p>
        </div>

        {/* Código de acceso + precios */}
        <div data-card className={styles.calcCard}>
          <p className={styles.calcCardLbl}>Código de acceso Early Access</p>
          <div className={styles.calcCodeRow}>
            <div className={styles.calcCodeBox}>{DISCOUNT_CODE}</div>
            <button
              type="button"
              className={`${styles.calcCopyBtn} ${copied ? styles.calcCopyBtnDone : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✓ COPIADO' : 'COPIAR'}
            </button>
          </div>
          <div className={styles.calcPriceRow}>
            <span className={styles.calcOldPrice}>{formatMoney(OLD_PRICE)}</span>
            <span className={styles.calcNewPrice}>{formatMoney(PRICE)}</span>
            <span className={styles.calcStockBadge}>{STOCK} disponibles</span>
          </div>
        </div>

        {/* Plan de comidas (card propia) */}
        <MealPlan meals={plan.meals} />

        {/* CTA final — mismo relleno de acento del sistema */}
        <button
          type="button"
          className={`${styles.calcCta} ${styles.calcCtaBlock}`}
          onClick={() => addItem('chocolate', 1)}
        >
          AGREGAR SHAKE AL CARRITO — 50% OFF
        </button>
      </div>
    </div>
  );
}
