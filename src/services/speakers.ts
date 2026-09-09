import client from './api';
import { Speaker } from '@/types';

interface BackendSpeaker {
  id?: string;
  _id?: string;
  label?: string;
  displayName?: string;
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
