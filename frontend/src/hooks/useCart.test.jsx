import { renderHook, act } from '@testing-library/react';
import { beforeEach } from 'vitest';
import { CartProvider, useCart } from './useCart';
import { PRICE } from '../data/config';

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

// El carrito persiste en localStorage; limpiar para aislar cada test.
beforeEach(() => localStorage.clear());

test('starts empty', () => {
  const { result } = renderHook(() => useCart(), { wrapper });
  expect(result.current.count).toBe(0);
  expect(result.current.items).toHaveLength(0);
});

test('addItem increments count', () => {
  const { result } = renderHook(() => useCart(), { wrapper });
  act(() => result.current.addItem('chocolate', 2));
  expect(result.current.count).toBe(2);
});

test('addItem same flavor accumulates qty', () => {
  const { result } = renderHook(() => useCart(), { wrapper });
  act(() => result.current.addItem('chocolate', 1));
  act(() => result.current.addItem('chocolate', 1));
  expect(result.current.items).toHaveLength(1);
  expect(result.current.items[0].qty).toBe(2);
});

test('addItem different flavors creates separate items', () => {
  const { result } = renderHook(() => useCart(), { wrapper });
  act(() => result.current.addItem('chocolate', 1));
  act(() => result.current.addItem('mango', 1));
  expect(result.current.items).toHaveLength(2);
  expect(result.current.count).toBe(2);
});

test('updateQty changes item quantity', () => {
  const { result } = renderHook(() => useCart(), { wrapper });
  act(() => result.current.addItem('mango', 1));
  act(() => result.current.updateQty('mango', 3));
  expect(result.current.items[0].qty).toBe(3);
});

test('removeItem eliminates item', () => {
  const { result } = renderHook(() => useCart(), { wrapper });
  act(() => result.current.addItem('mango', 1));
  act(() => result.current.removeItem('mango'));
  expect(result.current.count).toBe(0);
  expect(result.current.items).toHaveLength(0);
});

test('addItem opens cart', () => {
  const { result } = renderHook(() => useCart(), { wrapper });
  expect(result.current.isOpen).toBe(false);
  act(() => result.current.addItem('chocolate', 1));
  expect(result.current.isOpen).toBe(true);
});

test('total is derived from items in the provider', () => {
  const { result } = renderHook(() => useCart(), { wrapper });
  act(() => result.current.addItem('chocolate', 2));
  act(() => result.current.addItem('mango', 1));
  expect(result.current.total).toBe(PRICE * 3);
});

test('getCartSummary serializes lines with labels and totals', () => {
  const { result } = renderHook(() => useCart(), { wrapper });
  act(() => result.current.addItem('chocolate', 2));
  const summary = result.current.getCartSummary();
  expect(summary.count).toBe(2);
  expect(summary.totalCents).toBe(PRICE * 2);
  expect(summary.lines[0]).toMatchObject({ id: 'chocolate', qty: 2, lineTotalCents: PRICE * 2 });
  expect(summary.lines[0].label).toBeTruthy();
});

test('cart persists to localStorage and reloads', () => {
  const first = renderHook(() => useCart(), { wrapper });
  act(() => first.result.current.addItem('mango', 3));
  first.unmount();

  const second = renderHook(() => useCart(), { wrapper });
  expect(second.result.current.count).toBe(3);
  expect(second.result.current.items[0]).toMatchObject({ id: 'mango', qty: 3 });
});

test('invalid persisted data is discarded on load', () => {
  localStorage.setItem(
    'pp_cart_v1',
    JSON.stringify([
      { id: 'no-existe', qty: 2 },
      { id: 'chocolate', qty: 0 },
      { id: 'chocolate', qty: 1.5 },
      { id: 'mango', qty: 2 },
      'basura',
    ])
  );
  const { result } = renderHook(() => useCart(), { wrapper });
  expect(result.current.items).toEqual([{ id: 'mango', qty: 2 }]);
});

test('corrupt localStorage does not crash', () => {
  localStorage.setItem('pp_cart_v1', '{no es json');
  const { result } = renderHook(() => useCart(), { wrapper });
  expect(result.current.items).toEqual([]);
});
