import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  info: '#5856D6',
  light: '#F2F2F7',
  dark: '#1C1C1E',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8E8E93',
  grayLight: '#C7C7CC',
  background: '#F2F2F7',
};

export const SIZES = {
  // Margins & Paddings
  base: 8,
  small: 12,
  medium: 16,
  large: 24,
  extraLarge: 32,

  // Font Sizes
  h1: 32,
  h2: 24,
  h3: 18,
  body: 14,
  small: 12,

  // App Dimensions
  width,
  height,
};

export const FONTS = {
  h1: {
    fontSize: SIZES.h1,
    fontWeight: '700',
  },
  h2: {
    fontSize: SIZES.h2,
    fontWeight: '600',
  },
  h3: {
    fontSize: SIZES.h3,
    fontWeight: '600',
  },
  body: {
    fontSize: SIZES.body,
    fontWeight: '400',
  },
  small: {
    fontSize: SIZES.small,
    fontWeight: '400',
  },
}; 