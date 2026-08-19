import styles from './BatchLanding.module.css';

// Wrapper de split-screen para desktop: panel izquierdo placeholder (foto a
// futuro) + panel derecho con el contenido del formulario. En mobile el
// panel izquierdo no se renderiza y el derecho ocupa todo el ancho.
export function SplitLayout({ children }) {
  return (
    <div className={styles.splitGrid}>
      <div className={styles.leftPanel} aria-hidden="true">
        <span className={styles.wordmark}>VAGGO</span>
      </div>
      <div className={styles.rightPanel}>{children}</div>
    </div>
  );
}
