import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import { MobileDrawer } from './MobileDrawer';
import { useCart } from '../../hooks/useCart';
import { NAV_LINKS } from '../../data/config';

const CartIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M3 12h18M3 6h18M3 18h18"/>
  </svg>
);

export function Header() {
  const { count, setIsOpen } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <nav className={styles.nav} aria-label="Navegación principal">
          {NAV_LINKS.slice(0, 3).map(({ label, href }) => (
            <Link key={label} to={href} className={styles.navLink}>{label}</Link>
          ))}
        </nav>

        <Link to="/" className={styles.brand} aria-label="Perfect Pal, inicio">
          perfect pal
        </Link>

        <div className={styles.actions} aria-label="Acciones rápidas">
          <button
            className={styles.iconBtn}
            onClick={() => setIsOpen(true)}
            aria-label={`Carrito${count > 0 ? `, ${count} producto${count > 1 ? 's' : ''}` : ''}`}
          >
            <CartIcon />
            {count > 0 && <span className={styles.cartBadge} aria-hidden="true">{count}</span>}
          </button>
          <button
            className={styles.hamburger}
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={drawerOpen}
          >
            <MenuIcon />
          </button>
        </div>
      </header>
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
