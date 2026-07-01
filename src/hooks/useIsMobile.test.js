import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
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
  window.matchMedia = vi.fn(() => mql);
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
