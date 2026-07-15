import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './hooks/useCart';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { FloatingCartFAB } from './components/cart/FloatingCartFAB';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { scrollToId } from './lib/scroll';
import './styles/global.css';
import './styles/animations.css';

// La calculadora (~31% del CSS del proyecto) solo se descarga al visitarla.
const Calculadora = lazy(() =>
  import('./pages/Calculadora').then(m => ({ default: m.Calculadora }))
);

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      scrollToId(hash.slice(1));
    } else {
      // Al navegar entre rutas, abrir la página arriba (sin animación:
      // es una página nueva, no un desplazamiento dentro de la actual).
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollManager />
        <Header />
        <main>
          <ErrorBoundary>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/calculadora" element={<Calculadora />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
        <CartDrawer />
        <FloatingCartFAB />
      </CartProvider>
    </BrowserRouter>
  );
}
