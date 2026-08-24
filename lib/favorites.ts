import * as SecureStore from 'expo-secure-store';

const FAVORITES_KEY = 'favorite_perfume_ids';

export async function loadFavorites(): Promise<string[]> {
  const raw = await SecureStore.getItemAsync(FAVORITES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export async function saveFavorites(ids: string[]): Promise<void> {
  await SecureStore.setItemAsync(FAVORITES_KEY, JSON.stringify(ids));
}
