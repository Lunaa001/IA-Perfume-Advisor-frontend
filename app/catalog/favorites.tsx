import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '@/components/cart/cart-context';
import { BackgroundTexture } from '@/components/chat/background-texture';
import { FavoriteItemRow } from '@/components/favorites/favorite-item-row';
import { useFavorites } from '@/components/favorites/favorites-context';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AdminProduct, fetchPerfumes } from '@/lib/admin-products';

const CATALOG_BACKGROUND = '#D6D4D1';

export default function FavoritesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { addItem } = useCart();
  const { favoriteIds } = useFavorites();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPerfumes()
      .then(setProducts)
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudo cargar tus favoritos.'))
      .finally(() => setIsLoading(false));
  }, []);

  const favorites = useMemo(
    () => products.filter((product) => favoriteIds.includes(product.id)),
    [products, favoriteIds],
  );

  const handleAdd = async (product: AdminProduct) => {
    setAddingId(product.id);
    try {
      await addItem(Number(product.id));
    } catch {
      // el error ya queda reflejado en el estado del carrito
    } finally {
      setAddingId(null);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: CATALOG_BACKGROUND }]}>
      <BackgroundTexture color={colors.texture} />

      <View style={[styles.header, { paddingTop: insets.top + 12, borderColor: colors.border }]}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitles}>
          <ThemedText style={[styles.title, { color: colors.text }]}>Tus favoritos</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.muted }]}>
            {favorites.length} {favorites.length === 1 ? 'guardado' : 'guardados'}
          </ThemedText>
        </View>
        <View style={styles.iconButton} />
      </View>

      {isLoading ? (
        <View style={styles.empty}>
          <ActivityIndicator color={colors.tint} />
        </View>
      ) : error ? (
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={28} color={colors.muted} />
          <ThemedText style={{ color: colors.muted, marginTop: 8 }}>{error}</ThemedText>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <FavoriteItemRow product={item} onAdd={() => handleAdd(item)} adding={addingId === item.id} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="heart-outline" size={24} color={colors.muted} />
              <ThemedText style={{ color: colors.muted, marginTop: 8, textAlign: 'center' }}>
                Todavía no guardaste ningún perfume.
              </ThemedText>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitles: {
    flex: 1,
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
});
