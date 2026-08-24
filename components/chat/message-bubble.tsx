import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { FormattedText } from '@/components/chat/formatted-text';
import { RecommendationCard } from '@/components/chat/recommendation-card';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import type { ChatMessage } from './types';

// Renderiza un mensaje del chat (usuario o IA), y si el mensaje trae recomendaciones
// o un CTA (ej. "Ver catálogo") los muestra debajo de la burbuja de texto.
export function MessageBubble({ message }: { message: ChatMessage }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View style={styles.column}>
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleAssistant,
            { borderColor: colors.border },
            !isUser && { backgroundColor: colors.card },
          ]}>
          {/* El efecto vidrio (blur) es solo para la burbuja del usuario; la de la IA
              usa una tarjeta sólida (colors.card) para diferenciarlas a simple vista. */}
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
          <FormattedText
            text={message.text}
            style={{ color: isUser ? colors.onBubbleSurface : colors.text }}
          />
        </View>

        {message.recommendations?.map((item) => (
          <RecommendationCard key={item.perfumeId} item={item} />
        ))}

        {message.cta && (
          <Pressable
            onPress={() => router.push(message.cta!.href)}
            style={[styles.ctaButton, { backgroundColor: colors.onBubbleSurface }]}>
            <ThemedText style={[styles.ctaText, { color: colors.bubbleSurface }]}>
              {message.cta.label}
            </ThemedText>
            <Ionicons name="arrow-forward" size={15} color={colors.bubbleSurface} />
          </Pressable>
        )}
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
  column: {
    maxWidth: '80%',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  bubbleUser: { borderTopRightRadius: 4 },
  bubbleAssistant: { borderTopLeftRadius: 4 },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
