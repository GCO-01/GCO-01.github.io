import { createContext, useContext, useState, useMemo, useCallback } from 'react';

// Contexts separados: los consumidores que solo AGREGAN (ProductSection, FAB)
// usan useCartActions() y no se re-renderizan cuando cambia el contenido
// del carrito. useCart() combina ambos y conserva la API original.
const CartStateContext = createContext(null);
const CartActionsContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((flavorId, qty) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === flavorId);
      if (existing) return prev.map(i => i.id === flavorId ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { id: flavorId, qty }];
    });
    setIsOpen(true);
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  }, []);

  const removeItem = useCallback(id => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const state = useMemo(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    return { items, count, isOpen };
  }, [items, isOpen]);

  const actions = useMemo(
    () => ({ addItem, updateQty, removeItem, setIsOpen }),
    [addItem, updateQty, removeItem]
  );

  return (
    <CartActionsContext.Provider value={actions}>
      <CartStateContext.Provider value={state}>
        {children}
      </CartStateContext.Provider>
    </CartActionsContext.Provider>
  );
}

export function useCartActions() {
  const ctx = useContext(CartActionsContext);
  if (!ctx) throw new Error('useCartActions must be used within CartProvider');
  return ctx;
}

export function useCart() {
  const state = useContext(CartStateContext);
  const actions = useContext(CartActionsContext);
  if (!state || !actions) throw new Error('useCart must be used within CartProvider');
  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
}
