import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/components/auth/auth-context';
import { ProductsProvider } from '@/components/admin/product-context';
import { Colors } from '@/constants/theme';

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
