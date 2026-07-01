# Code Review Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 7 verified issues found in the medium-effort code review: 3 correctness bugs, 1 performance regression, and 3 maintenance/quality gaps.

**Architecture:** All fixes are surgical — one file per task (except Task 5 which touches CartDrawer + imports QtySelector). No new files created. No new dependencies. All hooks stay in `src/hooks/`, all components in their existing locations.

**Tech Stack:** React 18, Vite, Vitest + Testing Library, CSS Modules.

## Global Constraints

- Edit only files named in each task — no collateral cleanup.
- No new npm dependencies.
- Run `npm test` in `sitio/` after every task — keep the suite green.
- Do not change component public APIs (prop names, hook return shapes) unless the task explicitly says to.
- No comments explaining what changed — the code should speak for itself.

---

### Task 1: Fix `useIsMobile` — stale MediaQueryList + SSR crash

**Files:**
- Modify: `src/hooks/useIsMobile.js`

**Context:** `window.matchMedia(...)` is called on every render, creating a new `MediaQueryList` on each call. The `useEffect` has `[]` deps, so it captures the MQL from the first render only — if the `breakpoint` argument ever changes, the new MQL is never listened to and the old listener leaks. Additionally, calling `window.matchMedia` at the top of the hook body crashes in any environment where `window` is undefined (Vitest without jsdom would throw; the project uses jsdom so it passes today, but the guard is still needed for robustness).

**Fix:** wrap `window.matchMedia(...)` in `useMemo` keyed on `breakpoint`, add a `typeof window` guard, and add `mq` to the effect's dependency array so the listener is re-attached whenever the breakpoint changes.

- [ ] **Step 1.1: Rewrite the hook**

Replace the entire content of `src/hooks/useIsMobile.js` with:

```js
import { useState, useEffect, useMemo } from 'react';

export function useIsMobile(breakpoint = 768) {
  const mq = useMemo(
    () => (typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${breakpoint}px)`) : null),
    [breakpoint]
  );

  const [isMobile, setIsMobile] = useState(() => mq?.matches ?? false);

  useEffect(() => {
    if (!mq) return;
    setIsMobile(mq.matches);
    const handler = e => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mq]);

  return isMobile;
}
```

- [ ] **Step 1.2: Write a test**

Add this file: `src/hooks/useIsMobile.test.js`

```js
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from './useIsMobile';

function mockMatchMedia(matches) {
  const listeners = [];
  const mql = {
    matches,
    addEventListener: (_, fn) => listeners.push(fn),
    removeEventListener: (_, fn) => {
      const i = listeners.indexOf(fn);
      if (i >= 0) listeners.splice(i, 1);
    },
    _fire: m => listeners.forEach(fn => fn({ matches: m })),
  };
  window.matchMedia = jest.fn(() => mql);
  return mql;
}

test('returns false on desktop', () => {
  mockMatchMedia(false);
  const { result } = renderHook(() => useIsMobile(768));
  expect(result.current).toBe(false);
});

test('returns true when viewport matches', () => {
  mockMatchMedia(true);
  const { result } = renderHook(() => useIsMobile(768));
  expect(result.current).toBe(true);
});

test('updates when MQL fires', () => {
  const mql = mockMatchMedia(false);
  const { result } = renderHook(() => useIsMobile(768));
  act(() => mql._fire(true));
  expect(result.current).toBe(true);
});

test('re-attaches listener when breakpoint changes', () => {
  const mql = mockMatchMedia(false);
  const { rerender } = renderHook(({ bp }) => useIsMobile(bp), {
    initialProps: { bp: 768 },
  });
  expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 768px)');
  rerender({ bp: 900 });
  expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 900px)');
});
```

- [ ] **Step 1.3: Run the tests**

```bash
cd sitio && npm test -- useIsMobile
```

Expected: all 4 pass.

---

### Task 2: Fix `useIntersection` — wrong initial state hides sticky bars on load

**Files:**
- Modify: `src/hooks/useIntersection.js`

**Context:** `useState(true)` means `isIntersecting` starts as `true`. In `ProductSection/index.jsx`, this value is aliased as `ctaVisible`. `StickyBar` renders with `visible={!ctaVisible}` and `BottomBar` with `visible={!ctaVisible && !isOpen}`. On page load, if the CTA button is below the fold (common on mobile), `ctaVisible` is wrongly `true`, so `!ctaVisible` is `false`, so both bars are hidden. They only appear after the IntersectionObserver fires its first callback — a flash of missing UI.

**Fix:** change the initial state to `false`. The observer fires immediately on mount with the correct initial intersection state, so both bars will show or hide correctly from the first paint.

- [ ] **Step 2.1: Change the initial state**

In `src/hooks/useIntersection.js`, change line 5:

```js
// Before
const [isIntersecting, setIsIntersecting] = useState(true);

