// ─── Contenido de la sección de presentación del producto ────────────

export const PRESENTATION = {
  images: {
    ellipse: { src: '/assets/sp-ellipse.svg', alt: '' },
    bottleChoc: {
      src: '/assets/sp-bottle-chocolate.webp',
      alt: 'Shake de proteína sabor Chocolate Criollo',
    },
    bottleMango: { src: '/assets/sp-bottle-mango.webp', alt: 'Shake de proteína sabor Mango' },
    iconAlmond: { src: '/assets/sp-icon-almond.webp', alt: '' },
    iconMango: { src: '/assets/sp-icon-mango.webp', alt: '' },
    iconEgg: { src: '/assets/sp-icon-egg.webp', alt: '' },
  },
  badgeIngredients: { line: 'Hecho con', strong: 'ingredientes naturales' },
  badgeProtein: { line: 'Proteína de', strong: 'clara de huevo' },
  // El "NO" se resalta con estilo propio en el componente.
  headline: { pre: 'La proteína ', highlight: 'NO', post: ' se negocia.' },
  sub: 'El sabor y los ingredientes tampoco.',
  body:
    'Olvídate de los shakes con químicos y sabor artificial. Combinamos proteína de ' +
    'clara de huevo con fruta real — para que tengas los sabores que amas y la proteína ' +
    'que tu cuerpo necesita, sin compromisos.',
  cta: 'Pruébalo hoy',
};
