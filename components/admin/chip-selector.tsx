import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AdminColors } from '@/lib/admin-theme';

type Option<T extends string> = { value: T; label: string; color?: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
};

// Selector de una sola opción en forma de chips horizontales. Genérico en T para
// poder reusarlo tanto con género como con estado del producto en el form de admin.
export function ChipSelector<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
      {options.map((option) => {
        const selected = option.value === value;
        const activeColor = option.color ?? AdminColors.accent;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? activeColor : AdminColors.surfaceMuted,
                borderColor: selected ? activeColor : AdminColors.border,
              },
            ]}>
            <ThemedText
              style={[
                styles.chipLabel,
                { color: selected ? '#FFFFFF' : AdminColors.muted },
              ]}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexGrow: 0,
    marginBottom: 4,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
