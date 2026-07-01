import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './useCart';

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

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
