import React, { useMemo } from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { radius, spacing, shadows, ThemeColors } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';

interface CardProps extends ViewProps {
  elevated?: boolean;
  padded?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export function Card({ elevated, padded = true, style, children, ...rest }: CardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      style={[
        styles.base,
        padded && styles.padded,
        elevated && shadows.card,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    base: {
      backgroundColor: colors.backgroundElevated,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    padded: { padding: spacing.lg },
  });
}
