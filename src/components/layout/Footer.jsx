import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { BRAND, NAV_LINKS, FOOTER_COPY } from '../../data/site';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.brand}>{BRAND}</span>
      <nav className={styles.links} aria-label="Links del footer">
        {NAV_LINKS.map(({ label, href }) => (
          <Link key={label} to={href} className={styles.link}>{label}</Link>
        ))}
      </nav>
      <span className={styles.copy}>{FOOTER_COPY}</span>
    </footer>
  );
}
