import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, radius, spacing } from '@/utils/theme';

interface ChipProps {
  label: string;
  tone?: 'primary' | 'muted';
  style?: ViewStyle;
}

export function Chip({ label, tone = 'muted', style }: ChipProps) {
  const bg = tone === 'primary' ? colors.accentMuted : colors.surfaceHigh;
  const fg = tone === 'primary' ? colors.accent : colors.textMuted;

  return (
    <View style={[styles.base, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: { fontFamily: fonts.sansSemiBold, fontSize: 12, letterSpacing: 0.3 },
});
