export type GenderType = 'MALE' | 'FEMALE' | 'UNISEX';

export type PerfumeStatus = 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED' | 'COMING_SOON';

export type AdminProduct = {
  id: string;
  name: string;
  brand: string;
  description: string;
  categories: string[];
  genderType: GenderType;
  price: number;
  stock: number;
  status: PerfumeStatus;
  imageUrl: string;
};

// Sugerencias iniciales; el admin puede agregar categorías propias además de estas.
export const CATEGORY_SUGGESTIONS: string[] = [
  'Floral',
  'Frutal',
  'Oriental',
  'Amaderado',
  'Fresco',
  'Chipre',
  'Aromático',
  'Cítrico',
];

export const GENDER_OPTIONS: { value: GenderType; label: string }[] = [
  { value: 'FEMALE', label: 'Mujer' },
  { value: 'MALE', label: 'Hombre' },
  { value: 'UNISEX', label: 'Unisex' },
];

export const STATUS_OPTIONS: { value: PerfumeStatus; label: string; color: string }[] = [
  { value: 'AVAILABLE', label: 'Disponible', color: '#3E9B6F' },
  { value: 'OUT_OF_STOCK', label: 'Sin stock', color: '#C97A3D' },
  { value: 'COMING_SOON', label: 'Próximamente', color: '#4C7EA8' },
  { value: 'DISCONTINUED', label: 'Descontinuado', color: '#8E8C89' },
];

export function genderLabel(value: GenderType) {
  return GENDER_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function statusMeta(value: PerfumeStatus) {
  return STATUS_OPTIONS.find((o) => o.value === value) ?? STATUS_OPTIONS[0];
}

export function formatARS(price: number) {
  return `$${Math.round(price).toLocaleString('en-US')}`;
}

// El admin escribe el precio como pesos enteros con coma de miles (ej: 58,000).
export function formatPriceInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function parsePriceInput(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, '');
  return digits ? Number(digits) : 0;
}

export const MOCK_PRODUCTS: AdminProduct[] = [
  {
    id: '1',
    name: "Ámbar Nocturno",
    brand: 'L’Essence',
    description: 'Una fragancia envolvente con notas de ámbar, vainilla y maderas cálidas, ideal para la noche.',
    categories: ['Oriental'],
    genderType: 'UNISEX',
    price: 89990,
    stock: 24,
    status: 'AVAILABLE',
    imageUrl: 'https://picsum.photos/seed/perfume1/300/300',
  },
  {
    id: '2',
    name: 'Jardín de Sevilla',
    brand: 'Casa Blanca',
    description: 'Notas frescas de azahar y cítricos españoles con un fondo floral suave.',
    categories: ['Cítrico', 'Floral'],
    genderType: 'FEMALE',
    price: 64500,
    stock: 8,
    status: 'AVAILABLE',
    imageUrl: 'https://picsum.photos/seed/perfume2/300/300',
  },
  {
    id: '3',
    name: 'Roble Silvestre',
    brand: 'Norden',
    description: 'Vetiver, cedro y un toque de tabaco. Elegancia rústica para el día a día.',
    categories: ['Amaderado'],
    genderType: 'MALE',
    price: 72000,
    stock: 0,
    status: 'OUT_OF_STOCK',
    imageUrl: 'https://picsum.photos/seed/perfume3/300/300',
  },
  {
    id: '4',
    name: 'Brisa de Higuera',
    brand: 'Costa Sur',
    description: 'Higo verde, sal marina y almizcle blanco. Fresca y luminosa.',
    categories: ['Fresco', 'Cítrico'],
    genderType: 'UNISEX',
    price: 54900,
    stock: 15,
    status: 'COMING_SOON',
    imageUrl: 'https://picsum.photos/seed/perfume4/300/300',
  },
];
