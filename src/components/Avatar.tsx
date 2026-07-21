import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/utils/theme';

function initialsOf(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
  return (first + last).toUpperCase();
}

interface AvatarProps {
  name?: string | null;
  size?: number;
}

export function Avatar({ name, size = 44 }: AvatarProps) {
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>
        {initialsOf(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: { color: colors.accent, fontFamily: fonts.sansBold },
});
