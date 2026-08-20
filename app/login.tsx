import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackgroundTexture } from '@/components/chat/background-texture';
import { HeroOverlay } from '@/components/chat/hero-overlay';
import { TopFade } from '@/components/chat/top-fade';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Credenciales de prueba: todavía no hay conexión con el backend de autenticación.
const FAKE_ADMIN_EMAIL = 'admin@perfumerie.com';
const FAKE_ADMIN_PASSWORD = 'Admin1234';

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const canSubmit = email.trim().length > 0 && password.length > 0;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSubmit = () => {
    if (!canSubmit) return;

    const matches =
      email.trim().toLowerCase() === FAKE_ADMIN_EMAIL && password === FAKE_ADMIN_PASSWORD;

    if (!matches) {
      setError('Tu contraseña es incorrecta o el mail no existe.');
      return;
    }

    router.replace('/admin');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackgroundTexture color={colors.texture} />
      <TopFade />
      <HeroOverlay fadingOut={false} intensity={0.5} />

      <Pressable
        hitSlop={8}
        onPress={() => router.back()}
        style={[styles.closeButton, { top: insets.top + 8 }]}>
        <BlurView intensity={38} tint="light" style={StyleSheet.absoluteFillObject} />
        <View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.bubbleSurfaceOverlay }]}
        />
        <Ionicons name="close" size={20} color={colors.onBubbleSurface} />
      </Pressable>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          keyboardVisible
            ? { paddingTop: insets.top + 70, paddingBottom: 24 }
            : { paddingTop: 0, paddingBottom: 160 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <ThemedText style={styles.title}>Acceso administradores</ThemedText>
          <ThemedText style={styles.subtitle}>Ingresá tus credenciales para continuar</ThemedText>

          <TextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(null);
            }}
            placeholder="Email"
            placeholderTextColor="rgba(255,255,255,0.5)"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <View style={[styles.input, styles.passwordRow]}>
            <TextInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
              placeholder="Contraseña"
              placeholderTextColor="rgba(255,255,255,0.5)"
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
            />
            <Pressable hitSlop={8} onPress={() => setShowPassword((prev) => !prev)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="rgba(255,255,255,0.6)"
              />
            </Pressable>
          </View>

          {error && (
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          )}

          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[
              styles.submitButton,
              { backgroundColor: canSubmit ? '#192637' : '#FFFFFF' },
            ]}>
            <ThemedText
              style={[styles.submitText, { color: canSubmit ? '#FFFFFF' : '#5C5A57' }]}>
              Ingresar
            </ThemedText>
          </Pressable>

          <ThemedText style={styles.demoHint}>
            Demo: {FAKE_ADMIN_EMAIL} / {FAKE_ADMIN_PASSWORD}
          </ThemedText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  closeButton: {
    position: 'absolute',
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 10,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(80, 80, 85, 0.45)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(5, 5, 5, 0.12)',
    borderRadius: 24,
    padding: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 28,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 12,
    color: '#FFFFFF',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 0,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
    color: '#FFFFFF',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    marginTop: -4,
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 15,
    fontWeight: '600',
  },
  demoHint: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 14,
  },
});
