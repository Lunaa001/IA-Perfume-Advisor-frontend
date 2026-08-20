import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PerfumeStatus, statusMeta } from '@/lib/admin-products';

export function StatusBadge({ status }: { status: PerfumeStatus }) {
  const meta = statusMeta(status);

  return (
    <View style={[styles.badge, { backgroundColor: `${meta.color}1A` }]}>
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <ThemedText style={[styles.label, { color: meta.color }]}>{meta.label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
