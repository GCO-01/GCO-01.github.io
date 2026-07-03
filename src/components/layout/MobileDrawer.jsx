import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './MobileDrawer.module.css';
import { NAV_LINKS } from '../../data/site';

export function MobileDrawer({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

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
        inert={!isOpen ? '' : undefined}
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
