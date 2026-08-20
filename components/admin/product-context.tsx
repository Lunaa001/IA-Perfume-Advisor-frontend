import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { AdminProduct, MOCK_PRODUCTS } from '@/lib/admin-products';

type ProductDraft = Omit<AdminProduct, 'id'>;

type ProductsContextValue = {
  products: AdminProduct[];
  getProduct: (id: string) => AdminProduct | undefined;
  addProduct: (draft: ProductDraft) => void;
  updateProduct: (id: string, draft: ProductDraft) => void;
  removeProduct: (id: string) => void;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<AdminProduct[]>(MOCK_PRODUCTS);

  const getProduct = useCallback(
    (id: string) => products.find((product) => product.id === id),
    [products],
  );

  const addProduct = useCallback((draft: ProductDraft) => {
    setProducts((prev) => [{ id: Date.now().toString(), ...draft }, ...prev]);
  }, []);

  const updateProduct = useCallback((id: string, draft: ProductDraft) => {
    setProducts((prev) => prev.map((product) => (product.id === id ? { id, ...draft } : product)));
  }, []);

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  }, []);

  const value = useMemo(
    () => ({ products, getProduct, addProduct, updateProduct, removeProduct }),
    [products, getProduct, addProduct, updateProduct, removeProduct],
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within a ProductsProvider');
  return ctx;
}
