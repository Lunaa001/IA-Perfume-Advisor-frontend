import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChipSelector } from '@/components/admin/chip-selector';
import { MultiChipSelector } from '@/components/admin/multi-chip-selector';
import { useProducts } from '@/components/admin/product-context';
import { BackgroundTexture } from '@/components/chat/background-texture';
import { ThemedText } from '@/components/themed-text';
import {
  CATEGORY_SUGGESTIONS,
  formatPriceInput,
  GENDER_OPTIONS,
  GenderType,
  parsePriceInput,
  PerfumeStatus,
  STATUS_OPTIONS,
} from '@/lib/admin-products';
import { AdminColors } from '@/lib/admin-theme';

export default function ProductFormScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getProduct, addProduct, updateProduct, removeProduct } = useProducts();
  const existing = useMemo(() => (id ? getProduct(id) : undefined), [id, getProduct]);
  const isEditing = !!existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [brand, setBrand] = useState(existing?.brand ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [price, setPrice] = useState(existing ? formatPriceInput(String(existing.price)) : '');
  const [stock, setStock] = useState(existing ? String(existing.stock) : '');
  const [imageUrl, setImageUrl] = useState(existing?.imageUrl ?? '');
  const [categories, setCategories] = useState<string[]>(existing?.categories ?? []);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(() => {
    const base = [...CATEGORY_SUGGESTIONS];
    existing?.categories.forEach((c) => {
      if (!base.includes(c)) base.push(c);
    });
    return base;
  });
  const [genderType, setGenderType] = useState<GenderType | null>(existing?.genderType ?? null);
  const [status, setStatus] = useState<PerfumeStatus | null>(existing?.status ?? 'AVAILABLE');

  const toggleCategory = (value: string) => {
    setCategories((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const addCustomCategory = (label: string) => {
    setCategoryOptions((prev) => (prev.includes(label) ? prev : [...prev, label]));
    setCategories((prev) => (prev.includes(label) ? prev : [...prev, label]));
  };

  const removeCategoryOption = (value: string) => {
    setCategoryOptions((prev) => prev.filter((c) => c !== value));
    setCategories((prev) => prev.filter((c) => c !== value));
  };

  const priceValue = parsePriceInput(price);
  const stockValue = Number(stock);
  const canSubmit =
    name.trim().length > 0 &&
    brand.trim().length > 0 &&
    categories.length > 0 &&
    !!genderType &&
    !!status &&
    priceValue > 0 &&
    stock.trim().length > 0 &&
    !Number.isNaN(stockValue) &&
    stockValue >= 0;

  const handleSubmit = () => {
    if (!canSubmit || !genderType || !status) return;

    const draft = {
      name: name.trim(),
      brand: brand.trim(),
      description: description.trim(),
      categories,
      genderType,
      price: priceValue,
      stock: stockValue,
      status,
      imageUrl: imageUrl.trim(),
    };

    if (isEditing && existing) {
      updateProduct(existing.id, draft);
    } else {
      addProduct(draft);
    }
    router.back();
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert('Eliminar producto', `¿Seguro que querés eliminar "${existing.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          removeProduct(existing.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: AdminColors.editBackground }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackgroundTexture color={AdminColors.editTexture} />

      <View style={[styles.header, { paddingTop: insets.top + 12, borderColor: AdminColors.border }]}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="close" size={22} color={AdminColors.text} />
        </Pressable>
        <ThemedText style={[styles.headerTitle, { color: AdminColors.text }]}>
          {isEditing ? 'Editar producto' : 'Nuevo producto'}
        </ThemedText>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.label, { color: AdminColors.muted }]}>Foto del producto</ThemedText>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.photoPreview} contentFit="cover" />
        ) : (
          <View style={[styles.photoPreview, styles.photoPlaceholder, { borderColor: AdminColors.border }]}>
            <Ionicons name="image-outline" size={26} color={AdminColors.muted} />
            <ThemedText style={{ color: AdminColors.muted, fontSize: 12, marginTop: 6 }}>
              Sin imagen todavía
            </ThemedText>
          </View>
        )}
        <TextInput
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="URL de la foto"
          placeholderTextColor={AdminColors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input, { backgroundColor: AdminColors.surface, borderColor: AdminColors.border, color: AdminColors.text }]}
        />

        <ThemedText style={[styles.label, { color: AdminColors.muted }]}>Nombre del perfume</ThemedText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ej: Ámbar Nocturno"
          placeholderTextColor={AdminColors.muted}
          style={[styles.input, { backgroundColor: AdminColors.surface, borderColor: AdminColors.border, color: AdminColors.text }]}
        />

        <ThemedText style={[styles.label, { color: AdminColors.muted }]}>Marca</ThemedText>
        <TextInput
          value={brand}
          onChangeText={setBrand}
          placeholder="Ej: L’Essence"
          placeholderTextColor={AdminColors.muted}
          style={[styles.input, { backgroundColor: AdminColors.surface, borderColor: AdminColors.border, color: AdminColors.text }]}
        />

        <ThemedText style={[styles.label, { color: AdminColors.muted }]}>Descripción</ThemedText>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Notas principales, ocasión de uso, etc."
          placeholderTextColor={AdminColors.muted}
          multiline
          numberOfLines={4}
          style={[
            styles.input,
            styles.textarea,
            { backgroundColor: AdminColors.surface, borderColor: AdminColors.border, color: AdminColors.text },
          ]}
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <ThemedText style={[styles.label, { color: AdminColors.muted }]}>Precio (ARS)</ThemedText>
            <TextInput
              value={price}
              onChangeText={(text) => setPrice(formatPriceInput(text))}
              placeholder="Ej: 58,000"
              placeholderTextColor={AdminColors.muted}
              keyboardType="number-pad"
              style={[styles.input, { backgroundColor: AdminColors.surface, borderColor: AdminColors.border, color: AdminColors.text }]}
            />
          </View>
          <View style={styles.rowItem}>
            <ThemedText style={[styles.label, { color: AdminColors.muted }]}>Stock</ThemedText>
            <TextInput
              value={stock}
              onChangeText={setStock}
              placeholder="0"
              placeholderTextColor={AdminColors.muted}
              keyboardType="number-pad"
              style={[styles.input, { backgroundColor: AdminColors.surface, borderColor: AdminColors.border, color: AdminColors.text }]}
            />
          </View>
        </View>

        <ThemedText style={[styles.label, { color: AdminColors.muted }]}>Categorías</ThemedText>
        <MultiChipSelector
          options={categoryOptions}
          values={categories}
          onToggle={toggleCategory}
          onAddCustom={addCustomCategory}
          onRemove={removeCategoryOption}
        />

        <ThemedText style={[styles.label, { color: AdminColors.muted, marginTop: 16 }]}>Género</ThemedText>
        <ChipSelector options={GENDER_OPTIONS} value={genderType} onChange={setGenderType} />

        <ThemedText style={[styles.label, { color: AdminColors.muted, marginTop: 14 }]}>Estado</ThemedText>
        <ChipSelector options={STATUS_OPTIONS} value={status} onChange={setStatus} />

        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={[
            styles.submitButton,
            { backgroundColor: canSubmit ? AdminColors.accent : AdminColors.border },
          ]}>
          <ThemedText
            style={[styles.submitText, { color: canSubmit ? '#FFFFFF' : AdminColors.muted }]}>
            {isEditing ? 'Guardar cambios' : 'Crear producto'}
          </ThemedText>
        </Pressable>

        {isEditing && (
          <Pressable onPress={handleDelete} style={styles.deleteButton}>
            <ThemedText style={styles.deleteText}>Eliminar producto</ThemedText>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  photoPreview: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    marginBottom: 12,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 15,
    fontWeight: '700',
  },
  deleteButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  deleteText: {
    color: '#C0392B',
    fontSize: 14,
    fontWeight: '600',
  },
});
