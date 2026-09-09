import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { generateInsights } from '@/mocks/insights';
import { getTranscript } from '@/services/history';
import { colors, fonts, spacing, typography } from '@/utils/theme';
import { SessionInsights, SuggestedNextStep, TranscriptEntry } from '@/types';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Summary'>;
type Rt = RouteProp<RootStackParamList, 'Summary'>;

const NEXT_STEP_ICONS: Record<SuggestedNextStep['kind'], keyof typeof Ionicons.glyphMap> = {
  question: 'help-circle-outline',
  unfinished: 'time-outline',
  recommendation: 'bulb-outline',
};

export function SummaryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { entries: paramEntries, historyId, title } = route.params ?? {};

  const [entries, setEntries] = useState<TranscriptEntry[]>(paramEntries ?? []);
  const [loading, setLoading] = useState(!!historyId && !paramEntries);

  useEffect(() => {
    if (!historyId || paramEntries) return;
    let active = true;
    (async () => {
      try {
        const remote = await getTranscript(historyId);
        if (active) setEntries(remote);
      } catch {
        // No backend yet — the insights below simply reflect an empty transcript.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [historyId, paramEntries]);

  const insights: SessionInsights = useMemo(() => generateInsights(entries, title), [entries, title]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{title ?? 'AI Summary'}</Text>
        <View style={{ width: 20 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <Card style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="sparkles-outline" size={16} color={colors.accent} />
              <Text style={styles.cardHeader}>Summary</Text>
            </View>
            <Text style={styles.body}>{insights.summary}</Text>
          </Card>

          {insights.keyPoints.length > 0 && (
            <Card style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="list-outline" size={16} color={colors.accent} />
                <Text style={styles.cardHeader}>Key discussion points</Text>
              </View>
              {insights.keyPoints.map((point, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{point}</Text>
                </View>
              ))}
            </Card>
          )}

          {insights.actionItems.length > 0 && (
            <Card style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="checkbox-outline" size={16} color={colors.accent} />
                <Text style={styles.cardHeader}>Action items</Text>
              </View>
              {insights.actionItems.map((item, i) => (
                <View key={i} style={styles.actionRow}>
                  <Ionicons name="ellipse-outline" size={14} color={colors.textFaint} />
                  <Text style={styles.actionText}>{item}</Text>
                </View>
              ))}
            </Card>
          )}

          {insights.keywords.length > 0 && (
            <Card style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="pricetags-outline" size={16} color={colors.accent} />
                <Text style={styles.cardHeader}>Keywords</Text>
              </View>
              <View style={styles.keywordWrap}>
                {insights.keywords.map((kw) => (
                  <Chip key={kw} label={kw} tone="primary" style={styles.keywordChip} />
                ))}
              </View>
            </Card>
          )}

          {insights.speakerSummaries.length > 0 && (
            <Card style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="people-outline" size={16} color={colors.accent} />
                <Text style={styles.cardHeader}>Speaker summaries</Text>
              </View>
              {insights.speakerSummaries.map((s) => (
                <View key={s.speakerName} style={styles.speakerRow}>
                  <Text style={styles.speakerName}>{s.speakerName}</Text>
                  <Text style={styles.body}>{s.summary}</Text>
                </View>
              ))}
            </Card>
          )}

          <Card style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="arrow-forward-circle-outline" size={16} color={colors.accent} />
              <Text style={styles.cardHeader}>Suggested next steps</Text>
            </View>
            {insights.nextSteps.map((step) => (
              <View key={step.id} style={styles.actionRow}>
                <Ionicons name={NEXT_STEP_ICONS[step.kind]} size={16} color={colors.accent} />
                <Text style={styles.actionText}>{step.label}</Text>
              </View>
            ))}
          </Card>

          {entries.length === 0 && (
            <EmptyState
              icon="sparkles-outline"
              title="Preview data"
              subtitle="This is a locally generated preview — connect an AI backend for higher-quality summaries."
            />
          )}
        </ScrollView>
      )}
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
  headerTitle: { ...typography.h3, flex: 1, textAlign: 'center', marginHorizontal: spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: spacing.md, paddingBottom: spacing.xl },
  card: { marginBottom: spacing.md },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.xs },
  cardHeader: { ...typography.h3 },
  body: { ...typography.body, flexShrink: 1 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.xs },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 8,
    marginRight: spacing.sm,
  },
  bulletText: { ...typography.body, flex: 1 },
  actionRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.sm, gap: spacing.sm },
  actionText: { ...typography.body, flex: 1 },
  keywordWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  keywordChip: { marginRight: 0 },
  speakerRow: { marginTop: spacing.sm },
  speakerName: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.accent, marginBottom: 2 },
});
