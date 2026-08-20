import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import type { ChatMessage } from './types';

export function MessageBubble({ message }: { message: ChatMessage }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAssistant,
          { borderColor: colors.border },
          !isUser && { backgroundColor: colors.card },
        ]}>
        {isUser && (
          <>
            <BlurView intensity={38} tint="light" style={StyleSheet.absoluteFillObject} />
            <View
              style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: colors.bubbleSurfaceOverlay },
              ]}
            />
          </>
        )}
        <ThemedText style={{ color: isUser ? colors.onBubbleSurface : colors.text }}>
          {message.text}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  rowUser: { justifyContent: 'flex-end' },
  rowAssistant: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  bubbleUser: { borderTopRightRadius: 4 },
  bubbleAssistant: { borderTopLeftRadius: 4 },
});
