import client from './api';
import { languageName } from '@/mocks/languages';
import { ApiError, LanguageCode, SessionInsights } from '@/types';

export interface Exchange {
  source: string;
  translated: string;
}

// The persisted GET/POST /conversations/:id/summary shape (a single
// `summary` string + separate `keyPoints`) differs from the public preview
// POST /summarize shape (`summary` is already an array of bullet points,
// plus `nextSteps` bundled in) — this maps both.
interface BackendSummary {
  summary?: string[] | string;
  keyPoints?: string[];
  actionItems?: (string | { text?: string })[];
  keywords?: string[];
  speakerSummaries?: { speaker?: string; speakerName?: string; name?: string; summary?: string; text?: string; lineCount?: number }[];
  nextSteps?: string[];
}

function mapSummary(raw: BackendSummary): SessionInsights {
  const summary = Array.isArray(raw.summary)
    ? raw.summary
    : [raw.summary, ...(raw.keyPoints ?? [])].filter((s): s is string => !!s);

  return {
    summary,
    actionItems: (raw.actionItems ?? []).map((item) =>
      typeof item === 'string' ? item : item?.text ?? ''
    ).filter(Boolean),
    keywords: raw.keywords ?? [],
    speakerSummaries: (raw.speakerSummaries ?? []).map((s) => ({
      speakerName: s.speaker ?? s.speakerName ?? s.name ?? 'Speaker',
      summary: s.summary ?? s.text ?? '',
      lineCount: s.lineCount,
    })),
    nextSteps: raw.nextSteps ?? [],
  };
}

export async function generateSummary(conversationId: string): Promise<SessionInsights> {
  const { data } = await client.post<BackendSummary>(`/conversations/${conversationId}/summary`);
  return mapSummary(data);
}

export async function getSummary(conversationId: string): Promise<SessionInsights | null> {
  try {
    const { data } = await client.get<BackendSummary>(`/conversations/${conversationId}/summary`);
    return mapSummary(data);
  } catch (e) {
    if ((e as ApiError).status === 404) return null;
    throw e;
  }
}

export async function saveSummary(conversationId: string, insights: SessionInsights): Promise<void> {
  await client.put(`/conversations/${conversationId}/summary`, {
    summary: insights.summary.join('\n'),
    keyPoints: insights.summary,
    actionItems: insights.actionItems,
    keywords: insights.keywords,
  });
}

export async function deleteSummary(conversationId: string): Promise<void> {
  await client.delete(`/conversations/${conversationId}/summary`);
}

/** Public preview (no persistence) for guest/demo sessions with no conversation id. */
export async function previewSummary(
  exchanges: Exchange[],
  sourceLanguage: LanguageCode,
  targetLanguage: LanguageCode
): Promise<SessionInsights> {
  const { data } = await client.post<BackendSummary>('/summarize', {
    exchanges,
    sourceLanguage: languageName(sourceLanguage),
    targetLanguage: languageName(targetLanguage),
  });
  return mapSummary(data);
}
