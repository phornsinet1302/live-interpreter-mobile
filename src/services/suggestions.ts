import client from './api';
import { languageName } from '@/mocks/languages';
import { LanguageCode } from '@/types';
import { Exchange } from './summary';

// Persisted suggestions come back as a plain array of SuggestedAction rows
// ({id, conversationId, suggestion, priority, createdAt}) — not wrapped, and
// keyed "suggestion" (singular), unlike the public /next-step preview below.
interface BackendSuggestion {
  suggestion?: string;
}

function mapSuggestions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item: BackendSuggestion | string) => (typeof item === 'string' ? item : item?.suggestion ?? ''))
    .filter(Boolean);
}

export async function generateSuggestions(conversationId: string): Promise<string[]> {
  const { data } = await client.post<BackendSuggestion[]>(
    `/conversations/${conversationId}/suggestions`
  );
  return mapSuggestions(data);
}

export async function listSuggestions(conversationId: string): Promise<string[]> {
  const { data } = await client.get<BackendSuggestion[]>(
    `/conversations/${conversationId}/suggestions`
  );
  return mapSuggestions(data);
}

/** Public preview (no persistence) for guest/demo sessions with no conversation id. */
export async function previewNextStep(
  exchanges: Exchange[],
  sourceLanguage: LanguageCode
): Promise<string[]> {
  const { data } = await client.post<{ suggestions?: string[] }>('/next-step', {
    exchanges,
    sourceLanguage: languageName(sourceLanguage),
  });
  return data.suggestions ?? [];
}
