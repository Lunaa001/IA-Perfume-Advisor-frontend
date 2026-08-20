import { Stack } from 'expo-router';

import { ProductsProvider } from '@/components/admin/product-context';

export default function AdminLayout() {
  return (
    <ProductsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="product-form" />
      </Stack>
    </ProductsProvider>
  );
}
