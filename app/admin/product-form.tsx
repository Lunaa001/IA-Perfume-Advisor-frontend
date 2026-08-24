import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChipSelector } from '@/components/admin/chip-selector';
import { ChipOption, MultiChipSelector } from '@/components/admin/multi-chip-selector';
import { useProducts } from '@/components/admin/product-context';
import { useAuth } from '@/components/auth/auth-context';
import { BackgroundTexture } from '@/components/chat/background-texture';
import { ThemedText } from '@/components/themed-text';
import {
  CATEGORY_OPTIONS,
  formatPriceInput,
  GENDER_OPTIONS,
  GenderType,
  parsePriceInput,
  PerfumeStatus,
  STATUS_OPTIONS,
  uploadPerfumeImage,
} from '@/lib/admin-products';
import { AdminColors } from '@/lib/admin-theme';

// Formulario de alta/edición de un perfume del admin. Se reutiliza para ambos casos:
// si viene un "id" por params precarga los datos existentes (isEditing), si no arranca vacío.
export default function ProductFormScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getProduct, addProduct, updateProduct, removeProduct } = useProducts();
  const { session } = useAuth();
  const existing = useMemo(() => (id ? getProduct(id) : undefined), [id, getProduct]);
  const isEditing = !!existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [brand, setBrand] = useState(existing?.brand ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [price, setPrice] = useState(existing ? formatPriceInput(String(existing.price)) : '');
  const [stock, setStock] = useState(existing ? String(existing.stock) : '');
  const [imageUrl, setImageUrl] = useState(existing?.imageUrl ?? '');
  const [categories, setCategories] = useState<string[]>(existing?.categories ?? []);
  // Si el producto ya tenía categorías "custom" (agregadas a mano, fuera de CATEGORY_OPTIONS),
  // las sumamos a la lista de chips para que aparezcan seleccionables igual que las predefinidas.
  const [categoryOptions, setCategoryOptions] = useState<ChipOption[]>(() => {
    const base: ChipOption[] = [...CATEGORY_OPTIONS];
    existing?.categories.forEach((value) => {
      if (!base.some((option) => option.value === value)) {
        base.push({ value, label: value });
      }
    });
    return base;
  });
  const [genderType, setGenderType] = useState<GenderType | null>(existing?.genderType ?? null);
  const [status, setStatus] = useState<PerfumeStatus | null>(existing?.status ?? 'AVAILABLE');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const toggleCategory = (value: string) => {
    setCategories((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const addCustomCategory = (label: string) => {
    setCategoryOptions((prev) =>
      prev.some((option) => option.value === label) ? prev : [...prev, { value: label, label }],
    );
    setCategories((prev) => (prev.includes(label) ? prev : [...prev, label]));
  };

  const removeCategoryOption = (value: string) => {
    setCategoryOptions((prev) => prev.filter((option) => option.value !== value));
    setCategories((prev) => prev.filter((c) => c !== value));
  };

  // Punto de entrada común para "Galería" y "Archivo": ambos pickers terminan acá,
  // que es lo que sube la imagen ya elegida al backend y llena el campo imageUrl.
  const uploadPickedImage = async (uri: string, name: string, mimeType: string) => {
    if (!session) {
      Alert.alert('Error', 'No hay sesión de administrador activa.');
      return;
    }
    setUploadingImage(true);
    try {
      const url = await uploadPerfumeImage(uri, name, mimeType, session.token);
      setImageUrl(url);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo subir la imagen.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso necesario', 'Activá el acceso a tus fotos para elegir una imagen.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    await uploadPickedImage(asset.uri, asset.fileName ?? 'foto.jpg', asset.mimeType ?? 'image/jpeg');
  };

  const handlePickFromFiles = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'image/*', copyToCacheDirectory: true });
    if (result.canceled) return;

    const asset = result.assets[0];
    await uploadPickedImage(asset.uri, asset.name, asset.mimeType ?? 'image/jpeg');
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
    stockValue >= 0 &&
    !submitting;

  const handleSubmit = async () => {
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

    setSubmitting(true);
    try {
      if (isEditing && existing) {
        await updateProduct(existing.id, draft);
      } else {
        await addProduct(draft);
      }
      router.back();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo guardar el producto.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert('Eliminar producto', `¿Seguro que querés eliminar "${existing.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeProduct(existing.id);
            router.back();
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo eliminar el producto.');
          }
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
        <View style={styles.photoWrapper}>
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

          {uploadingImage && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator color="#FFFFFF" />
              <ThemedText style={styles.uploadingText}>Subiendo imagen...</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.pickerRow}>
          <Pressable
            onPress={handlePickFromGallery}
            disabled={uploadingImage}
            style={[styles.pickerButton, { backgroundColor: AdminColors.surfaceMuted, borderColor: AdminColors.border }]}>
            <Ionicons name="images-outline" size={16} color={AdminColors.text} />
            <ThemedText style={[styles.pickerButtonText, { color: AdminColors.text }]}>Galería</ThemedText>
          </Pressable>
          <Pressable
            onPress={handlePickFromFiles}
            disabled={uploadingImage}
            style={[styles.pickerButton, { backgroundColor: AdminColors.surfaceMuted, borderColor: AdminColors.border }]}>
            <Ionicons name="folder-outline" size={16} color={AdminColors.text} />
            <ThemedText style={[styles.pickerButtonText, { color: AdminColors.text }]}>Archivo</ThemedText>
          </Pressable>
        </View>

        <ThemedText style={[styles.label, { color: AdminColors.muted, marginTop: 4 }]}>O pegá un link</ThemedText>
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
            {submitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
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
  photoWrapper: {
    marginBottom: 12,
  },
  photoPreview: {
    width: '100%',
    height: 160,
    borderRadius: 16,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  uploadingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  pickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingVertical: 10,
  },
  pickerButtonText: {
    fontSize: 13,
    fontWeight: '600',
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
