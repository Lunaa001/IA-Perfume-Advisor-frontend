import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { CartItem, MOCK_CART_ITEMS } from '@/lib/cart';

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  increase: (id: string) => void;
  decrease: (id: string) => void;
  remove: (id: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(MOCK_CART_ITEMS);

  const increase = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)),
    );
  }, []);

  const decrease = useCallback((id: string) => {
    setItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, totalItems, totalPrice, increase, decrease, remove }),
    [items, totalItems, totalPrice, increase, decrease, remove],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
