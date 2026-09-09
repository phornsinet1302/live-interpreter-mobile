import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useAppPreferences } from '@/hooks/useAppPreferences';
import {
  buildTypography,
  darkColors,
  fonts,
  lightColors,
  radius,
  shadows,
  spacing,
} from '@/utils/theme';

export function useTheme() {
  const { preferences } = useAppPreferences();
  const systemScheme = useColorScheme();
  const scheme = preferences.theme === 'system' ? systemScheme ?? 'light' : preferences.theme;
  const colors = scheme === 'dark' ? darkColors : lightColors;
  const typography = useMemo(() => buildTypography(colors), [colors]);

  return { colors, typography, fonts, spacing, radius, shadows, scheme };
}
