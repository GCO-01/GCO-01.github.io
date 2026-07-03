import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import { MobileDrawer } from './MobileDrawer';
import { useCart } from '../../hooks/useCart';
import { BRAND, NAV_LINKS } from '../../data/site';
import { CartIcon, MenuIcon } from '../ui/icons';

export function Header() {
  const { count, setIsOpen } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hamburgerRef = useRef(null);

  function closeDrawer() {
    setDrawerOpen(false);
    hamburgerRef.current?.focus();
  }

  useEffect(() => {
    if (!drawerOpen) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') closeDrawer();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.navSlot}>
          <nav className={styles.nav} aria-label="Navegación principal">
            {NAV_LINKS.slice(0, 3).map(({ label, href }) => (
              <Link key={label} to={href} className={styles.navLink}>{label}</Link>
            ))}
          </nav>
          <button
            ref={hamburgerRef}
            className={styles.hamburger}
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={drawerOpen}
          >
            <MenuIcon />
          </button>
        </div>

        <Link to="/" className={styles.brand} aria-label="Perfect Pal, inicio">
          {BRAND}
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
        </div>
      </header>
      <MobileDrawer isOpen={drawerOpen} onClose={closeDrawer} />
    </>
  );
}
