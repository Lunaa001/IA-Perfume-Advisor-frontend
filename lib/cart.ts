import * as SecureStore from 'expo-secure-store';

import { apiFetch } from '@/lib/api';

const CART_ID_KEY = 'cart_id';

// Id de carrito puramente local (no es un token de seguridad, solo un identificador
// para que el backend sepa a qué carrito pertenece cada request de este dispositivo).
function generateCartId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Persiste el id en SecureStore para que el carrito sobreviva reinicios de la app
// sin necesidad de que el usuario tenga cuenta.
export async function getOrCreateCartId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(CART_ID_KEY);
  if (existing) return existing;

  const id = generateCartId();
  await SecureStore.setItemAsync(CART_ID_KEY, id);
  return id;
}

export type CartItem = {
  perfumeId: number;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
};

type CartSummary = {
  id: number | null;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
};

export type WhatsAppRedirect = {
  whatsappUrl: string;
  message: string;
};

type CartItemResponse = {
  perfumeId: number;
  perfumeName: string;
  imageUrl: string | null;
  quantity: number;
  price: number;
};

type CartResponse = {
  id: number | null;
  items: CartItemResponse[];
  totalPrice: number;
  totalItems: number;
};

function fromResponse(response: CartResponse): CartSummary {
  return {
    id: response.id,
    items: response.items.map((item) => ({
      perfumeId: item.perfumeId,
      name: item.perfumeName,
      imageUrl: item.imageUrl ?? '',
      price: item.price,
      quantity: item.quantity,
    })),
    totalPrice: response.totalPrice,
    totalItems: response.totalItems,
  };
}

export function formatARS(price: number) {
  return `$${Math.round(price).toLocaleString('en-US')}`;
}

export async function fetchCart(cartId: string): Promise<CartSummary> {
  const response = await apiFetch<CartResponse>('/api/cart', {
    headers: { 'X-Cart-Id': cartId },
  });
  return fromResponse(response);
}

export async function addToCart(cartId: string, perfumeId: number, quantity: number): Promise<CartSummary> {
  const response = await apiFetch<CartResponse>('/api/cart/items', {
    method: 'POST',
    headers: { 'X-Cart-Id': cartId },
    body: { perfumeId, quantity },
  });
  return fromResponse(response);
}

export async function updateCartItem(
  cartId: string,
  perfumeId: number,
  quantity: number,
): Promise<CartSummary> {
  const response = await apiFetch<CartResponse>('/api/cart/items', {
    method: 'PUT',
    headers: { 'X-Cart-Id': cartId },
    body: { perfumeId, quantity },
  });
  return fromResponse(response);
}

export async function removeCartItem(cartId: string, perfumeId: number): Promise<CartSummary> {
  const response = await apiFetch<CartResponse>(`/api/cart/items/${perfumeId}`, {
    method: 'DELETE',
    headers: { 'X-Cart-Id': cartId },
  });
  return fromResponse(response);
}

export async function checkoutCart(cartId: string): Promise<WhatsAppRedirect> {
  return apiFetch<WhatsAppRedirect>('/api/cart/checkout', {
    method: 'POST',
    headers: { 'X-Cart-Id': cartId },
  });
}

// Se llama aparte de checkoutCart, solo despues de confirmar que WhatsApp se abrio bien:
// asi si el cliente no tiene WhatsApp instalado o falla la apertura, no pierde el carrito.
export async function clearCart(cartId: string): Promise<CartSummary> {
  const response = await apiFetch<CartResponse>('/api/cart', {
    method: 'DELETE',
    headers: { 'X-Cart-Id': cartId },
  });
  return fromResponse(response);
}
