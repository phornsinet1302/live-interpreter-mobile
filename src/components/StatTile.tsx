import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { fonts, radius, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';

interface StatTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

export function StatTile({ icon, label, value }: StatTileProps) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <Card style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={16} color={colors.accent} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Card>
  );
}

function createStyles(colors: ThemeColors, typography: ThemeTypography) {
  return StyleSheet.create({
    card: { flexBasis: '47%', flexGrow: 1, paddingVertical: spacing.md },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: radius.md,
      backgroundColor: colors.accentMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    value: { fontFamily: fonts.serifBold, fontSize: 22, color: colors.text },
    label: { ...typography.caption, marginTop: 2 },
  });
}
