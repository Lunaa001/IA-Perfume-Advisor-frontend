import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AuthProvider } from '@/components/auth/auth-context';
import { CartProvider } from '@/components/cart/cart-context';
import { FavoritesProvider } from '@/components/favorites/favorites-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Layout raíz: monta los providers globales (auth, carrito, favoritos) una sola vez
// y define el stack de rutas de primer nivel. Todo lo que cuelga de acá comparte esa sesión/estado.
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="login" />
                <Stack.Screen name="admin" />
                <Stack.Screen name="cart" />
                <Stack.Screen name="catalog" />
              </Stack>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
