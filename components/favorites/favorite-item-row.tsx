import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { stockMeta } from '@/components/catalog/catalog-product-card';
import { useFavorites } from '@/components/favorites/favorites-context';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AdminProduct, formatARS } from '@/lib/admin-products';

// Mismo azul marino que el botón "Ingresar" del login.
const CATALOG_ACCENT = '#192637';

type Props = {
  product: AdminProduct;
  onAdd: () => void;
  adding: boolean;
};

export function FavoriteItemRow({ product, onAdd, adding }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { toggleFavorite } = useFavorites();
  const unavailable = product.status !== 'AVAILABLE' || product.stock <= 0;
  const stock = stockMeta(product);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/catalog/[id]', params: { id: product.id } })}
      style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: colors.background }]}>
          <Ionicons name="flask-outline" size={20} color={colors.muted} />
        </View>
      )}

      <View style={styles.info}>
        <ThemedText style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {product.name}
        </ThemedText>
        <View style={styles.brandRow}>
          <ThemedText style={[styles.brand, { color: colors.muted }]} numberOfLines={1}>
            {product.brand}
          </ThemedText>
          <View style={[styles.stockBadge, { backgroundColor: `${stock.color}26` }]}>
            <ThemedText style={[styles.stockText, { color: stock.color }]} numberOfLines={1}>
              {stock.label}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.price, { color: CATALOG_ACCENT }]}>
          {formatARS(product.price)}
        </ThemedText>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={() => toggleFavorite(product.id)} hitSlop={8} style={styles.heartButton}>
          <Ionicons name="heart" size={18} color="#E14B4B" />
        </Pressable>
        <Pressable
          onPress={onAdd}
          disabled={unavailable || adding}
          hitSlop={8}
          style={[styles.addButton, { opacity: unavailable ? 0.4 : adding ? 0.6 : 1 }]}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 10,
    gap: 12,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brand: {
    fontSize: 12,
    flexShrink: 1,
  },
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  stockText: {
    fontSize: 9,
    fontWeight: '700',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heartButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(120,120,120,0.35)',
  },
});
