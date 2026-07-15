# Merge Product Page React App into index.html

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the basic React app in `sitio/index.html` with the full mobile+desktop React app from `sitio/Product Page.html`, while keeping index.html's static hero, benefits, sp, and footer sections untouched.

**Architecture:** Single file edit — only `sitio/index.html` is modified. The babel script from Product Page.html is dropped in verbatim except for one removal: the `footer` JSX const inside `App` and its render calls (index.html already has a static `<footer class="site-footer">`). The window.PP_* data script is inserted before the babel block. Missing CSS keyframes and utility classes are added to the inline `<style>` in `<head>`.

**Tech Stack:** Vanilla HTML, inline React 18 + Babel standalone, no build step.

## Global Constraints

- Edit ONLY `sitio/index.html`. Never touch `Product Page.html` or any CSS file.
- No new comments added to code.
- No new CDN URLs — React/ReactDOM/Babel CDN tags already exist in index.html.
- No `.jsx` component extraction.
- Mount point must be `<div id="root"></div>` (Product Page.html mounts on `#root`).
- Keep static header, hero, benefits, sp, footer, and hamburger vanilla JS script intact.

---

### Task 1: Add missing CSS to index.html's inline `<style>` block

**Files:**
- Modify: `sitio/index.html:17-24` (the inline `<style>` tag in `<head>`)

**Context:** Product Page.html defines several CSS rules that the new React components depend on. index.html's current `<style>` block only has `badgePop`, `.pp-badge-pop`, `.pp-track`, `.pp-faq-body`. Missing rules will cause silent visual bugs (no bottle fade animation, no announcement bar scroll, no dropdown nav).

**Rules to add (only if not already present in the block):**
- `@keyframes barScroll` — used by the announcement bar gradient animation
- `@keyframes fadeUp` + `.pp-fade` — used by bottle image swap animation
- `.pp-thumb:hover` — scale effect on gallery thumbnails
- `.pp-flavor:hover` — hover shadow on flavor cards
- `.pp-faq-btn:hover` — hover background on FAQ buttons
- `.pp-nav-dropdown` + `.pp-nav-dropdown.open` — mobile nav dropdown used by `MProductHeader`

- [ ] **Step 1.1: Edit the `<style>` block in index.html**

Replace the current block:
```html
  <style>
    @keyframes badgePop { 0%{transform:scale(1)} 50%{transform:scale(1.45)} 100%{transform:scale(1)} }
    .pp-badge-pop { animation: badgePop 0.3s cubic-bezier(0.25,0.46,0.45,0.94); }
    .pp-track { scrollbar-width: none; -webkit-overflow-scrolling: touch; }
    .pp-track::-webkit-scrollbar { display: none; }
    .pp-faq-body { overflow: hidden; max-height: 0; transition: max-height 0.3s cubic-bezier(0.25,0.46,0.45,0.94); }
    .pp-faq-body.open { max-height: 320px; }
  </style>
```

With:
```html
  <style>
    @keyframes badgePop { 0%{transform:scale(1)} 50%{transform:scale(1.45)} 100%{transform:scale(1)} }
    @keyframes barScroll { 0% { background-position: 0% 0%; } 100% { background-position: 200% 0%; } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .pp-badge-pop { animation: badgePop 0.3s cubic-bezier(0.25,0.46,0.45,0.94); }
    .pp-fade { animation: fadeUp 0.4s ease forwards; }
    .pp-track { scrollbar-width: none; -webkit-overflow-scrolling: touch; }
    .pp-track::-webkit-scrollbar { display: none; }
    .pp-faq-body { overflow: hidden; max-height: 0; transition: max-height 0.3s cubic-bezier(0.25,0.46,0.45,0.94); }
    .pp-faq-body.open { max-height: 320px; }
    .pp-thumb:hover { transform: scale(1.04); }
    .pp-flavor:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important; }
    .pp-faq-btn:hover { background: #fafafa; }
    .pp-nav-dropdown {
      position: absolute; top: 54px; left: 0; right: 0;
      background: #05070d; border-bottom: 1px solid rgba(255,255,255,0.08);
      overflow: hidden; max-height: 0; opacity: 0; z-index: 99;
      transition: max-height 0.28s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.22s;
    }
    .pp-nav-dropdown.open { max-height: 240px; opacity: 1; }
  </style>
```

- [ ] **Step 1.2: Verify no duplicate class names were introduced**

Open `sitio/index.html` and confirm the style block has exactly one definition for each class. No `@keyframes barScroll` should appear twice.

---

### Task 2: Change the React mount point from `#product-root` to `#root`

**Files:**
- Modify: `sitio/index.html:202`

**Context:** Product Page.html's `App` component calls `ReactDOM.createRoot(document.getElementById('root'))`. index.html currently has `<div id="product-root"></div>`. The id must match.

- [ ] **Step 2.1: Replace the div id**

Find:
```html
  <div id="product-root"></div>
```

Replace with:
```html
  <div id="root"></div>
```

---

### Task 3: Insert the window.PP_* shared data script before the babel block

**Files:**
- Modify: `sitio/index.html` — insert between the Babel CDN `<script>` tag (line ~230) and `<!-- ── React App -->` comment (line ~232)

**Context:** Product Page.html's babel script reads `window.PP_FLAVORS`, `window.PP_PRICE`, `window.ppMoney`, and `window.ppFlavor` — these must be set before the babel script runs, in a plain (non-babel) `<script>` tag.

- [ ] **Step 3.1: Insert the data script**

Find:
```html
  <!-- ── React App (consolidado) ──────────────────────────────────────── -->
  <script type="text/babel">
```

