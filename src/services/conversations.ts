import client from './api';
import { Conversation, ConversationStatus } from '@/types';

interface BackendConversation {
  id?: string;
  _id?: string;
  title?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  status?: ConversationStatus;
  isFavorite?: boolean;
  createdAt?: string;
}

// The backend wraps paginated list responses as { data: T[], meta: {...} }.
interface Paginated<T> {
  data: T[];
}

function mapConversation(raw: BackendConversation): Conversation {
  return {
    id: raw.id ?? raw._id ?? '',
    title: raw.title ?? 'Untitled session',
    sourceLanguage: raw.sourceLanguage ?? 'en',
    targetLanguage: raw.targetLanguage ?? 'en',
    status: raw.status ?? 'waiting',
    favorite: raw.isFavorite ?? false,
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

export async function createConversation(payload: {
  title?: string;
  sourceLanguage: string;
  targetLanguage: string;
}): Promise<Conversation> {
  const { data } = await client.post<BackendConversation>('/conversations', payload);
  return mapConversation(data);
}

export async function listConversations(params?: {
  status?: ConversationStatus;
  isFavorite?: boolean;
  page?: number;
  limit?: number;
}): Promise<Conversation[]> {
  const { data } = await client.get<Paginated<BackendConversation> | BackendConversation[]>(
    '/conversations',
    { params }
  );
  const raw = Array.isArray(data) ? data : data.data ?? [];
  return raw.map(mapConversation);
}

export async function getConversation(id: string): Promise<Conversation> {
  const { data } = await client.get<BackendConversation>(`/conversations/${id}`);
  return mapConversation(data);
}

export async function updateConversation(
  id: string,
  payload: Partial<{ title: string; sourceLanguage: string; targetLanguage: string; isFavorite: boolean }>
): Promise<Conversation> {
  const { data } = await client.patch<BackendConversation>(`/conversations/${id}`, payload);
  return mapConversation(data);
}

export async function setFavorite(id: string, favorite: boolean): Promise<Conversation> {
  return updateConversation(id, { isFavorite: favorite });
}

export async function deleteConversation(id: string): Promise<void> {
  await client.delete(`/conversations/${id}`);
}

export async function startConversation(id: string): Promise<Conversation> {
  const { data } = await client.patch<BackendConversation>(`/conversations/${id}/start`);
  return mapConversation(data);
}

export async function pauseConversation(id: string): Promise<Conversation> {
  const { data } = await client.patch<BackendConversation>(`/conversations/${id}/pause`);
  return mapConversation(data);
}

export async function resumeConversation(id: string): Promise<Conversation> {
  const { data } = await client.patch<BackendConversation>(`/conversations/${id}/resume`);
  return mapConversation(data);
}

export async function endConversation(id: string): Promise<Conversation> {
  const { data } = await client.patch<BackendConversation>(`/conversations/${id}/end`);
  return mapConversation(data);
}
