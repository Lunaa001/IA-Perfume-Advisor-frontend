import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as cartApi from '@/lib/cart';
import type { CartItem, WhatsAppRedirect } from '@/lib/cart';

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
  addItem: (perfumeId: number, quantity?: number) => Promise<void>;
  increase: (perfumeId: number) => Promise<void>;
  decrease: (perfumeId: number) => Promise<void>;
  remove: (perfumeId: number) => Promise<void>;
  checkout: () => Promise<WhatsAppRedirect>;
  confirmCheckout: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

// Carrito de compra "anónimo": no requiere cuenta de usuario, se identifica con un id
// generado en el dispositivo (ver getOrCreateCartId) que el backend usa para asociar los items.
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applySummary = (summary: Awaited<ReturnType<typeof cartApi.fetchCart>>) => {
    setItems(summary.items);
    setTotalItems(summary.totalItems);
    setTotalPrice(summary.totalPrice);
  };

  useEffect(() => {
    (async () => {
      try {
        const id = await cartApi.getOrCreateCartId();
        setCartId(id);
        const summary = await cartApi.fetchCart(id);
        applySummary(summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el carrito.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const withCartId = useCallback(
    async (action: (id: string) => Promise<Awaited<ReturnType<typeof cartApi.fetchCart>>>) => {
      if (!cartId) return;
      setError(null);
      try {
        const summary = await action(cartId);
        applySummary(summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo actualizar el carrito.');
        throw err;
      }
    },
    [cartId],
  );

  const addItem = useCallback(
    (perfumeId: number, quantity = 1) => withCartId((id) => cartApi.addToCart(id, perfumeId, quantity)),
    [withCartId],
  );

  const increase = useCallback(
    (perfumeId: number) => {
      const current = items.find((item) => item.perfumeId === perfumeId);
      return withCartId((id) => cartApi.updateCartItem(id, perfumeId, (current?.quantity ?? 0) + 1));
    },
    [items, withCartId],
  );

  const decrease = useCallback(
    (perfumeId: number) => {
      const current = items.find((item) => item.perfumeId === perfumeId);
      // Si llega a 0 lo mandamos igual al backend: ahí se encarga de sacar el item del carrito.
      const nextQuantity = (current?.quantity ?? 0) - 1;
      return withCartId((id) => cartApi.updateCartItem(id, perfumeId, nextQuantity));
    },
    [items, withCartId],
  );

  const remove = useCallback(
    (perfumeId: number) => withCartId((id) => cartApi.removeCartItem(id, perfumeId)),
    [withCartId],
  );

  // Solo genera el link/mensaje de WhatsApp: el carrito real en el backend no se toca
  // todavía (ver confirmCheckout), para no perder el pedido si falla la apertura.
  const checkout = useCallback(async () => {
    if (!cartId) throw new Error('El carrito todavía no está listo.');
    return cartApi.checkoutCart(cartId);
  }, [cartId]);

  // Se llama solo despues de confirmar que WhatsApp se abrio bien (ver app/cart.tsx).
  const confirmCheckout = useCallback(async () => {
    if (!cartId) return;
    const summary = await cartApi.clearCart(cartId);
    applySummary(summary);
  }, [cartId]);

  const value = useMemo(
    () => ({
      items,
      totalItems,
      totalPrice,
      isLoading,
      error,
      addItem,
      increase,
      decrease,
      remove,
      checkout,
      confirmCheckout,
    }),
    [items, totalItems, totalPrice, isLoading, error, addItem, increase, decrease, remove, checkout, confirmCheckout],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
