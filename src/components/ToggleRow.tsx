import React, { useMemo } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, radius, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';

interface ToggleRowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ToggleRow({ icon, label, subtitle, value, onValueChange, disabled }: ToggleRowProps) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <View style={styles.row}>
      {icon ? (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={18} color={colors.accent} />
        </View>
      ) : null}
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.accent }}
        thumbColor={colors.white}
      />
    </View>
  );
}

function createStyles(colors: ThemeColors, typography: ThemeTypography) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: colors.accentMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    text: { flex: 1, marginRight: spacing.sm },
    label: { ...typography.body, fontFamily: fonts.sansMedium },
    subtitle: { ...typography.caption, marginTop: 2 },
  });
}
