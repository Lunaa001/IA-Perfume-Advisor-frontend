import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { BackgroundTexture } from './background-texture';

type Props = {
  fadingOut: boolean;
  /** 0-1 multiplier applied to the gradient's darkness. Defaults to full intensity. */
  intensity?: number;
};

// Degradado oscuro sobre el fondo del hero para que el header y el texto se lean bien
// encima de la imagen/textura; se desvanece cuando arranca la conversación (fadingOut).
export function HeroOverlay({ fadingOut, intensity = 1 }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;
  const alpha = (base: number) => base * intensity;

  useEffect(() => {
    if (!fadingOut) return;

    Animated.timing(opacity, {
      toValue: 0,
      duration: 550,
      useNativeDriver: true,
    }).start();
  }, [fadingOut, opacity]);

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, { opacity }]} pointerEvents="none">
      <LinearGradient
        colors={[
          `rgba(8,8,8,${alpha(0.92)})`,
          `rgba(18,18,18,${alpha(0.75)})`,
          `rgba(30,30,30,${alpha(0.45)})`,
          `rgba(30,30,30,${alpha(0.15)})`,
          'transparent',
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <BackgroundTexture color="rgba(255,255,255,0.07)" />
    </Animated.View>
  );
}
