import { Platform, TextStyle, ViewStyle } from 'react-native';

export const lightColors = {
  background: '#F4EEE4',
  backgroundElevated: '#FBF8F2',
  surface: '#EAE2D3',
  surfaceHigh: '#E1D6C2',
  primary: '#2C2620',
  primaryMuted: 'rgba(44, 38, 32, 0.08)',
  primaryText: '#FFFFFF',
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

export const darkColors = {
  background: '#18140F',
  backgroundElevated: '#221C15',
  surface: '#2B2419',
  surfaceHigh: '#39301F',
  primary: '#F1E9DA',
  primaryMuted: 'rgba(241, 233, 218, 0.08)',
  primaryText: '#1E1911',
  accent: '#DE8259',
  accentMuted: 'rgba(222, 130, 89, 0.18)',
  text: '#F3ECE0',
  textMuted: '#AA9E8C',
  textFaint: '#7D7364',
  border: '#3A3226',
  borderStrong: 'rgba(243, 236, 224, 0.18)',
  danger: '#E27A62',
  dangerMuted: 'rgba(226, 122, 98, 0.18)',
  white: '#FFFFFF',
};

export type ThemeColors = typeof lightColors;

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

// Line heights below are deliberately generous (~1.5x font size, not the
// ~1.2-1.4x that's plenty for Latin text) — none of the app's custom fonts
// (Playfair Display, Inter) cover Khmer, Chinese, etc., so that content
// silently falls back to the OS's own script-specific font. Khmer in
// particular stacks vowel/diacritic marks well above and below the base
// letter and needs real headroom, or a tight Latin-tuned lineHeight clips
// the tops/bottoms of those marks.
export function buildTypography(colors: ThemeColors): Record<string, TextStyle> {
  return {
    display: {
      fontFamily: fonts.serifBold,
      fontSize: 30,
      color: colors.text,
      lineHeight: 44,
    },
    h1: { fontFamily: fonts.serif, fontSize: 24, color: colors.text, lineHeight: 36 },
    h2: { fontFamily: fonts.serif, fontSize: 20, color: colors.text, lineHeight: 30 },
    h3: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.text, lineHeight: 24 },
    body: { fontFamily: fonts.sans, fontSize: 15, color: colors.text, lineHeight: 24 },
    bodyMuted: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted, lineHeight: 24 },
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
}

export type ThemeTypography = ReturnType<typeof buildTypography>;

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
