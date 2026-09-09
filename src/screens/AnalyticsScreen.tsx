import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { StatTile } from '@/components/StatTile';
import { MiniBarChart } from '@/components/MiniBarChart';
import { SelectPillGroup } from '@/components/SelectPillGroup';
import { MOCK_ANALYTICS } from '@/mocks/analytics';
import { colors, fonts, radius, spacing, typography } from '@/utils/theme';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Analytics'>;
type Range = 'day' | 'week' | 'month';

export function AnalyticsScreen() {
  const navigation = useNavigation<Nav>();
  const [range, setRange] = useState<Range>('day');
  const snapshot = MOCK_ANALYTICS;

  const chartData = useMemo(() => {
    if (range === 'day') return snapshot.daily;
    if (range === 'week') return snapshot.weekly;
    return snapshot.monthly;
  }, [range, snapshot]);

  const totalForRange =
    range === 'day' ? snapshot.totalToday : range === 'week' ? snapshot.totalWeek : snapshot.totalMonth;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.previewNote}>Preview data — connect a backend to see live analytics.</Text>

        <View style={styles.statsGrid}>
          <StatTile icon="language-outline" label={`Translations (${range})`} value={String(totalForRange)} />
          <StatTile icon="checkmark-circle-outline" label="Avg. accuracy" value={`${Math.round(snapshot.averageAccuracy * 100)}%`} />
          <StatTile icon="sparkles-outline" label="AI Summary usage" value={String(snapshot.aiSummaryUsage)} />
          <StatTile icon="time-outline" label="History usage" value={String(snapshot.historyUsage)} />
        </View>

        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeader}>Translation activity</Text>
            <View style={styles.pillWrap}>
              <SelectPillGroup
                options={[
                  { value: 'day', label: 'Day' },
                  { value: 'week', label: 'Week' },
                  { value: 'month', label: 'Month' },
                ]}
                value={range}
                onChange={setRange}
              />
            </View>
          </View>
          <MiniBarChart data={chartData} />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardHeader}>Most translated languages</Text>
          {snapshot.languages
            .slice()
            .sort((a, b) => b.count - a.count)
            .map((lang, i) => (
              <View key={lang.language} style={styles.langRow}>
                <Text style={styles.langRank}>{i + 1}</Text>
                <View style={styles.langBody}>
                  <View style={styles.langLabelRow}>
                    <Text style={styles.langName}>{lang.name}</Text>
                    <Text style={styles.langCount}>{lang.count}</Text>
                  </View>
                  <View style={styles.track}>
                    <View style={[styles.trackFill, { width: `${Math.round(lang.share * 100)}%` }]} />
                  </View>
                </View>
              </View>
            ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h3 },
  container: { padding: spacing.md, paddingBottom: spacing.xl },
  previewNote: { ...typography.caption, marginBottom: spacing.md, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  card: { marginBottom: spacing.md },
  cardHeaderRow: { marginBottom: spacing.md },
  cardHeader: { ...typography.h3, marginBottom: spacing.sm },
  pillWrap: { marginTop: spacing.xs },
  langRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  langRank: {
    width: 20,
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.textFaint,
  },
  langBody: { flex: 1 },
  langLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  langName: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.text },
  langCount: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.textMuted },
  track: { height: 6, borderRadius: radius.pill, backgroundColor: colors.surface, overflow: 'hidden' },
  trackFill: { height: '100%', backgroundColor: colors.accent, borderRadius: radius.pill },
});
