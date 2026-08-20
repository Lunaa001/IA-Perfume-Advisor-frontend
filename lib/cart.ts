export type CartItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

export function formatARS(price: number) {
  return `$${Math.round(price).toLocaleString('en-US')}`;
}

export const MOCK_CART_ITEMS: CartItem[] = [
  {
    id: '1',
    name: 'Ámbar Nocturno',
    brand: 'L’Essence',
    price: 89990,
    quantity: 1,
    imageUrl: 'https://picsum.photos/seed/perfume1/300/300',
  },
  {
    id: '2',
    name: 'Jardín de Sevilla',
    brand: 'Casa Blanca',
    price: 64500,
    quantity: 2,
    imageUrl: 'https://picsum.photos/seed/perfume2/300/300',
  },
];
