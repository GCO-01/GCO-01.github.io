import styles from './Calculadora.module.css';

export function CalcIntro({ onStart }) {
  return (
    <div className={styles.introWrap}>
      <p className={styles.eyebrow}>PROTOCOLO SHAKE</p>
      <h1 className={styles.introTitle}>
        ¿Cuánta proteína<br /><span>necesitas realmente?</span>
      </h1>
      <p className={styles.introSub}>
        3 preguntas. Tu requerimiento exacto. Un plan diseñado para tu cuerpo y tu ritmo.
      </p>
      <button type="button" className={styles.introCta} onClick={onStart}>
        INICIAR PROTOCOLO
      </button>
    </div>
  );
}
