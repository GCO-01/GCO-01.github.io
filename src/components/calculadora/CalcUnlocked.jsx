import { useState } from 'react';
import { Button } from '../ui/Button';
import { MealPlan } from './MealPlan';
import { useCart } from '../../hooks/useCart';
import { PRICE, OLD_PRICE, STOCK, formatMoney } from '../../data/config';
import styles from './Calculadora.module.css';

const DISCOUNT_CODE = 'SHAKE50';

export function CalcUnlocked({ user, result, plan }) {
  const { addItem } = useCart();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(DISCOUNT_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={styles.unlockedWrap}>
      <div className={styles.confirmBanner}>
        <p className={styles.confirmTitle}>
          PROTOCOLO ACTIVO — {result.grams} g/día
        </p>
        <p className={styles.confirmSub}>
          {user.name} · Plan enviado a {user.email}
        </p>
      </div>

      <div className={styles.discountCard}>
        <p className={styles.discountTitle}>Código de acceso Early Access</p>
        <div className={styles.codeRow}>
          <div className={styles.codeBox}>{DISCOUNT_CODE}</div>
          <button
            type="button"
            className={`${styles.copyBtn} ${copied ? styles.copyBtnCopied : ''}`}
            onClick={handleCopy}
          >
            {copied ? '✓ COPIADO' : 'COPIAR'}
          </button>
        </div>
        <div className={styles.priceRow}>
          <span className={styles.oldPrice}>{formatMoney(OLD_PRICE)}</span>
          <span className={styles.newPrice}>{formatMoney(PRICE)}</span>
          <span className={styles.stockBadge}>{STOCK} disponibles</span>
        </div>
      </div>

      <MealPlan meals={plan.meals} />

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => addItem('chocolate', 1)}
      >
        AGREGAR SHAKE AL CARRITO — 50% OFF
      </Button>
    </div>
  );
}
