import { ApiError, API_BASE_URL, apiFetch } from '@/lib/api';

export type PerfumeCategory =
  | 'FLORAL'
  | 'FRUITY'
  | 'ORIENTAL'
  | 'WOODY'
  | 'FRESH'
  | 'CHYPRE'
  | 'AROMATIC'
  | 'CITRUS';

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

type PerfumeResponse = {
  id: number;
  name: string;
  brand: string;
  description: string | null;
  categories: string[];
  genderType: string;
  price: number;
  stock: number;
  status: string;
  imageUrl: string | null;
  rating: number | null;
};

function fromResponse(response: PerfumeResponse): AdminProduct {
  return {
    id: String(response.id),
    name: response.name,
    brand: response.brand,
    description: response.description ?? '',
    categories: response.categories ?? [],
    genderType: response.genderType as GenderType,
    price: response.price,
    stock: response.stock,
    status: response.status as PerfumeStatus,
    imageUrl: response.imageUrl ?? '',
  };
}

export const CATEGORY_OPTIONS: { value: PerfumeCategory; label: string }[] = [
  { value: 'FLORAL', label: 'Floral' },
  { value: 'FRUITY', label: 'Frutal' },
  { value: 'ORIENTAL', label: 'Oriental' },
  { value: 'WOODY', label: 'Amaderado' },
  { value: 'FRESH', label: 'Fresco' },
  { value: 'CHYPRE', label: 'Chipre' },
  { value: 'AROMATIC', label: 'Aromático' },
  { value: 'CITRUS', label: 'Cítrico' },
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

export function categoryLabel(value: string) {
  return CATEGORY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

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

export type PerfumeDraft = Omit<AdminProduct, 'id'>;

export async function fetchPerfumes(): Promise<AdminProduct[]> {
  const data = await apiFetch<PerfumeResponse[]>('/api/perfumes');
  return data.map(fromResponse);
}

export async function createPerfume(draft: PerfumeDraft, token: string): Promise<AdminProduct> {
  const response = await apiFetch<PerfumeResponse>('/api/admin/perfumes', {
    method: 'POST',
    token,
    body: draft,
  });
  return fromResponse(response);
}

export async function updatePerfume(
  id: string,
  draft: PerfumeDraft,
  token: string,
): Promise<AdminProduct> {
  const response = await apiFetch<PerfumeResponse>(`/api/admin/perfumes/${id}`, {
    method: 'PUT',
    token,
    body: draft,
  });
  return fromResponse(response);
}

export async function deletePerfume(id: string, token: string): Promise<void> {
  await apiFetch<void>(`/api/admin/perfumes/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function uploadPerfumeImage(
  uri: string,
  fileName: string,
  mimeType: string,
  token: string,
): Promise<string> {
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  const response = await fetch(`${API_BASE_URL}/api/admin/perfumes/images`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    throw new ApiError(response.status, data?.message ?? `Error ${response.status}`);
  }

  return data.url as string;
}
