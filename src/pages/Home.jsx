import { Hero } from '../components/sections/Hero';
import { Benefits } from '../components/sections/Benefits';
import { ProductPresentation } from '../components/sections/ProductPresentation';
import { ProductSection } from '../components/sections/ProductSection';
import { Reviews } from '../components/sections/Reviews';

function scrollToProduct() {
  document.getElementById('product-section')?.scrollIntoView({ behavior: 'smooth' });
}

export function Home() {
  return (
    <>
      <Hero />
      <Benefits />
      <ProductPresentation />
      <ProductSection />
      <Reviews onScrollToProduct={scrollToProduct} />
    </>
  );
}
