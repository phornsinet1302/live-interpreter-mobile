import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Chip } from '@/components/Chip';
import { fonts, spacing, ThemeColors } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';

interface NextStepSuggestionsProps {
  suggestions: string[];
}

/** A row of short "what to say next" suggestions, generated live from the transcript so far. */
export function NextStepSuggestions({ suggestions }: NextStepSuggestionsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (suggestions.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.label}>
        <Ionicons name="bulb-outline" size={12} color={colors.accent} />
        <Text style={styles.labelText}>Try saying</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.row}>
        {suggestions.map((s, i) => (
          <Chip key={`${i}-${s}`} label={s} tone="muted" style={styles.chip} />
        ))}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
    label: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.xs },
    labelText: { fontFamily: fonts.sansSemiBold, fontSize: 10, color: colors.accent, letterSpacing: 0.5, textTransform: 'uppercase' },
    scroll: { flexGrow: 0, height: 36 },
    row: { gap: spacing.xs },
    chip: { marginRight: 0 },
  });
}
