// ─── Producto ─────────────────────────────────────────────────────────
// Fuente de verdad del producto. Los precios van en CÉNTIMOS enteros
// (S/ 2,299.00 → 229900) para evitar errores de redondeo con floats;
// formatMoney (data/config.js) hace la división al mostrar.
// Ver sitio/CONTENIDO.md para la guía de edición.

import { FLAVORS } from './flavors';

export const PRODUCT = {
  id: 'sixpack-clara-huevo',
  name: 'Six Pack Perfect Pal',
  packSize: 6,
  proteinG: 30,
  kcal: 189,
  priceCents: 229900,
  oldPriceCents: 417999,
  stock: 12,
  rating: 4.9,
  reviewCount: 237,
  flavors: FLAVORS,
};

export const PRODUCT_COPY = {
  packLabel: '6 Pack',
  priceDesc: 'Six pack de shakes con proteína de clara de huevo e ingredientes naturales.',
  eggCard: {
    img: { src: '/assets/huevito.webp', alt: '' },
    title: 'Proteína de clara de huevo',
    body: 'Limpia, sin lactosa y con perfil completo de aminoácidos.',
  },
};
