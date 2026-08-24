import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as favoritesApi from '@/lib/favorites';

type FavoritesContextValue = {
  favoriteIds: string[];
  isFavorite: (id: string | number) => boolean;
  toggleFavorite: (id: string | number) => void;
  pruneMissing: (existingIds: (string | number)[]) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

// Favoritos guardados solo en el dispositivo (SecureStore), no en el backend: no hace
// falta cuenta de usuario para guardar un perfume como favorito.
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  // Los ids de producto llegan como string o number según la pantalla (AdminProduct.id
  // es string, RecommendationItem.perfumeId es number); normalizamos todo a string acá
  // para poder comparar sin duplicados en el Set.
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    favoritesApi.loadFavorites().then((loaded) => setIds(new Set(loaded)));
  }, []);

  const isFavorite = useCallback((id: string | number) => ids.has(String(id)), [ids]);

  const toggleFavorite = useCallback((id: string | number) => {
    const key = String(id);
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      favoritesApi.saveFavorites(Array.from(next));
      return next;
    });
  }, []);

  // Si el admin borra un producto, su id se queda guardado en el dispositivo para siempre
  // (la pantalla de favoritos ya lo filtra de la vista, pero nunca se limpiaba del storage).
  // Se llama con los ids reales del catálogo apenas se cargan, para sacar los que sobran.
  const pruneMissing = useCallback((existingIds: (string | number)[]) => {
    const existingSet = new Set(existingIds.map(String));
    setIds((prev) => {
      const next = new Set(Array.from(prev).filter((id) => existingSet.has(id)));
      if (next.size === prev.size) return prev;
      favoritesApi.saveFavorites(Array.from(next));
      return next;
    });
  }, []);

  const favoriteIds = useMemo(() => Array.from(ids), [ids]);

  const value = useMemo(
    () => ({ favoriteIds, isFavorite, toggleFavorite, pruneMissing }),
    [favoriteIds, isFavorite, toggleFavorite, pruneMissing],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider');
  return ctx;
}
