import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, radius, spacing, ThemeColors } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SelectPillGroupProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SelectPillGroup<T extends string>({
  options,
  value,
  onChange,
}: SelectPillGroupProps<T>) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrap}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.pill,
              active && styles.pillActive,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: radius.pill,
      padding: 4,
    },
    pill: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pillActive: { backgroundColor: colors.primary },
    label: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.textMuted },
    labelActive: { color: colors.primaryText },
  });
}
