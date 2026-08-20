import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CartItem, formatARS } from '@/lib/cart';

type Props = {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
};

export function CartItemRow({ item, onIncrease, onDecrease, onRemove }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.card}>
      <BlurView intensity={38} tint="light" style={StyleSheet.absoluteFillObject} />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.bubbleSurfaceOverlay }]} />

      <Image source={{ uri: item.imageUrl }} style={styles.thumb} contentFit="cover" />

      <View style={styles.info}>
        <ThemedText style={[styles.name, { color: colors.onBubbleSurface }]} numberOfLines={1}>
          {item.name}
        </ThemedText>
        <ThemedText style={[styles.brand, { color: colors.onBubbleSurfaceMuted }]} numberOfLines={1}>
          {item.brand} · {formatARS(item.price)}
        </ThemedText>

        <View style={styles.bottomRow}>
          <View style={[styles.stepper, { borderColor: `${colors.onBubbleSurface}1A` }]}>
            <Pressable hitSlop={8} onPress={onDecrease} style={styles.stepperButton}>
              <Ionicons name="remove" size={14} color={colors.onBubbleSurface} />
            </Pressable>
            <ThemedText style={[styles.stepperValue, { color: colors.onBubbleSurface }]}>
              {item.quantity}
            </ThemedText>
            <Pressable hitSlop={8} onPress={onIncrease} style={styles.stepperButton}>
              <Ionicons name="add" size={14} color={colors.onBubbleSurface} />
            </Pressable>
          </View>

          <ThemedText style={[styles.subtotal, { color: colors.onBubbleSurface }]}>
            {formatARS(item.price * item.quantity)}
          </ThemedText>
        </View>
      </View>

      <Pressable hitSlop={10} onPress={onRemove} style={styles.removeButton}>
        <Ionicons name="trash-outline" size={17} color={colors.onBubbleSurfaceMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 12,
    gap: 12,
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  brand: {
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    paddingHorizontal: 4,
  },
  stepperButton: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 18,
    textAlign: 'center',
  },
  subtotal: {
    fontSize: 14,
    fontWeight: '700',
  },
  removeButton: {
    padding: 4,
  },
});
