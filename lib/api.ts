import Constants from 'expo-constants';
import { Platform } from 'react-native';

const BACKEND_PORT = 8080;

// En dev, Expo sabe la IP de la compu que corre Metro (host de este mismo dispositivo/celular
// cuando escaneás el QR). La reutilizamos para no tener que hardcodear ninguna IP a mano.
function resolveApiBaseUrl(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:${BACKEND_PORT}`;
  }
  return Platform.OS === 'web' ? `http://localhost:${BACKEND_PORT}` : `http://10.0.2.2:${BACKEND_PORT}`;
}

export const API_BASE_URL = resolveApiBaseUrl();

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
};

// Wrapper único de fetch para toda la app: arma la URL con API_BASE_URL, serializa el
// body a JSON, agrega el Bearer token si vino uno, y traduce respuestas no-OK en ApiError.
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 (ej. DELETE) no trae body; evitamos leerlo para no fallar al parsear un string vacío.
  if (response.status === 204) {
    return undefined as T;
  }

  // Algunos endpoints devuelven body vacío incluso sin ser 204, así que solo parseamos
  // si efectivamente hay texto.
  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const message = data?.message ?? `Error ${response.status}`;
    throw new ApiError(response.status, message);
  }

  return data as T;
}
