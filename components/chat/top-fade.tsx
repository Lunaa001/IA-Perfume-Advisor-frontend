import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

export function TopFade() {
  return (
    <LinearGradient
      colors={['rgba(0,0,0,0.45)', 'transparent']}
      style={styles.fade}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  fade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
});
