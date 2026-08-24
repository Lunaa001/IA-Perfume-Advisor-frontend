import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CatalogProductCard } from '@/components/catalog/catalog-product-card';
import { useCart } from '@/components/cart/cart-context';
import { BackgroundTexture } from '@/components/chat/background-texture';
import { useFavorites } from '@/components/favorites/favorites-context';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AdminProduct, fetchPerfumes } from '@/lib/admin-products';

// Un poco más oscuro que el fondo claro de siempre, solo para esta pantalla.
const CATALOG_BACKGROUND = '#D6D4D1';
// Mismo azul marino que el botón "Ingresar" del login.
const CATALOG_ACCENT = '#192637';

type FilterOption = { value: string; label: string; kind: 'gender' | 'category' };

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'FEMALE', label: 'Mujer', kind: 'gender' },
  { value: 'MALE', label: 'Hombre', kind: 'gender' },
  { value: 'UNISEX', label: 'Unisex', kind: 'gender' },
  { value: 'Diseñador', label: 'Diseñador', kind: 'category' },
  { value: 'Árabe', label: 'Árabe', kind: 'category' },
];

export default function CatalogScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { totalItems, addItem } = useCart();
  const { favoriteIds } = useFavorites();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetchPerfumes()
      .then(setProducts)
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudo cargar el catálogo.'))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      if (product.status === 'DISCONTINUED') return false;
      if (query && !product.name.toLowerCase().includes(query) && !product.brand.toLowerCase().includes(query)) {
        return false;
      }
      if (activeFilter) {
        if (activeFilter.kind === 'gender') {
          if (product.genderType !== activeFilter.value) return false;
        } else if (!product.categories.some((c) => c.toLowerCase() === activeFilter.value.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [products, search, activeFilter]);

  const handleAdd = async (product: AdminProduct) => {
    setAddingId(product.id);
    try {
      await addItem(Number(product.id));
    } catch {
      // el error ya queda reflejado en el estado del carrito
    } finally {
      setAddingId(null);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: CATALOG_BACKGROUND }]}>
      <BackgroundTexture color={colors.texture} />

      <View style={[styles.header, { paddingTop: insets.top + 12, borderColor: colors.border }]}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitles}>
          <ThemedText style={[styles.title, { color: colors.text }]}>Catálogo</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.muted }]}>
            {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
          </ThemedText>
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.cartWrapper}>
            <Pressable hitSlop={10} onPress={() => router.push('/catalog/favorites')} style={styles.cartButton}>
              <BlurView intensity={38} tint="light" style={StyleSheet.absoluteFillObject} />
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.bubbleSurfaceOverlay }]} />
              <Ionicons name="heart-outline" size={19} color={colors.onBubbleSurface} />
            </Pressable>
            {favoriteIds.length > 0 && (
              <View style={styles.badge} pointerEvents="none">
                <ThemedText style={styles.badgeText}>
                  {favoriteIds.length > 9 ? '9+' : favoriteIds.length}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.cartWrapper}>
            <Pressable hitSlop={10} onPress={() => router.push('/cart')} style={styles.cartButton}>
              <BlurView intensity={38} tint="light" style={StyleSheet.absoluteFillObject} />
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.bubbleSurfaceOverlay }]} />
              <Ionicons name="cart-outline" size={19} color={colors.onBubbleSurface} />
            </Pressable>
            {totalItems > 0 && (
              <View style={styles.badge} pointerEvents="none">
                <ThemedText style={styles.badgeText}>{totalItems > 9 ? '9+' : totalItems}</ThemedText>
              </View>
            )}
          </View>
        </View>
      </View>

      <Pressable onPress={() => router.back()} style={styles.advisorRow} hitSlop={6}>
        <Ionicons name="sparkles-outline" size={13} color={CATALOG_ACCENT} />
        <ThemedText style={[styles.advisorText, { color: CATALOG_ACCENT }]}>
          Volver a hablar con el asesor IA
        </ThemedText>
      </Pressable>

      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={16} color={colors.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre o marca"
          placeholderTextColor={colors.muted}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      <Pressable onPress={() => setFiltersOpen((prev) => !prev)} style={styles.filterHeader} hitSlop={6}>
        <ThemedText style={[styles.filterLabel, { color: colors.muted }]}>
          Filtrar{activeFilter ? `: ${activeFilter.label}` : ''}
        </ThemedText>
        <Ionicons
          name={filtersOpen ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.muted}
        />
      </Pressable>

      {filtersOpen && (
        <View style={styles.filtersWrap}>
          <Pressable
            onPress={() => setActiveFilter(null)}
            style={[
              styles.chip,
              {
                backgroundColor: !activeFilter ? CATALOG_ACCENT : colors.card,
                borderColor: !activeFilter ? CATALOG_ACCENT : colors.border,
              },
            ]}>
            <ThemedText style={[styles.chipText, { color: !activeFilter ? '#FFFFFF' : colors.muted }]}>
              Todos
            </ThemedText>
          </Pressable>
          {FILTER_OPTIONS.map((option) => {
            const selected = activeFilter?.value === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setActiveFilter(selected ? null : option)}
                style={[
                  styles.chip,
                  { backgroundColor: selected ? CATALOG_ACCENT : colors.card, borderColor: selected ? CATALOG_ACCENT : colors.border },
                ]}>
                <ThemedText style={[styles.chipText, { color: selected ? '#FFFFFF' : colors.muted }]}>
                  {option.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      )}

      {isLoading ? (
        <View style={styles.empty}>
          <ActivityIndicator color={colors.tint} />
        </View>
      ) : error ? (
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={28} color={colors.muted} />
          <ThemedText style={{ color: colors.muted, marginTop: 8 }}>{error}</ThemedText>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <CatalogProductCard product={item} onAdd={() => handleAdd(item)} adding={addingId === item.id} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="flask-outline" size={28} color={colors.muted} />
              <ThemedText style={{ color: colors.muted, marginTop: 8 }}>
                No se encontraron productos.
              </ThemedText>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitles: {
    flex: 1,
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cartWrapper: {
    width: 38,
    height: 38,
  },
  cartButton: {
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
  advisorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 4,
  },
  advisorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  filtersWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  columnWrapper: {
    gap: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
});
