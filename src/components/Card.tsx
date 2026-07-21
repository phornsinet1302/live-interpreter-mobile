import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { colors, radius, spacing, shadows } from '@/utils/theme';

interface CardProps extends ViewProps {
  elevated?: boolean;
  padded?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export function Card({ elevated, padded = true, style, children, ...rest }: CardProps) {
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

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: { padding: spacing.lg },
});
