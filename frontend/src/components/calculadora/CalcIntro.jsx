import styles from './Calculadora.module.css';

export function CalcIntro({ onStart }) {
  return (
    <div className={styles.calcStage}>
      <div className={`${styles.calcScroll} ${styles.calcIntroScroll}`}>
        <div className={styles.calcHead}>
          <span className={styles.calcIntroKicker}>PROTOCOLO SHAKE</span>
          <h1 className={styles.calcIntroTitle}>
            ¿Cuánta proteína<br /><span>necesitas realmente?</span>
          </h1>
        </div>

        {/* T0.4 — hook con el dato real de consumo en Perú (ELANS) */}
        <div className={styles.calcCard}>
          <div className={styles.calcIntroHook}>
            <p className={styles.calcIntroHookText}>
              El peruano promedio consume <strong>~1.1–1.2 g/kg</strong> de proteína al día:
              el borde inferior del rango óptimo, sin margen.
            </p>
            <p className={styles.calcIntroHookCite}>ELANS — Herrera-Cuenca et al., Nutrients 2023</p>
          </div>
        </div>

        <p className={styles.calcIntroSub}>
          3 preguntas. Tu requerimiento exacto. Un plan diseñado para tu cuerpo y tu ritmo.
        </p>

        <button type="button" className={styles.calcCta} onClick={onStart}>
          CALCULAR MI DOSIS <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