// After
const [isIntersecting, setIsIntersecting] = useState(false);
```

The full file after the change:

```js
import { useState, useEffect, useRef } from 'react';

export function useIntersection(options = { threshold: 0 }) {
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => setIsIntersecting(e.isIntersecting), options);
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, isIntersecting];
}
```

- [ ] **Step 2.2: Run tests**

```bash
cd sitio && npm test
```

Expected: full suite passes (no tests cover `useIntersection` directly today — the important check is that nothing else breaks).

---

### Task 3: Fix `CartDrawer` — overflow cleanup runs unconditionally on every transition

**Files:**
- Modify: `src/components/sections/ProductSection/CartDrawer.jsx` (lines 54–57 only)

**Context:** The `useEffect` cleanup currently does `document.body.style.overflow = ''` unconditionally. This means:
1. On every `isOpen` false→true transition, cleanup (sets `''`) fires just before the effect (sets `'hidden'`) — harmless but wasteful.
2. If `CartDrawer` unmounts while `isOpen=true` (e.g. a route change), cleanup fires and re-enables scrolling even though no closing animation ran — the scroll lock is silently dropped.

**Fix:** only lock the body inside the effect body when `isOpen` is true; only register a cleanup (unlock) from that branch. When `isOpen` is false, the effect is a no-op and registers no cleanup.

- [ ] **Step 3.1: Replace the useEffect**

In `src/components/sections/ProductSection/CartDrawer.jsx`, replace lines 54–57:

```js
// Before
useEffect(() => {
  document.body.style.overflow = isOpen ? 'hidden' : '';
  return () => { document.body.style.overflow = ''; };
}, [isOpen]);

// After
useEffect(() => {
  if (!isOpen) return;
  document.body.style.overflow = 'hidden';
  return () => { document.body.style.overflow = ''; };
}, [isOpen]);
```

- [ ] **Step 3.2: Run tests**

```bash
cd sitio && npm test
```

Expected: suite passes.

---

### Task 4: Fix `StickyBar` — `OLD_PRICE` hardcoded as magic literal

**Files:**
- Modify: `src/components/sections/ProductSection/StickyBar.jsx` (lines 4 and 17)

**Context:** `StickyBar.jsx` imports `{ formatMoney, PRICE }` from config but not `OLD_PRICE`. Line 17 renders `formatMoney(4179.99)` as a literal. Every other component uses `formatMoney(OLD_PRICE)`. If `OLD_PRICE` is updated in `src/data/config.js`, `StickyBar` silently shows the wrong crossed-out price.

- [ ] **Step 4.1: Add OLD_PRICE to the import and use it**

In `src/components/sections/ProductSection/StickyBar.jsx`:

```js
// Before (line 4)
import { formatMoney, PRICE } from '../../../data/config';

// After
import { formatMoney, PRICE, OLD_PRICE } from '../../../data/config';
```

```js
// Before (line 17)
<span className={styles.priceOld}>{formatMoney(4179.99)}</span>

// After
<span className={styles.priceOld}>{formatMoney(OLD_PRICE)}</span>
```

- [ ] **Step 4.2: Run tests**

```bash
cd sitio && npm test
```

Expected: suite passes.

---

### Task 5: Replace `CartDrawer` inline qty stepper with `QtySelector`

**Files:**
- Modify: `src/components/sections/ProductSection/CartDrawer.jsx` (lines 1 and 37–41)

**Context:** `CartItem` inside `CartDrawer` contains an inline qty stepper (decrement button, qty span, increment button) that duplicates the logic already in `QtySelector`. The inline version uses `aria-label="Menos"` and `aria-label="Más"` while `QtySelector` uses the more descriptive `"Reducir cantidad"` / `"Aumentar cantidad"`. Any future change to the stepper must be applied in two places.

- [ ] **Step 5.1: Import QtySelector**

Add `QtySelector` to the imports at the top of `CartDrawer.jsx`:

```js
// Before (line 1–6)
import { useEffect } from 'react';
import styles from './CartDrawer.module.css';
import { useCart } from '../../../hooks/useCart';
import { FLAVORS } from '../../../data/flavors';
import { formatMoney, PRICE } from '../../../data/config';
import { Button } from '../../ui/Button';

