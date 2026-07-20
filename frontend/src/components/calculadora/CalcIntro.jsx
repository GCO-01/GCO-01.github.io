import styles from './Calculadora.module.css';

export function CalcIntro({ onStart }) {
  return (
    <div className={styles.introWrap}>
      <p className={styles.eyebrow}>PROTOCOLO SHAKE</p>
      <h1 className={styles.introTitle}>
        ¿Cuánta proteína<br /><span>necesitas realmente?</span>
      </h1>

      {/* T0.4 — hook con el dato real de consumo en Perú (ELANS) */}
      <div className={styles.introHook}>
        <p className={styles.introHookText}>
          El peruano promedio consume <strong>~1.1–1.2 g/kg</strong> de proteína al día:
          el borde inferior del rango óptimo, sin margen.
        </p>
        <p className={styles.introHookCite}>ELANS — Herrera-Cuenca et al., Nutrients 2023</p>
      </div>

      <p className={styles.introSub}>
        3 preguntas. Tu requerimiento exacto. Un plan diseñado para tu cuerpo y tu ritmo.
      </p>
      <button type="button" className={styles.introCta} onClick={onStart}>
        CALCULAR MI DOSIS →
      </button>
    </div>
  );
}
