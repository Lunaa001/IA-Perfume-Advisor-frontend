import { Stack } from 'expo-router';

// Agrupa las rutas del catálogo (listado, detalle y favoritos) bajo un mismo stack sin header propio.
export default function CatalogLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="favorites" />
    </Stack>
  );
}
