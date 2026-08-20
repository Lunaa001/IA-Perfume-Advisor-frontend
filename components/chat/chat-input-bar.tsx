import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onFocus?: () => void;
};

export function ChatInputBar({ value, onChangeText, onSend, onFocus }: Props) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const canSend = value.trim().length > 0;

  return (
    <View style={[styles.inputRow, { paddingBottom: insets.bottom + 10 }]}>
      <View style={[styles.inputContainer, { borderColor: `${colors.onBubbleSurface}1A` }]}>
        <BlurView intensity={38} tint="light" style={StyleSheet.absoluteFillObject} />
        <View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.bubbleSurfaceOverlay }]}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          placeholder="Escribí lo que buscás en un perfume..."
          placeholderTextColor={colors.onBubbleSurfaceMuted}
          style={[styles.input, { color: colors.onBubbleSurface }]}
          multiline
        />
        <Pressable
          onPress={onSend}
          disabled={!canSend}
          hitSlop={8}
          style={[
            styles.sendButton,
            { backgroundColor: canSend ? colors.onBubbleSurface : `${colors.onBubbleSurface}1F` },
          ]}>
          <Ionicons
            name="arrow-up"
            size={18}
            color={canSend ? colors.bubbleSurface : colors.onBubbleSurfaceMuted}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: { paddingHorizontal: 16, paddingTop: 4 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 22,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 6,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
