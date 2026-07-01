import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { NAV_LINKS } from '../../data/config';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.brand}>perfect pal</span>
      <nav className={styles.links} aria-label="Links del footer">
        {NAV_LINKS.map(({ label, href }) => (
          <Link key={label} to={href} className={styles.link}>{label}</Link>
        ))}
      </nav>
      <span className={styles.copy}>© 2025 perfect pal · Hecho con ❤️ en Lima, Perú</span>
    </footer>
  );
}
