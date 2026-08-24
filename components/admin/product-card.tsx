import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { StatusBadge } from '@/components/admin/status-badge';
import { ThemedText } from '@/components/themed-text';
import { AdminProduct, categoryLabel } from '@/lib/admin-products';
import { AdminColors } from '@/lib/admin-theme';
import { formatARS } from '@/lib/cart';

type Props = {
  product: AdminProduct;
  onPress: () => void;
  onDelete: () => void;
};

export function ProductCard({ product, onPress, onDelete }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: AdminColors.surface, borderColor: AdminColors.border }]}>
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: AdminColors.surfaceMuted }]}>
          <Ionicons name="image-outline" size={22} color={AdminColors.muted} />
        </View>
      )}

      <View style={styles.info}>
        <ThemedText style={[styles.name, { color: AdminColors.text }]} numberOfLines={1}>
          {product.name}
        </ThemedText>
        <ThemedText style={[styles.meta, { color: AdminColors.muted }]} numberOfLines={1}>
          {product.brand} · {product.categories.map(categoryLabel).join(', ')}
        </ThemedText>
        <View style={styles.bottomRow}>
          <ThemedText style={[styles.price, { color: AdminColors.price }]}>
            {formatARS(product.price)}
          </ThemedText>
          <ThemedText style={[styles.stock, { color: AdminColors.muted }]}>
            Stock: {product.stock}
          </ThemedText>
        </View>
        <StatusBadge status={product.status} />
      </View>

      <Pressable hitSlop={10} onPress={onDelete} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={18} color="#C97A3D" />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    padding: 12,
    gap: 12,
    alignItems: 'flex-start',
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
  },
  stock: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
  },
});
