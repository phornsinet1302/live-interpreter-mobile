import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { StatTile } from '@/components/StatTile';
import { MiniBarChart } from '@/components/MiniBarChart';
import { SelectPillGroup } from '@/components/SelectPillGroup';
import { MOCK_ANALYTICS } from '@/mocks/analytics';
import { getAnalyticsSnapshot } from '@/services/analytics';
import { languageName } from '@/mocks/languages';
import { fonts, radius, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { AnalyticsSnapshot, ConversationStatus } from '@/types';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Analytics'>;
type Range = 'day' | 'week' | 'month';

const STATUS_LABELS: Record<ConversationStatus, string> = {
  waiting: 'Waiting',
  active: 'Active',
  paused: 'Paused',
  ended: 'Ended',
  archived: 'Archived',
};

export function AnalyticsScreen() {
  const navigation = useNavigation<Nav>();
  const [range, setRange] = useState<Range>('day');
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot>(MOCK_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getAnalyticsSnapshot();
        if (active) setSnapshot(data);
      } catch {
        // Keep the mock snapshot already in state.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const chartData = useMemo(() => {
    if (range === 'day') return snapshot.daily;
    if (range === 'week') return snapshot.weekly;
    return snapshot.monthly;
  }, [range, snapshot]);

  const accuracyLabel =
    snapshot.averageConfidence == null ? '—' : `${Math.round(snapshot.averageConfidence * 100)}%`;

  const statusEntries = Object.entries(snapshot.conversationsByStatus) as [ConversationStatus, number][];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {loading && <ActivityIndicator style={styles.spinner} color={colors.accent} />}

        <View style={styles.statsGrid}>
          <StatTile icon="chatbubbles-outline" label="Conversations" value={String(snapshot.totalConversations)} />
          <StatTile icon="language-outline" label="Messages" value={String(snapshot.totalMessages)} />
          <StatTile icon="checkmark-circle-outline" label="Avg. confidence" value={accuracyLabel} />
          <StatTile icon="sparkles-outline" label="Summarized" value={String(snapshot.conversationsSummarized)} />
        </View>

        {statusEntries.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.cardHeader}>By status</Text>
            <View style={styles.statusRow}>
              {statusEntries.map(([status, count]) => (
                <Chip key={status} label={`${STATUS_LABELS[status]} · ${count}`} tone="muted" />
              ))}
            </View>
          </Card>
        )}

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
          {chartData.length > 0 ? (
            <MiniBarChart data={chartData} />
          ) : (
            <Text style={styles.emptyText}>No activity yet for this range.</Text>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardHeader}>Most translated languages</Text>
          {snapshot.languagePairs.length === 0 ? (
            <Text style={styles.emptyText}>No translations yet.</Text>
          ) : (
            snapshot.languagePairs.map((pair, i) => (
              <View key={`${pair.sourceLanguage}-${pair.targetLanguage}`} style={styles.langRow}>
                <Text style={styles.langRank}>{i + 1}</Text>
                <View style={styles.langBody}>
                  <View style={styles.langLabelRow}>
                    <Text style={styles.langName}>
                      {languageName(pair.sourceLanguage)} → {languageName(pair.targetLanguage)}
                    </Text>
                    <Text style={styles.langCount}>{pair.count}</Text>
                  </View>
                  <View style={styles.track}>
                    <View style={[styles.trackFill, { width: `${Math.round(pair.share * 100)}%` }]} />
                  </View>
                </View>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, typography: ThemeTypography) {
  return StyleSheet.create({
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
  spinner: { marginBottom: spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  card: { marginBottom: spacing.md },
  cardHeaderRow: { marginBottom: spacing.md },
  cardHeader: { ...typography.h3, marginBottom: spacing.sm },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pillWrap: { marginTop: spacing.xs },
  emptyText: { ...typography.caption },
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
}
