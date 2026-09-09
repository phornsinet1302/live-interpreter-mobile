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
import * as summaryService from '@/services/summary';
import * as suggestionsService from '@/services/suggestions';
import { fonts, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { SessionInsights, TranscriptEntry } from '@/types';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Summary'>;
type Rt = RouteProp<RootStackParamList, 'Summary'>;

export function SummaryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { entries: paramEntries, historyId, title } = route.params ?? {};

  const [entries, setEntries] = useState<TranscriptEntry[]>(paramEntries ?? []);
  const [insights, setInsights] = useState<SessionInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        let transcript = paramEntries;
        if (!transcript && historyId) {
          transcript = await getTranscript(historyId);
          if (active) setEntries(transcript);
        }
        transcript = transcript ?? [];

        let result: SessionInsights;
        if (historyId) {
          let summary = await summaryService.getSummary(historyId);
          if (!summary) summary = await summaryService.generateSummary(historyId);
          let nextSteps: string[] = [];
          try {
            nextSteps = await suggestionsService.listSuggestions(historyId);
            if (nextSteps.length === 0) nextSteps = await suggestionsService.generateSuggestions(historyId);
          } catch {
            // No suggestions yet — leave the section empty rather than failing the whole screen.
          }
          result = { ...summary, nextSteps: nextSteps.length ? nextSteps : summary.nextSteps };
        } else if (transcript.length > 0) {
          const chronological = [...transcript].reverse();
          const exchanges = chronological.map((e) => ({ source: e.original, translated: e.translated }));
          const sourceLanguage = chronological[0]?.source ?? 'en';
          const targetLanguage = chronological[0]?.target ?? 'en';
          result = await summaryService.previewSummary(exchanges, sourceLanguage, targetLanguage);
          setPreview(true);
        } else {
          result = generateInsights([], title);
          setPreview(true);
        }
        if (active) setInsights(result);
      } catch {
        if (active) {
          setInsights(generateInsights(entries, title));
          setPreview(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyId, title]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{title ?? 'AI Summary'}</Text>
        <View style={{ width: 20 }} />
      </View>

      {loading || !insights ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {insights.summary.length > 0 && (
            <Card style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="sparkles-outline" size={16} color={colors.accent} />
                <Text style={styles.cardHeader}>Summary</Text>
              </View>
              {insights.summary.map((point, i) => (
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

          {insights.nextSteps.length > 0 && (
            <Card style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="arrow-forward-circle-outline" size={16} color={colors.accent} />
                <Text style={styles.cardHeader}>Suggested next steps</Text>
              </View>
              {insights.nextSteps.map((step, i) => (
                <View key={i} style={styles.actionRow}>
                  <Ionicons name="bulb-outline" size={16} color={colors.accent} />
                  <Text style={styles.actionText}>{step}</Text>
                </View>
              ))}
            </Card>
          )}

          {preview && (
            <EmptyState
              icon="sparkles-outline"
              title="Preview"
              subtitle="Generated from this transcript directly — sign in and save a session to keep AI summaries in History."
            />
          )}
        </ScrollView>
      )}
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
}
