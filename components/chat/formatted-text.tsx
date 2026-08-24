import type { StyleProp, TextStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';

// Convierte el **negrita** y las viñetas "* algo"/"- algo" que devuelve la IA en formato
// Markdown, en texto plano legible (negrita real, viñeta "•"), en vez de mostrar los
// símbolos literales.
export function FormattedText({
  text,
  style,
  numberOfLines,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const withBullets = text
    .replace(/^[ \t]*[*-][ \t]+/gm, '• ')
    // "***negrita y cursiva***" -> lo tratamos como negrita simple (no distinguimos cursiva).
    .replace(/\*{3,}/g, '**');
  const parts = withBullets.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return (
    <ThemedText style={style} numberOfLines={numberOfLines}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <ThemedText key={index} style={[style, { fontWeight: '700' }]}>
              {part.slice(2, -2)}
            </ThemedText>
          );
        }
        // Si queda algun * o ** suelto (par sin cerrar, o cursiva de un solo asterisco que no
        // soportamos), lo sacamos en vez de mostrarlo literal.
        return part.replace(/\*+/g, '');
      })}
    </ThemedText>
  );
}