// After
import { useEffect } from 'react';
import styles from './CartDrawer.module.css';
import { useCart } from '../../../hooks/useCart';
import { FLAVORS } from '../../../data/flavors';
import { formatMoney, PRICE } from '../../../data/config';
import { Button } from '../../ui/Button';
import { QtySelector } from './QtySelector';
```

- [ ] **Step 5.2: Replace the inline stepper in CartItem**

In the `CartItem` function (lines 37–41), replace the inline qty block:

```jsx
// Before
<div className={styles.itemQty}>
  <button onClick={() => updateQty(item.id, item.qty - 1)} disabled={item.qty <= 1} aria-label="Menos">−</button>
  <span>{item.qty}</span>
  <button onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Más">+</button>
</div>

// After
<QtySelector
  value={item.qty}
  onChange={v => updateQty(item.id, v)}
/>
```

Note: `QtySelector` already clamps at `Math.max(1, value - 1)`, so the `disabled={item.qty <= 1}` guard is preserved.

- [ ] **Step 5.3: Run tests**

```bash
cd sitio && npm test
```

Expected: suite passes. Visually verify the stepper in the cart drawer still renders and the − button is disabled at qty=1.

---

### Task 6: Wire `ProteinSelector` into `ProductSection`

**Files:**
- Modify: `src/components/sections/ProductSection/index.jsx`

**Context:** `ProteinSelector` is defined and exported but never imported or rendered anywhere. The product section shows a hardcoded "6 Pack · 30G" badge with no way to change it. This task adds `protein` state to `ProductSection` and renders `ProteinSelector` between the `FlavorSelector` and the CTA block, matching the layout intent.

Note: the `protein` value currently has no effect on price or any API call — it only needs to update the badge text. Wiring it to actual business logic (different SKU, price change) is out of scope.

- [ ] **Step 6.1: Add the import**

Add `ProteinSelector` to the imports in `src/components/sections/ProductSection/index.jsx`:

```js
// Existing import block (around line 14)
import { QtySelector } from './QtySelector';
// Add after:
import { ProteinSelector } from './ProteinSelector';
```

- [ ] **Step 6.2: Add protein state**

Inside `ProductSection`, after the existing `const [qty, setQty] = useState(1);` line (around line 29), add:

```js
const [protein, setProtein] = useState('30g');
```

- [ ] **Step 6.3: Update the badge to reflect selected protein**

In the badges block (around line 63–66), change the neutral badge from hardcoded `'6 Pack · 30G'` to read from state:

```jsx
// Before
<Badge variant="neutral">6 Pack · 30G</Badge>

// After
<Badge variant="neutral">6 Pack · {protein.toUpperCase()}</Badge>
```

- [ ] **Step 6.4: Render ProteinSelector between FlavorSelector and the CTA section**

After `<FlavorSelector selected={flavor} onSelect={setFlavor} />` (around line 96), insert:

```jsx
<ProteinSelector selected={protein} onSelect={setProtein} />
```

- [ ] **Step 6.5: Run tests**

```bash
cd sitio && npm test
```

Expected: suite passes. Visually verify the protein selector (30G / 20G options) appears between the flavor cards and the quantity row, and selecting 20G updates the badge.

---

### Task 7: Fix `FloatingCartFAB` — eliminate 60fps re-renders during carousel drag

**Files:**
- Modify: `src/components/ui/FloatingCartFAB/index.jsx`

**Context:** `dragOffset` is React state (line 40). Every `mousemove`/`touchmove` event calls `setDragOffset`, triggering a full re-render of the popover including `FLAVORS.map` + `items.find` per slide at 60+ fps during a drag. The fix is to move `dragOffset` to a ref and update the carousel track's `style.transform` directly via a DOM ref, bypassing React for the hot path. React still re-renders when `activeIdx` or `qty` change (snap + button clicks), which is the correct behavior.

- [ ] **Step 7.1: Replace dragOffset state with a ref, add a trackRef**

In `src/components/ui/FloatingCartFAB/index.jsx`:

```js
// Before (lines 40–41)
const [dragOffset, setDragOffset] = useState(0);
const isDragging = useRef(false);
const startX = useRef(0);

