import { Platform, TextStyle, ViewStyle } from 'react-native';

export const colors = {
  background: '#F4EEE4',
  backgroundElevated: '#FBF8F2',
  surface: '#EAE2D3',
  surfaceHigh: '#E1D6C2',
  primary: '#2C2620',
  primaryMuted: 'rgba(44, 38, 32, 0.08)',
  accent: '#C1603A',
  accentMuted: 'rgba(193, 96, 58, 0.12)',
  text: '#2B2620',
  textMuted: '#8C8478',
  textFaint: '#A69E8F',
  border: '#E1D7C6',
  borderStrong: 'rgba(44, 38, 32, 0.22)',
  danger: '#B84A3A',
  dangerMuted: 'rgba(184, 74, 58, 0.12)',
  white: '#FFFFFF',
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  xl: 30,
  pill: 999,
};

export const fonts = {
  serif: 'PlayfairDisplay_600SemiBold',
  serifBold: 'PlayfairDisplay_700Bold',
  serifItalic: 'PlayfairDisplay_600SemiBold_Italic',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
};

export const typography: Record<string, TextStyle> = {
  display: {
    fontFamily: fonts.serifBold,
    fontSize: 30,
    color: colors.text,
    lineHeight: 36,
  },
  h1: { fontFamily: fonts.serif, fontSize: 24, color: colors.text, lineHeight: 30 },
  h2: { fontFamily: fonts.serif, fontSize: 20, color: colors.text, lineHeight: 26 },
  h3: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.text },
  body: { fontFamily: fonts.sans, fontSize: 15, color: colors.text, lineHeight: 21 },
  bodyMuted: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted, lineHeight: 21 },
  eyebrow: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: colors.accent,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  caption: { fontFamily: fonts.sans, fontSize: 12, color: colors.textFaint },
};

export const shadows = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#2B2620',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
    },
    android: { elevation: 3 },
    default: {},
  }) as ViewStyle,
};
