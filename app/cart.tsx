import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '@/components/cart/cart-context';
import { CartItemRow } from '@/components/cart/cart-item-row';
import { BackgroundTexture } from '@/components/chat/background-texture';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatARS } from '@/lib/cart';

// Mismo gris que usan el catálogo y los favoritos.
const CATALOG_BACKGROUND = '#D6D4D1';

export default function CartScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { items, totalItems, totalPrice, isLoading, error, increase, decrease, remove, checkout } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleRemove = (perfumeId: number, name: string) => {
    Alert.alert('Quitar producto', `¿Sacar "${name}" del carrito?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Quitar',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove(perfumeId);
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo quitar el producto.');
          }
        },
      },
    ]);
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const redirect = await checkout();
      await Linking.openURL(redirect.whatsappUrl);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo generar el pedido.');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: CATALOG_BACKGROUND }]}>
      <BackgroundTexture color={colors.texture} />

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
        <ThemedText style={[styles.title, { color: colors.text }]}>Tu carrito</ThemedText>
        {items.length > 0 && (
          <ThemedText style={[styles.subtitle, { color: colors.muted }]}>
            {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
          </ThemedText>
        )}
      </View>

      {isLoading ? (
        <View style={styles.empty}>
          <ActivityIndicator color={colors.tint} />
        </View>
      ) : error ? (
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.muted} />
          <ThemedText style={[styles.emptyText, { color: colors.muted }]}>{error}</ThemedText>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={32} color={colors.muted} />
          <ThemedText style={[styles.emptyText, { color: colors.muted }]}>Tu carrito está vacío.</ThemedText>
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
          keyExtractor={(item) => String(item.perfumeId)}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <CartItemRow
              item={item}
              onIncrease={() => increase(item.perfumeId)}
              onDecrease={() => decrease(item.perfumeId)}
              onRemove={() => handleRemove(item.perfumeId, item.name)}
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
              disabled={checkingOut}
              style={[styles.checkoutButton, { backgroundColor: colors.onBubbleSurface, opacity: checkingOut ? 0.6 : 1 }]}>
              {checkingOut ? (
                <ActivityIndicator color={colors.bubbleSurface} />
              ) : (
                <>
                  <Ionicons name="logo-whatsapp" size={18} color={colors.bubbleSurface} />
                  <ThemedText style={[styles.checkoutText, { color: colors.bubbleSurface }]}>
                    Pedir por WhatsApp
                  </ThemedText>
                </>
              )}
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
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
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
