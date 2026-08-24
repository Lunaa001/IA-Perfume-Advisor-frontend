import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useCart } from '@/components/cart/cart-context';
import { useFavorites } from '@/components/favorites/favorites-context';
import { FormattedText } from '@/components/chat/formatted-text';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatARS } from '@/lib/cart';
import type { RecommendationItem } from '@/lib/chat';

// Mismo azul marino que el botón "Ingresar" del login.
const CATALOG_ACCENT = '#192637';

// Tarjeta de un perfume que la IA recomendó dentro de la conversación, con acción
// rápida de agregar al carrito sin tener que salir del chat.
export function RecommendationCard({ item }: { item: RecommendationItem }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(item.perfumeId);
  // Estado local por tarjeta: si la IA recomienda varios perfumes en el mismo mensaje,
  // cada uno muestra su propio feedback de "Agregado" sin afectar a los demás.
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

      <Pressable
        onPress={() => toggleFavorite(item.perfumeId)}
        hitSlop={8}
        style={styles.favoriteButton}>
        <Ionicons
          name={favorite ? 'heart' : 'heart-outline'}
          size={17}
          color={favorite ? '#E14B4B' : colors.onBubbleSurface}
        />
      </Pressable>

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
        <FormattedText
          style={[styles.description, { color: colors.onBubbleSurfaceMuted }]}
          text={item.description}
          numberOfLines={3}
        />
      )}

      <Pressable
        onPress={handleAdd}
        disabled={status !== 'idle'}
        style={[
          styles.addButton,
          { backgroundColor: CATALOG_ACCENT, opacity: status === 'adding' ? 0.6 : 1 },
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
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(120,120,120,0.3)',
  },
  topRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 26,
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
