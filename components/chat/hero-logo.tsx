import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

type Props = {
  fadingOut: boolean;
};

// Marca de agua del logo detrás del hero. Solo anima en un sentido (aparece visible
// y se apaga una vez); no vuelve a mostrarse aunque "fadingOut" pase a false después.
export function HeroLogo({ fadingOut }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!fadingOut) return;

    Animated.timing(opacity, {
      toValue: 0,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [fadingOut, opacity]);

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      <Image
        source={require('../../assets/images/brand-logo.png')}
        style={styles.logo}
        contentFit="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 70,
  },
  logo: {
    width: 220,
    height: 136,
    opacity: 0.12,
  },
});
