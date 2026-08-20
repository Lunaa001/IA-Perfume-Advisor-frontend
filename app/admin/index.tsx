import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/admin/product-card';
import { useProducts } from '@/components/admin/product-context';
import { BackgroundTexture } from '@/components/chat/background-texture';
import { ThemedText } from '@/components/themed-text';
import { AdminColors } from '@/lib/admin-theme';

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { products, removeProduct } = useProducts();
  const [search, setSearch] = useState('');
  const [listVisible, setListVisible] = useState(true);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) || product.brand.toLowerCase().includes(query),
    );
  }, [products, search]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Eliminar producto', `¿Seguro que querés eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removeProduct(id) },
    ]);
  };

  return (
    <View style={[styles.flex, { backgroundColor: AdminColors.background }]}>
      <BackgroundTexture color={AdminColors.texture} />

      <View style={[styles.header, { paddingTop: insets.top + 12, borderColor: AdminColors.borderOnDark }]}>
        <Pressable hitSlop={10} onPress={() => router.replace('/')} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={22} color={AdminColors.textOnDark} />
        </Pressable>
        <View style={styles.headerTitles}>
          <ThemedText style={[styles.title, { color: AdminColors.textOnDark }]}>Catálogo</ThemedText>
          <ThemedText style={[styles.subtitle, { color: AdminColors.mutedOnDark }]}>
            {products.length} {products.length === 1 ? 'producto' : 'productos'}
          </ThemedText>
        </View>
        <View style={styles.iconButton} />
      </View>

      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: AdminColors.surface, borderColor: AdminColors.border }]}>
          <Ionicons name="search" size={16} color={AdminColors.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nombre o marca"
            placeholderTextColor={AdminColors.muted}
            style={[styles.searchInput, { color: AdminColors.text }]}
          />
        </View>

        <Pressable
          hitSlop={8}
          onPress={() => {
            setSearch('');
            setListVisible(true);
          }}
          style={[styles.clearButton, { backgroundColor: AdminColors.surface, borderColor: AdminColors.border }]}>
          <Ionicons name="close" size={16} color={AdminColors.muted} />
        </Pressable>
      </View>

      <Pressable onPress={() => setListVisible((prev) => !prev)} style={styles.toggleRow} hitSlop={6}>
        <ThemedText style={[styles.toggleText, { color: AdminColors.mutedOnDark }]}>
          {listVisible ? 'Ocultar listado' : 'Mostrar listado'}
        </ThemedText>
        <Ionicons
          name={listVisible ? 'chevron-up' : 'chevron-down'}
          size={13}
          color={AdminColors.mutedOnDark}
        />
      </Pressable>

      {listVisible && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => router.push({ pathname: '/admin/product-form', params: { id: item.id } })}
              onDelete={() => handleDelete(item.id, item.name)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="flask-outline" size={28} color={AdminColors.mutedOnDark} />
              <ThemedText style={{ color: AdminColors.mutedOnDark, marginTop: 8 }}>
                No se encontraron productos.
              </ThemedText>
            </View>
          }
        />
      )}

      <Pressable
        onPress={() => router.push('/admin/product-form')}
        style={[styles.fab, { backgroundColor: AdminColors.accent, bottom: insets.bottom + 20 }]}>
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    marginTop: 10,
    paddingVertical: 4,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
});
