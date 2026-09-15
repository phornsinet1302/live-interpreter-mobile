import client from './api';
import { TranscriptEntry } from '@/types';

interface BackendMessage {
  id?: string;
  _id?: string;
  speakerId?: string;
  speakerName?: string;
  originalText?: string;
  translatedText?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  createdAt?: string;
}

export function mapMessage(raw: BackendMessage): TranscriptEntry {
  return {
    id: raw.id ?? raw._id ?? String(Math.random()),
    speakerId: raw.speakerId ?? 'me',
    speakerName: raw.speakerName ?? 'You',
    original: raw.originalText ?? '',
    translated: raw.translatedText ?? '',
    source: raw.sourceLanguage ?? 'auto',
    target: raw.targetLanguage ?? 'en',
    timestamp: raw.createdAt ? new Date(raw.createdAt).getTime() : Date.now(),
  };
}

export async function addMessage(
  conversationId: string,
  payload: {
    originalText: string;
    speakerId?: string;
    sourceLanguage?: string;
    targetLanguage?: string;
    // Pass along a translation the client already has (live-translate
    // already ran transcribe+translate in one pass to show it immediately)
    // so the backend can persist it directly instead of paying for and
    // waiting on a second, redundant Gemini call for the same text.
    translatedText?: string;
    translationProvider?: string;
    confidence?: number | null;
  }
): Promise<TranscriptEntry> {
  const { data } = await client.post<BackendMessage>(
    `/conversations/${conversationId}/messages`,
    payload
  );
  return mapMessage(data);
}

export async function listMessages(
  conversationId: string,
  page = 1,
  limit = 50
): Promise<TranscriptEntry[]> {
  const { data } = await client.get<{ data: BackendMessage[] } | BackendMessage[]>(
    `/conversations/${conversationId}/messages`,
    { params: { page, limit } }
  );
  const raw = Array.isArray(data) ? data : data.data ?? [];
  return raw.map(mapMessage);
}

export async function getMessage(conversationId: string, messageId: string): Promise<TranscriptEntry> {
  const { data } = await client.get<BackendMessage>(
    `/conversations/${conversationId}/messages/${messageId}`
  );
  return mapMessage(data);
}

export async function deleteMessage(conversationId: string, messageId: string): Promise<void> {
  await client.delete(`/conversations/${conversationId}/messages/${messageId}`);
}
