import { Link } from 'react-router-dom';
import styles from './MobileDrawer.module.css';
import { NAV_LINKS } from '../../data/config';

export function MobileDrawer({ isOpen, onClose }) {
  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.visible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <nav
        className={`${styles.drawer} ${isOpen ? styles.open : ''}`}
        aria-label="Menú de navegación"
        aria-hidden={!isOpen}
      >
        <div className={styles.nav}>
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={label} to={href} className={styles.link} onClick={onClose}>
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
