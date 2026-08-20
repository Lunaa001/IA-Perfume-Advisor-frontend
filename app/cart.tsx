import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '@/components/cart/cart-context';
import { CartItemRow } from '@/components/cart/cart-item-row';
import { BackgroundTexture } from '@/components/chat/background-texture';
import { HeroOverlay } from '@/components/chat/hero-overlay';
import { TopFade } from '@/components/chat/top-fade';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatARS } from '@/lib/cart';

export default function CartScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { items, totalItems, totalPrice, increase, decrease, remove } = useCart();

  const handleRemove = (id: string, name: string) => {
    Alert.alert('Quitar producto', `¿Sacar "${name}" del carrito?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Quitar', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  const handleCheckout = () => {
    Alert.alert('Pedido por WhatsApp', 'Cuando conectemos el backend, esto va a abrir WhatsApp con tu pedido.');
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <BackgroundTexture color={colors.texture} />
      <TopFade />
      <HeroOverlay fadingOut={false} intensity={0.6} />

      <Pressable
        hitSlop={8}
        onPress={() => router.back()}
        style={[styles.closeButton, { top: insets.top + 8 }]}>
        <BlurView intensity={38} tint="light" style={StyleSheet.absoluteFillObject} />
        <View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.bubbleSurfaceOverlay }]}
        />
        <Ionicons name="close" size={20} color={colors.onBubbleSurface} />
      </Pressable>

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <ThemedText style={styles.title}>Tu carrito</ThemedText>
        {items.length > 0 && (
          <ThemedText style={styles.subtitle}>
            {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
          </ThemedText>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={32} color="rgba(255,255,255,0.6)" />
          <ThemedText style={styles.emptyText}>Tu carrito está vacío.</ThemedText>
          <Pressable onPress={() => router.back()} style={styles.emptyButton}>
            <BlurView intensity={38} tint="light" style={StyleSheet.absoluteFillObject} />
            <View
              style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.bubbleSurfaceOverlay }]}
            />
            <ThemedText style={{ color: colors.onBubbleSurface, fontWeight: '600' }}>
              Ver perfumes
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <CartItemRow
              item={item}
              onIncrease={() => increase(item.id)}
              onDecrease={() => decrease(item.id)}
              onRemove={() => handleRemove(item.id, item.name)}
            />
          )}
        />
      )}

      {items.length > 0 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.footerCard}>
            <BlurView intensity={38} tint="light" style={StyleSheet.absoluteFillObject} />
            <View
              style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.bubbleSurfaceOverlay }]}
            />
            <View style={styles.totalRow}>
              <ThemedText style={[styles.totalLabel, { color: colors.onBubbleSurfaceMuted }]}>
                Total
              </ThemedText>
              <ThemedText style={[styles.totalValue, { color: colors.onBubbleSurface }]}>
                {formatARS(totalPrice)}
              </ThemedText>
            </View>
            <Pressable
              onPress={handleCheckout}
              style={[styles.checkoutButton, { backgroundColor: colors.onBubbleSurface }]}>
              <Ionicons name="logo-whatsapp" size={18} color={colors.bubbleSurface} />
              <ThemedText style={[styles.checkoutText, { color: colors.bubbleSurface }]}>
                Pedir por WhatsApp
              </ThemedText>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  closeButton: {
    position: 'absolute',
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 160,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 80,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
  },
  footerCard: {
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
  },
  checkoutText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
