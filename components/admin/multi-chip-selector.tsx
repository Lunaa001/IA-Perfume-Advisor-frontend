import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AdminColors } from '@/lib/admin-theme';

export type ChipOption = { value: string; label: string };

type Props = {
  options: ChipOption[];
  values: string[];
  onToggle: (value: string) => void;
  onAddCustom: (label: string) => void;
  onRemove: (value: string) => void;
};

export function MultiChipSelector({ options, values, onToggle, onAddCustom, onRemove }: Props) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const confirmAdd = () => {
    const label = draft.trim();
    if (label) onAddCustom(label);
    setDraft('');
    setAdding(false);
  };

  const handleRemove = (option: ChipOption) => {
    Alert.alert('Eliminar categoría', `¿Eliminar la categoría "${option.label}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => onRemove(option.value) },
    ]);
  };

  return (
    <View>
      <View style={styles.wrap}>
        {options.map((option) => {
          const selected = values.includes(option.value);
          return (
            <View
              key={option.value}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? AdminColors.accent : AdminColors.surfaceMuted,
                  borderColor: selected ? AdminColors.accent : AdminColors.border,
                },
              ]}>
              <Pressable onPress={() => onToggle(option.value)} style={styles.chipBody} hitSlop={4}>
                {selected && <Ionicons name="checkmark" size={13} color="#FFFFFF" style={styles.check} />}
                <ThemedText
                  style={[styles.chipLabel, { color: selected ? '#FFFFFF' : AdminColors.muted }]}>
                  {option.label}
                </ThemedText>
              </Pressable>
              <Pressable onPress={() => handleRemove(option)} hitSlop={8} style={styles.removeButton}>
                <Ionicons
                  name="close"
                  size={12}
                  color={selected ? 'rgba(255,255,255,0.8)' : AdminColors.muted}
                />
              </Pressable>
            </View>
          );
        })}

        {!adding && (
          <Pressable
            onPress={() => setAdding(true)}
            style={[styles.chip, styles.addChip, { borderColor: AdminColors.border }]}>
            <Ionicons name="add" size={14} color={AdminColors.muted} />
            <ThemedText style={[styles.chipLabel, { color: AdminColors.muted }]}>
              Agregar
            </ThemedText>
          </Pressable>
        )}
      </View>

      {adding && (
        <View style={styles.addRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Nueva categoría"
            placeholderTextColor={AdminColors.muted}
            autoFocus
            onSubmitEditing={confirmAdd}
            style={[
              styles.addInput,
              { backgroundColor: AdminColors.surface, borderColor: AdminColors.border, color: AdminColors.text },
            ]}
          />
          <Pressable onPress={confirmAdd} style={[styles.confirmButton, { backgroundColor: AdminColors.accent }]}>
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          </Pressable>
          <Pressable
            onPress={() => {
              setAdding(false);
              setDraft('');
            }}
            style={styles.cancelButton}>
            <Ionicons name="close" size={18} color={AdminColors.muted} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 6,
    gap: 4,
  },
  chipBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeButton: {
    padding: 4,
  },
  addChip: {
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  check: {
    marginRight: 4,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  addInput: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  confirmButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
