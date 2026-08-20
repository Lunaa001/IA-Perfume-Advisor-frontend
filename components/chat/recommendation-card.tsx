import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useCart } from '@/components/cart/cart-context';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatARS } from '@/lib/cart';
import type { RecommendationItem } from '@/lib/chat';

export function RecommendationCard({ item }: { item: RecommendationItem }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { addItem } = useCart();
  const [status, setStatus] = useState<'idle' | 'adding' | 'added'>('idle');

  const handleAdd = async () => {
    setStatus('adding');
    try {
      await addItem(item.perfumeId);
      setStatus('added');
      setTimeout(() => setStatus('idle'), 1800);
    } catch {
      setStatus('idle');
    }
  };

  return (
    <View style={styles.card}>
      <BlurView intensity={38} tint="light" style={StyleSheet.absoluteFillObject} />
      <View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.bubbleSurfaceOverlay }]}
      />

      <View style={styles.topRow}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.thumb} contentFit="cover" />
        ) : (
          <View
            style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: `${colors.onBubbleSurface}0D` }]}>
            <Ionicons name="flask-outline" size={22} color={colors.onBubbleSurfaceMuted} />
          </View>
        )}

        <View style={styles.info}>
          <ThemedText style={[styles.name, { color: colors.onBubbleSurface }]} numberOfLines={1}>
            {item.name}
          </ThemedText>
          <ThemedText style={[styles.brand, { color: colors.onBubbleSurfaceMuted }]} numberOfLines={1}>
            {item.brand}
          </ThemedText>
          <ThemedText style={[styles.price, { color: colors.onBubbleSurface }]}>
            {formatARS(item.price)}
          </ThemedText>
        </View>
      </View>

      {!!item.description && (
        <ThemedText
          style={[styles.description, { color: colors.onBubbleSurfaceMuted }]}
          numberOfLines={3}>
          {item.description}
        </ThemedText>
      )}

      <Pressable
        onPress={handleAdd}
        disabled={status !== 'idle'}
        style={[
          styles.addButton,
          { backgroundColor: colors.onBubbleSurface, opacity: status === 'adding' ? 0.6 : 1 },
        ]}>
        <Ionicons
          name={status === 'added' ? 'checkmark' : 'cart-outline'}
          size={16}
          color={colors.bubbleSurface}
        />
        <ThemedText style={[styles.addButtonText, { color: colors.bubbleSurface }]}>
          {status === 'added' ? 'Agregado' : 'Agregar al carrito'}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 12,
    marginTop: 6,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    gap: 10,
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
    justifyContent: 'center',
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  brand: {
    fontSize: 12,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
