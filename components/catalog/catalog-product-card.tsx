import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useFavorites } from '@/components/favorites/favorites-context';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AdminProduct, formatARS } from '@/lib/admin-products';

// Mismo azul marino que el botón "Ingresar" del login.
const CATALOG_ACCENT = '#192637';

export function stockMeta(product: AdminProduct) {
  if (product.status === 'COMING_SOON') return { label: 'Próximamente', color: '#4C7EA8' };
  if (product.status === 'DISCONTINUED') return { label: 'Descontinuado', color: '#8E8C89' };
  if (product.status !== 'AVAILABLE' || product.stock <= 0) return { label: 'Sin stock', color: '#C0392B' };
  return { label: 'En stock', color: '#3E9B6F' };
}

type Props = {
  product: AdminProduct;
  onAdd: () => void;
  adding: boolean;
};

export function CatalogProductCard({ product, onAdd, adding }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  const unavailable = product.status !== 'AVAILABLE' || product.stock <= 0;
  const stock = stockMeta(product);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/catalog/[id]', params: { id: product.id } })}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.imageWrapper}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder, { backgroundColor: colors.background }]}>
            <Ionicons name="flask-outline" size={24} color={colors.muted} />
          </View>
        )}
        <Pressable
          onPress={() => toggleFavorite(product.id)}
          hitSlop={8}
          style={styles.favoriteButton}>
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={16}
            color={favorite ? '#E14B4B' : '#FFFFFF'}
          />
        </Pressable>
      </View>

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

        <View style={styles.bottomRow}>
          <ThemedText style={[styles.price, { color: CATALOG_ACCENT }]} numberOfLines={1}>
            {formatARS(product.price)}
          </ThemedText>
          <Pressable
            onPress={onAdd}
            disabled={unavailable || adding}
            hitSlop={8}
            style={[
              styles.addButton,
              { opacity: unavailable ? 0.4 : adding ? 0.6 : 1 },
            ]}>
            <Ionicons name="add" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  info: {
    padding: 10,
    gap: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  brand: {
    fontSize: 11,
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
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  addButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(120,120,120,0.35)',
  },
});
