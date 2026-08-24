import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as favoritesApi from '@/lib/favorites';

type FavoritesContextValue = {
  favoriteIds: string[];
  isFavorite: (id: string | number) => boolean;
  toggleFavorite: (id: string | number) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
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

  const favoriteIds = useMemo(() => Array.from(ids), [ids]);

  const value = useMemo(
    () => ({ favoriteIds, isFavorite, toggleFavorite }),
    [favoriteIds, isFavorite, toggleFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider');
  return ctx;
}
