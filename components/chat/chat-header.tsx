import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '@/components/cart/cart-context';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const HEADER_CLEARANCE = 54;

export function ChatHeader() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { totalItems } = useCart();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Pressable
        hitSlop={8}
        onPress={() => router.push('/login')}
        style={styles.pillBubble}>
        <BlurView intensity={38} tint="light" style={StyleSheet.absoluteFillObject} />
        <View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.bubbleSurfaceOverlay }]}
        />
        <Ionicons name="person-outline" size={16} color={colors.onBubbleSurface} />
        <ThemedText style={[styles.pillText, { color: colors.onBubbleSurface }]}>
          Iniciar sesión
        </ThemedText>
      </Pressable>

      <View style={styles.cartWrapper}>
        <Pressable
          hitSlop={8}
          onPress={() => router.push('/cart')}
          style={styles.cartBubble}>
          <BlurView intensity={38} tint="light" style={StyleSheet.absoluteFillObject} />
          <View
            style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.bubbleSurfaceOverlay }]}
          />
          <Ionicons name="cart-outline" size={19} color={colors.onBubbleSurface} />
        </Pressable>

        {totalItems > 0 && (
          <View style={styles.badge} pointerEvents="none">
            <ThemedText style={styles.badgeText}>{totalItems > 9 ? '9+' : totalItems}</ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  pillBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    overflow: 'hidden',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  cartWrapper: {
    width: 38,
    height: 38,
  },
  cartBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E14B4B',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
});
