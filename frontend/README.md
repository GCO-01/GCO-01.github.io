# Perfect Pal — landing e-commerce

Landing page de Perfect Pal: shakes de proteína de clara de huevo (Lima, Perú).
SPA en React 18 + Vite + CSS Modules, servida como estático (GitHub Pages en
producción; alternativamente nginx vía `backend/deploy/Dockerfile.frontend`).

## Comandos

```bash
npm install      # dependencias (Node >= 20, ver .nvmrc)
npm run dev      # dev server con HMR
npm run build    # build de producción en dist/
npm test         # tests (vitest)
npm run lint     # eslint
npm run format   # prettier
```

## ¿Querés cambiar textos, precios o imágenes?

**No hace falta tocar componentes.** Todo el contenido editable vive en
`src/data/`. La guía completa está en **[CONTENIDO.md](./CONTENIDO.md)**.

## Estructura

```text
src/
├── data/          ← contenido editable (precios, copy, imágenes, promos)
├── components/
│   ├── layout/    ← Header, Footer, MobileDrawer
│   ├── sections/  ← secciones de la home (Hero, Benefits, ProductSection…)
│   ├── cart/      ← CartDrawer + FloatingCartFAB (globales, montados en App)
│   ├── calculadora/ ← wizard de la calculadora de proteína
│   └── ui/        ← piezas reutilizables (Button, icons, CountBadge, QtySelector…)
├── hooks/         ← useCart (estado del carrito), useCountdown, useIsMobile…
├── lib/           ← utilidades (scroll con prefers-reduced-motion)
├── pages/         ← Home, Calculadora (lazy), NotFound
└── styles/        ← tokens.css (colores, z-index, tipografías), global, animaciones
```

## Notas de arquitectura

- **Precios en céntimos enteros** (`data/product.js`); `formatMoney` convierte al mostrar.
- **Carrito**: Context dividido (estado/acciones) + persistencia en `localStorage` (`pp_cart_v1`) con validación al leer. `getCartSummary()` deja el pedido serializado listo para conectar WhatsApp o una pasarela.
- **Seguridad**: headers (CSP, nosniff, X-Frame-Options) en `backend/deploy/nginx.conf`.
- `/calculadora` se carga con `React.lazy` — no pesa en la landing.
