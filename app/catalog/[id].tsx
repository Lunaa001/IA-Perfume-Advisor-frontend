import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { stockMeta } from '@/components/catalog/catalog-product-card';
import { useCart } from '@/components/cart/cart-context';
import { FormattedText } from '@/components/chat/formatted-text';
import { useFavorites } from '@/components/favorites/favorites-context';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AdminProduct, categoryLabel, fetchPerfumeById, genderLabel } from '@/lib/admin-products';

// Mismo azul marino que el botón "Ingresar" del login.
const CATALOG_ACCENT = '#192637';

// Ficha de un perfume individual: imagen grande, descripción y acción de agregar al carrito.
export default function ProductDetailScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addStatus, setAddStatus] = useState<'idle' | 'adding' | 'added'>('idle');

  useEffect(() => {
    if (!id) return;
    fetchPerfumeById(id)
      .then(setProduct)
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudo cargar el producto.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!product) return;
    setAddStatus('adding');
    try {
      await addItem(Number(product.id));
      setAddStatus('added');
      // Deja el "Agregado al carrito" un rato en pantalla como confirmación visual
      // y después vuelve solo al estado normal del botón.
      setTimeout(() => setAddStatus('idle'), 1800);
    } catch {
      setAddStatus('idle');
    }
  };

  const favorite = product ? isFavorite(product.id) : false;
  const unavailable = product ? product.status !== 'AVAILABLE' || product.stock <= 0 : true;

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.headerButton}>
          <BlurView intensity={38} tint="light" style={StyleSheet.absoluteFillObject} />
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.bubbleSurfaceOverlay }]} />
          <Ionicons name="arrow-back" size={20} color={colors.onBubbleSurface} />
        </Pressable>

        {product && (
          <Pressable hitSlop={10} onPress={() => toggleFavorite(product.id)} style={styles.headerButton}>
            <BlurView intensity={38} tint="light" style={StyleSheet.absoluteFillObject} />
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.bubbleSurfaceOverlay }]} />
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={19}
              color={favorite ? '#E14B4B' : colors.onBubbleSurface}
            />
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.tint} />
        </View>
      ) : error || !product ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={28} color={colors.muted} />
          <ThemedText style={{ color: colors.muted, marginTop: 8 }}>
            {error ?? 'No se encontró el producto.'}
          </ThemedText>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {product.imageUrl ? (
              <Image source={{ uri: product.imageUrl }} style={styles.image} contentFit="cover" />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder, { backgroundColor: colors.card }]}>
                <Ionicons name="flask-outline" size={40} color={colors.muted} />
              </View>
            )}

            <View style={styles.info}>
              <ThemedText style={[styles.brand, { color: colors.muted }]}>{product.brand}</ThemedText>
              <ThemedText style={[styles.name, { color: colors.text }]}>{product.name}</ThemedText>

              <View style={styles.priceRow}>
                <ThemedText style={[styles.price, { color: CATALOG_ACCENT }]}>
                  {`$${Math.round(product.price).toLocaleString('en-US')}`}
                </ThemedText>
                <View style={[styles.stockBadge, { backgroundColor: `${stockMeta(product).color}1A` }]}>
                  <View style={[styles.stockDot, { backgroundColor: stockMeta(product).color }]} />
                  <ThemedText style={[styles.stockText, { color: stockMeta(product).color }]}>
                    {stockMeta(product).label}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.tagsRow}>
                <View style={[styles.tag, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <ThemedText style={[styles.tagText, { color: colors.muted }]}>
                    {genderLabel(product.genderType)}
                  </ThemedText>
                </View>
                {product.categories.map((category) => (
                  <View key={category} style={[styles.tag, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <ThemedText style={[styles.tagText, { color: colors.muted }]}>
                      {categoryLabel(category)}
                    </ThemedText>
                  </View>
                ))}
              </View>

              {!!product.description && (
                <>
                  <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Descripción</ThemedText>
                  <FormattedText style={[styles.description, { color: colors.muted }]} text={product.description} />
                </>
              )}
            </View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background, borderColor: colors.border }]}>
            <Pressable
              onPress={handleAdd}
              disabled={unavailable || addStatus !== 'idle'}
              style={[
                styles.addButton,
                { backgroundColor: unavailable ? colors.border : CATALOG_ACCENT, opacity: addStatus === 'adding' ? 0.6 : 1 },
              ]}>
              <Ionicons
                name={addStatus === 'added' ? 'checkmark' : 'cart-outline'}
                size={18}
                color="#FFFFFF"
              />
              <ThemedText style={styles.addButtonText}>
                {addStatus === 'added' ? 'Agregado al carrito' : 'Agregar al carrito'}
              </ThemedText>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: 120,
  },
  image: {
    width: '100%',
    height: 340,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: 20,
    gap: 4,
  },
  brand: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  tag: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 22,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 15,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
