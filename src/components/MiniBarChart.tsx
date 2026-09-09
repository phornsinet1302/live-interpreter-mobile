import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DailyStat } from '@/types';
import { colors, fonts, radius, spacing } from '@/utils/theme';

interface MiniBarChartProps {
  data: DailyStat[];
  height?: number;
}

export function MiniBarChart({ data, height = 120 }: MiniBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <View style={[styles.container, { height: height + 24 }]}>
      {data.map((d) => {
        const barHeight = Math.max(4, (d.value / max) * height);
        return (
          <View key={d.label} style={styles.column}>
            <Text style={styles.value}>{d.value}</Text>
            <View style={styles.track}>
              <View style={[styles.bar, { height: barHeight }]} />
            </View>
            <Text style={styles.label}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  column: { flex: 1, alignItems: 'center' },
  value: { fontFamily: fonts.sansSemiBold, fontSize: 10, color: colors.textFaint, marginBottom: 4 },
  track: {
    width: '58%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    minHeight: 4,
  },
  label: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.textMuted, marginTop: spacing.xs },
});
