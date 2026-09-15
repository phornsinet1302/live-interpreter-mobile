import { File } from 'expo-file-system';
import client from './api';
import { Speaker } from '@/types';

interface BackendSpeaker {
  id?: string;
  _id?: string;
  label?: string;
  displayName?: string;
  isNew?: boolean;
}

function mapSpeaker(raw: BackendSpeaker): Speaker {
  return {
    id: raw.id ?? raw._id ?? String(Math.random()),
    label: raw.label ?? 'Speaker',
    displayName: raw.displayName,
  };
}

export async function addSpeaker(
  conversationId: string,
  payload: { label: string; displayName?: string }
): Promise<Speaker> {
  const { data } = await client.post<BackendSpeaker>(
    `/conversations/${conversationId}/speakers`,
    payload
  );
  return mapSpeaker(data);
}

export async function listSpeakers(conversationId: string): Promise<Speaker[]> {
  const { data } = await client.get<BackendSpeaker[] | { items: BackendSpeaker[] }>(
    `/conversations/${conversationId}/speakers`
  );
  const raw = Array.isArray(data) ? data : data.items ?? [];
  return raw.map(mapSpeaker);
}

export async function updateSpeaker(
  conversationId: string,
  speakerId: string,
  payload: Partial<{ label: string; displayName: string }>
): Promise<Speaker> {
  const { data } = await client.patch<BackendSpeaker>(
    `/conversations/${conversationId}/speakers/${speakerId}`,
    payload
  );
  return mapSpeaker(data);
}

/**
 * Compares a recorded segment's voice against speakers already identified in
 * this conversation (Gemini-based comparison, not true voice biometrics —
 * see the backend's speakers.service.ts for the caveat). Returns an existing
 * speaker if matched, or a newly-created "Speaker A/B/C…" if not.
 */
export async function identifySpeaker(
  conversationId: string,
  audioUri: string
): Promise<{ speaker: Speaker; isNew: boolean }> {
  const file = new File(audioUri);
  const audio = await file.base64();
  const { data } = await client.post<BackendSpeaker>(
    `/conversations/${conversationId}/speakers/identify`,
    { audio, mimeType: 'audio/m4a' }
  );
  return { speaker: mapSpeaker(data), isNew: data.isNew ?? false };
}
