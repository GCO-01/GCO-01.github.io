import styles from './Benefits.module.css';
import { BENEFITS } from '../../data/benefits';

export function Benefits() {
  return (
    <section className={styles.section} aria-label="Beneficios del producto">
      <ul className={styles.list}>
        {BENEFITS.map(text => (
          <li key={text} className={styles.item}>
            <span className={styles.icon} aria-hidden="true">✓</span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
