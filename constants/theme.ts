/**
 * Paleta de la marca. Tonos cálidos/neutros pensados para una perfumería boutique.
 */

import { Platform } from 'react-native';

const tintColorLight = '#D4AF37';
const tintColorDark = '#E0BA4C';

export const Colors = {
  light: {
    text: '#1C1C1E',
    background: '#F6F5F3',
    chatBackground: '#D8D5CE',
    card: '#FFFFFF',
    border: '#E4E2DE',
    muted: '#8E8C89',
    tint: tintColorLight,
    icon: '#3A3A3C',
    bubbleSurface: '#FFFFFF',
    bubbleSurfaceOverlay: 'rgba(255,255,255,0.45)',
    onBubbleSurface: '#1C1C1E',
    onBubbleSurfaceMuted: '#6E6E73',
    texture: 'rgba(0,0,0,0.05)',
    textureOnChat: 'rgba(0,0,0,0.09)',
  },
  dark: {
    text: '#F3EFE9',
    background: '#141210',
    chatBackground: '#0E0D0B',
    card: '#1E1B18',
    border: '#2E2A25',
    muted: '#A69C8E',
    tint: tintColorDark,
    icon: '#C7BEB2',
    bubbleSurface: '#FFFFFF',
    bubbleSurfaceOverlay: 'rgba(255,255,255,0.45)',
    onBubbleSurface: '#1C1C1E',
    onBubbleSurfaceMuted: '#6E6E73',
    texture: 'rgba(255,255,255,0.05)',
    textureOnChat: 'rgba(255,255,255,0.09)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
