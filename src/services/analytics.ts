import client from './api';
import { AnalyticsSnapshot, ConversationStatus, DailyStat } from '@/types';

interface DashboardResponse {
  totalConversations?: number;
  conversationsByStatus?: Partial<Record<ConversationStatus, number>>;
  totalMessages?: number;
  averageConfidence?: number | null;
}

interface TranslationsResponse {
  byDay?: { day: string; count: number }[];
  byWeek?: { week: string; count: number }[];
  byMonth?: { month: string; count: number }[];
}

interface LanguagesResponse {
  pairs?: { sourceLanguage: string; targetLanguage: string; count: number }[];
}

interface SummaryUsageResponse {
  conversationsSummarized?: number;
}

interface HistoryUsageResponse {
  endedConversations?: number;
}

function toDailyStats<T extends { count: number }>(
  entries: T[] | undefined,
  keyOf: (e: T) => string
): DailyStat[] {
  return (entries ?? []).map((e) => ({ label: keyOf(e), value: e.count }));
}

export async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  const [dashboardRes, translationsRes, languagesRes, summaryRes, historyRes] = await Promise.allSettled([
    client.get<DashboardResponse>('/analytics/dashboard'),
    client.get<TranslationsResponse>('/analytics/translations'),
    client.get<LanguagesResponse>('/analytics/languages'),
    client.get<SummaryUsageResponse>('/analytics/summary-usage'),
    client.get<HistoryUsageResponse>('/analytics/history-usage'),
  ]);

  const dashboard = dashboardRes.status === 'fulfilled' ? dashboardRes.value.data : {};
  const translations = translationsRes.status === 'fulfilled' ? translationsRes.value.data : {};
  const languages = languagesRes.status === 'fulfilled' ? languagesRes.value.data : {};
  const summaryUsage = summaryRes.status === 'fulfilled' ? summaryRes.value.data : {};
  const historyUsage = historyRes.status === 'fulfilled' ? historyRes.value.data : {};

  const pairs = languages.pairs ?? [];
  const totalPairCount = pairs.reduce((sum, p) => sum + p.count, 0) || 1;

  return {
    totalConversations: dashboard.totalConversations ?? 0,
    conversationsByStatus: dashboard.conversationsByStatus ?? {},
    totalMessages: dashboard.totalMessages ?? 0,
    averageConfidence: dashboard.averageConfidence ?? null,
    daily: toDailyStats(translations.byDay, (e) => e.day.slice(5)),
    weekly: toDailyStats(translations.byWeek, (e) => e.week.split('-W')[1] ?? ''),
    monthly: toDailyStats(translations.byMonth, (e) => e.month.slice(5)),
    conversationsSummarized: summaryUsage.conversationsSummarized ?? 0,
    endedConversations: historyUsage.endedConversations ?? 0,
    languagePairs: pairs
      .map((p) => ({
        sourceLanguage: p.sourceLanguage,
        targetLanguage: p.targetLanguage,
        count: p.count,
        share: p.count / totalPairCount,
      }))
      .sort((a, b) => b.count - a.count),
  };
}
