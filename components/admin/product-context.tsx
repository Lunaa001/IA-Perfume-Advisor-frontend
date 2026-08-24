import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/components/auth/auth-context';
import * as perfumesApi from '@/lib/admin-products';
import { AdminProduct, PerfumeDraft } from '@/lib/admin-products';

type ProductsContextValue = {
  products: AdminProduct[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getProduct: (id: string) => AdminProduct | undefined;
  addProduct: (draft: PerfumeDraft) => Promise<void>;
  updateProduct: (id: string, draft: PerfumeDraft) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

// Estado del catálogo para el panel de admin (CRUD completo). Solo se monta dentro de
// las rutas /admin (ver app/admin/_layout.tsx), así que asumimos que puede no haber
// sesión todavía al momento de mutar y lo validamos explícitamente en cada acción.
export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await perfumesApi.fetchPerfumes();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el catálogo.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getProduct = useCallback(
    (id: string) => products.find((product) => product.id === id),
    [products],
  );

  const addProduct = useCallback(
    async (draft: PerfumeDraft) => {
      if (!session) throw new Error('No hay sesión de administrador activa.');
      const created = await perfumesApi.createPerfume(draft, session.token);
      setProducts((prev) => [created, ...prev]);
    },
    [session],
  );

  const updateProduct = useCallback(
    async (id: string, draft: PerfumeDraft) => {
      if (!session) throw new Error('No hay sesión de administrador activa.');
      const updated = await perfumesApi.updatePerfume(id, draft, session.token);
      setProducts((prev) => prev.map((product) => (product.id === id ? updated : product)));
    },
    [session],
  );

  const removeProduct = useCallback(
    async (id: string) => {
      if (!session) throw new Error('No hay sesión de administrador activa.');
      await perfumesApi.deletePerfume(id, session.token);
      setProducts((prev) => prev.filter((product) => product.id !== id));
    },
    [session],
  );

  const value = useMemo(
    () => ({ products, isLoading, error, refresh, getProduct, addProduct, updateProduct, removeProduct }),
    [products, isLoading, error, refresh, getProduct, addProduct, updateProduct, removeProduct],
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within a ProductsProvider');
  return ctx;
}
