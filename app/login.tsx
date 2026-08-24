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

import { useAuth } from '@/components/auth/auth-context';
import { BackgroundTexture } from '@/components/chat/background-texture';
import { HeroOverlay } from '@/components/chat/hero-overlay';
import { TopFade } from '@/components/chat/top-fade';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ApiError } from '@/lib/api';

// Login exclusivo para administradores (los clientes navegan el catálogo sin cuenta).
// Se llega acá desde el botón "Iniciar sesión" del chat.
export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const canSubmit = username.trim().length > 0 && password.length > 0 && !submitting;

  // iOS dispara "will" antes de que el teclado termine de aparecer (permite animar en paralelo),
  // Android no tiene esos eventos así que usamos "did". LayoutAnimation acompaña el reacomodo
  // del padding del ScrollView para que no se sienta un salto brusco.
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

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    try {
      await login(username.trim(), password);
      router.replace('/admin');
    } catch (err) {
      // Solo el 401 es "credenciales mal"; cualquier otro error (red, 500, etc.)
      // se muestra como falla de conexión para no dar pistas de más al usuario.
      if (err instanceof ApiError && err.status === 401) {
        setError('Tu usuario o contraseña son incorrectos.');
      } else {
        setError('No se pudo conectar con el servidor. Probá de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
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
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setError(null);
            }}
            placeholder="Usuario"
            placeholderTextColor="rgba(255,255,255,0.5)"
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
              {submitting ? 'Ingresando...' : 'Ingresar'}
            </ThemedText>
          </Pressable>
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
});
