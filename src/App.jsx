import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './hooks/useCart';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/sections/ProductSection/CartDrawer';
import { FloatingCartFAB } from './components/ui/FloatingCartFAB';
import { Home } from './pages/Home';
import { Calculadora } from './pages/Calculadora';
import './styles/global.css';
import './styles/animations.css';

function ScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollToHash />
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculadora" element={<Calculadora />} />
          </Routes>
        </main>
        <Footer />
        <CartDrawer />
        <FloatingCartFAB />
      </CartProvider>
    </BrowserRouter>
  );
}
