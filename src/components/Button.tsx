import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, radius, spacing, ThemeColors } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

function variantStyles(colors: ThemeColors): Record<Variant, { bg: string; border?: string; text: string }> {
  return {
    primary: { bg: colors.primary, text: colors.primaryText },
    secondary: { bg: 'transparent', border: colors.borderStrong, text: colors.text },
    danger: { bg: colors.dangerMuted, border: colors.danger, text: colors.danger },
    ghost: { bg: 'transparent', text: colors.accent },
  };
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const v = variantStyles(colors)[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        variant === 'ghost' && styles.ghost,
        {
          backgroundColor: v.bg,
          borderWidth: v.border ? 1.5 : 0,
          borderColor: v.border,
          opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <>
          {icon ? (
            <Ionicons
              name={icon}
              size={18}
              color={v.text}
              style={styles.icon}
            />
          ) : null}
          <Text style={[styles.label, { color: v.text }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: { paddingVertical: spacing.sm },
  icon: { marginRight: spacing.sm },
  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
  },
});