Replace with:
```html
  <script>
    window.PP_FLAVORS = [
      { id: 'chocolate', label: 'Chocolate Criollo', desc: 'Cacao de Chiapas, textura aterciopelada',      img: 'assets/bottle-chocolate.png' },
      { id: 'mango',     label: 'Mango',             desc: 'Mango Ataulfo natural con un toque de canela', img: 'assets/bottle-mango.png'     },
      { id: 'combinado', label: 'Combinado',          desc: '2 Chocolate + 2 Mango + 2 sabores sorpresa',  img: 'assets/bottle-combinado.png' },
    ];
    window.PP_PRICE     = 2299;
    window.PP_OLD_PRICE = 4179.99;
    window.ppMoney  = (n) => 'S/ ' + n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    window.ppFlavor = (id) => window.PP_FLAVORS.find(f => f.id === id);
  </script>

  <!-- ── React App (consolidado) ──────────────────────────────────────── -->
  <script type="text/babel">
```

---

### Task 4: Replace the entire babel script with Product Page.html's version

**Files:**
- Modify: `sitio/index.html:233-1111` (the `<script type="text/babel">` block)

**Context:** The old babel script (LandingApp, FixedBrandHeader, FloatingCart, etc.) is replaced entirely by Product Page.html's babel script (App, ProductHeader, MProductHeader, ProductSection, MProductSection, MReviewsSection, MBottomBar, MobileCart, etc.). 

**CRITICAL modification:** Product Page.html's `App` component declares a `const footer` JSX variable and renders it in both the mobile and desktop return branches. Since index.html already has a static `<footer class="site-footer">`, the React footer must be removed to avoid duplicate footers.

Remove these lines from the copied App component:

```jsx
      const footer = (
        <footer style={{
          background: '#05070d', borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: isMobile ? '28px 20px' : '28px 48px',
          display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'space-between',
          flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 12 : 0,
        }}>
          <span style={{ fontFamily: FP, fontWeight: 800, fontSize: isMobile ? 22 : 20, letterSpacing: '-0.05em', color: '#f4f4f6' }}>perfect pal</span>
          <div style={{ display: 'flex', gap: isMobile ? 20 : 32, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[{l:'Tienda',h:'#'},{l:'Proteína 101',h:'#'},{l:'Calculadora',h:'calculadora.html'},{l:'Contacto',h:'#'}].map(({l,h}) => (
              <a key={l} href={h} style={{ fontFamily: FO, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.8)'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
              >{l}</a>
            ))}
          </div>
          <span style={{ fontFamily: FO, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>© 2025 perfect pal · Hecho con ❤️ en Lima, Perú</span>
        </footer>
      );
```

And remove `{footer}` from both return branches. Also remove `<div style={{ height: 92 }} />` spacer (it precedes `MBottomBar` and is fine to keep) — actually keep the spacer, it's for the bottom bar. Just remove `{footer}` from the return JSX.

- [ ] **Step 4.1: Replace old babel script content**

Find the old opening delimiter:
```
  <script type="text/babel">
const { useState, useEffect, useRef, useCallback } = React;
```

Replace the entire block up to (not including) `</script>` with the content from Product Page.html lines 82–1343 (the inside of the babel script tag), then close with `</script>`.

The resulting babel script should:
- Open with: `const { useState, useEffect, useRef, useCallback } = React;`
- Declare: `FO, FP, FA, FI, FB` font shorthands
- Read: `const FLAVORS = window.PP_FLAVORS;` and `const PRICE = window.PP_PRICE;`
- Define: `FAQS`, `BENEFITS`, `REVIEWS`, `msDiff`, `initTimer`, `pad`, `useIsMobile`, `MQtyStepper`
- Define desktop components: `ProductHeader`, `ProductSection`, `ReviewsSection`
- Define mobile components: `MProductHeader`, `MProductSection`, `MReviewsSection`, `MBottomBar`, `MobileCart`
- Define `App` (WITHOUT the `const footer` block and WITHOUT `{footer}` in returns)
- End with: `ReactDOM.createRoot(document.getElementById('root')).render(<App />);`

- [ ] **Step 4.2: Verify exactly one `ReactDOM.createRoot` exists in the file**

```bash
grep -c "ReactDOM.createRoot" "sitio/index.html"
```
Expected output: `1`

- [ ] **Step 4.3: Verify the mount target id matches**

```bash
grep -n "id=\"root\"" "sitio/index.html"
```
Expected: one result on the `<div id="root"></div>` line, and one result in `getElementById('root')`.

---

### Task 5: Final checks before browser verification

- [ ] **Step 5.1: Confirm static sections are untouched**

```bash
grep -n "class=\"hero\"" "sitio/index.html"
grep -n "class=\"benefits\"" "sitio/index.html"
grep -n "class=\"sp\"" "sitio/index.html"
grep -n "class=\"site-footer\"" "sitio/index.html"
grep -n "site-nav__hamburger" "sitio/index.html"
```
All should return exactly one result each.

- [ ] **Step 5.2: Confirm no duplicate const declarations**

```bash
grep -c "const FLAVORS" "sitio/index.html"
grep -c "const PRICE" "sitio/index.html"
grep -c "const ppMoney" "sitio/index.html"
```
Each should return `1`. `const FLAVORS` and `const PRICE` appear only inside the babel script (referencing window.*). `ppMoney` should only appear in the window.PP_* data script and as `window.ppMoney` calls inside babel.

- [ ] **Step 5.3: Confirm no double footer**

```bash
grep -c "<footer" "sitio/index.html"
```
Expected: `1` (the static `<footer class="site-footer">`).
