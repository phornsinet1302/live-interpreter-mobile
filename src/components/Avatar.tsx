import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { fonts, ThemeColors } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';

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
  uri?: string | null;
}

export function Avatar({ name, size = 44, uri }: AvatarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.base, shape]} />;
  }

  return (
    <View style={[styles.base, shape]}>
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>
        {initialsOf(name)}
      </Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    base: {
      backgroundColor: colors.accentMuted,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    text: { color: colors.accent, fontFamily: fonts.sansBold },
  });
}
