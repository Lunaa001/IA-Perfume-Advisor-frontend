import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/components/auth/auth-context';
import { ProductsProvider } from '@/components/admin/product-context';
import { Colors } from '@/constants/theme';

// Guardia de acceso: mientras se resuelve la sesión mostramos un loader, y si quien
// entra no es admin lo mandamos al login. ProductsProvider se monta recién acá para no
// pedir el catálogo de admin a nadie que no haya pasado el chequeo.
export default function AdminLayout() {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.background }}>
        <ActivityIndicator color={Colors.light.tint} />
      </View>
    );
  }

  if (!isAdmin) {
    return <Redirect href="/login" />;
  }

  return (
    <ProductsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="product-form" />
      </Stack>
    </ProductsProvider>
  );
}
