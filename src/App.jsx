import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './hooks/useCart';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/sections/ProductSection/CartDrawer';
import { FloatingCartFAB } from './components/ui/FloatingCartFAB';
import { Home } from './pages/Home';
import { Calculadora } from './pages/Calculadora';
import './styles/global.css';
import './styles/animations.css';

export function App() {
  return (
    <BrowserRouter>
      <CartProvider>
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