// After
const dragOffset = useRef(0);
const isDragging = useRef(false);
const startX = useRef(0);
const trackRef = useRef(null);
```

Remove `useState` from the import (keep only `useRef` and `useState` for the remaining state). The import line becomes:

```js
import { useState, useRef } from 'react';
```

(`useState` is still needed for `popOpen`, `activeIdx`, `qty`.)

- [ ] **Step 7.2: Add a helper to write the track transform directly**

Immediately before `handleMouseDown`, insert:

```js
function applyTrackTransform() {
  if (!trackRef.current) return;
  trackRef.current.style.transition = isDragging.current
    ? 'none'
    : 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  trackRef.current.style.transform =
    `translateX(calc(${-activeIdx * SLIDE_W}px + ${dragOffset.current}px))`;
}
```

- [ ] **Step 7.3: Update move handlers to call applyTrackTransform**

```js
// Before
function handleMouseDown(e) {
  isDragging.current = true;
  startX.current = e.clientX;
  setDragOffset(0);
}

function handleMouseMove(e) {
  if (!isDragging.current) return;
  setDragOffset(e.clientX - startX.current);
}

// After
function handleMouseDown(e) {
  isDragging.current = true;
  startX.current = e.clientX;
  dragOffset.current = 0;
}

function handleMouseMove(e) {
  if (!isDragging.current) return;
  dragOffset.current = e.clientX - startX.current;
  applyTrackTransform();
}
```

```js
// Before
function handleTouchStart(e) {
  isDragging.current = true;
  startX.current = e.touches[0].clientX;
  setDragOffset(0);
}

function handleTouchMove(e) {
  if (!isDragging.current) return;
  setDragOffset(e.touches[0].clientX - startX.current);
}

// After
function handleTouchStart(e) {
  isDragging.current = true;
  startX.current = e.touches[0].clientX;
  dragOffset.current = 0;
}

function handleTouchMove(e) {
  if (!isDragging.current) return;
  dragOffset.current = e.touches[0].clientX - startX.current;
  applyTrackTransform();
}
```

- [ ] **Step 7.4: Update commitDrag to reset the ref**

```js
// Before
function commitDrag() {
  isDragging.current = false;
  if (dragOffset < -SNAP_THRESHOLD && activeIdx < FLAVORS.length - 1) {
    setActiveIdx(i => i + 1);
  } else if (dragOffset > SNAP_THRESHOLD && activeIdx > 0) {
    setActiveIdx(i => i - 1);
  }
  setDragOffset(0);
  setQty(1);
}

// After
function commitDrag() {
  isDragging.current = false;
  if (dragOffset.current < -SNAP_THRESHOLD && activeIdx < FLAVORS.length - 1) {
    setActiveIdx(i => i + 1);
  } else if (dragOffset.current > SNAP_THRESHOLD && activeIdx > 0) {
    setActiveIdx(i => i - 1);
  }
  dragOffset.current = 0;
  setQty(1);
}
```

- [ ] **Step 7.5: Remove trackStyle computed var and update JSX**

Remove the `trackStyle` object (lines 104–107):

```js
// DELETE these lines entirely
const trackStyle = {
  transform: `translateX(calc(${-activeIdx * SLIDE_W}px + ${dragOffset}px))`,
  transition: isDragging.current ? 'none' : 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
};
```

In JSX, replace the carousel track `<div>`:

```jsx
// Before
<div className={styles.carouselTrack} style={trackStyle}>

// After
<div className={styles.carouselTrack} ref={trackRef} style={{ transform: `translateX(${-activeIdx * SLIDE_W}px)` }}>
```

The inline `style` here handles the static position (by `activeIdx`) at render time. The `dragOffset` during live drag is handled by `applyTrackTransform` writing to the DOM directly.

- [ ] **Step 7.6: Run tests**

```bash
cd sitio && npm test
```

Expected: suite passes. Manually verify in browser that dragging the carousel slides smoothly without janky re-renders (check React DevTools profiler — no `FloatingCartFAB` re-renders during mousemove).
