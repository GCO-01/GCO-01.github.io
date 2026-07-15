# Guía de contenido — Perfect Pal

Todo el contenido editable del sitio (textos, precios, imágenes, promos) vive
centralizado en `src/data/`. **Nunca hace falta tocar componentes (`src/components/`)
para cambiar contenido.**

Después de editar, correr `npm run build` (o `npm run dev` para ver los cambios en vivo).

## ¿Quiero cambiar…?

| Quiero cambiar…                                | Edito…                                  |
| ---------------------------------------------- | --------------------------------------- |
| Precio, precio tachado, stock, rating          | `src/data/config.js`                    |
| Sabores (nombre, descripción, foto)            | `src/data/flavors.js`                   |
| Titular/subtítulo/imagen del hero              | `src/data/hero.js`                      |
| Textos e imágenes de la sección de presentación| `src/data/presentation.js`              |
| Copy del producto (descripción, tarjeta huevo) | `src/data/product.js`                   |
| Barra de anuncio, código de descuento, timer   | `src/data/promo.js` ⚠️ ver aviso legal  |
| Textos de envío, garantía, footer, menú        | `src/data/site.js`                      |
| Reseñas de clientes                            | `src/data/reviews.js`                   |
| Preguntas frecuentes                           | `src/data/faqs.js`                      |
| Beneficios (secciones Benefits y producto)     | `src/data/benefits.js`                  |
| Lógica/textos de la calculadora                | `src/data/calculadora.js`               |
| Título/descripción/metas para compartir (OG)   | `sitio/index.html`                      |

## Imágenes

- Los archivos viven en `public/assets/` (usar formato **.webp**).
- Las **rutas y textos alternativos** se referencian desde los módulos de `src/data/`.
- Para reemplazar una imagen: o bien sobrescribís el archivo con el mismo nombre,
  o subís uno nuevo y actualizás la ruta en el módulo de `data/` correspondiente.

## Open Graph (tarjeta de WhatsApp/redes)

Las metas `og:*` están en `sitio/index.html`. `og:image` y `og:url` deben ser URLs
**absolutas** del dominio de producción (hoy: `https://gco-01.github.io/`).
Si el dominio cambia, actualizarlas ahí.

## ⚠️ Aviso legal sobre urgencia y descuentos

Los valores de `promo.js` y los derivados de precio (`config.js`) alimentan
timers, contadores de stock y precios tachados. En Perú (Indecopi, Código de
Protección al Consumidor) la publicidad con urgencia u ofertas **ficticias** es
sancionable. Mantener estos valores reales y verificables.
