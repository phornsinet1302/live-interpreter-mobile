import client from './api';

export interface SubtitleSession {
  code: string;
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  status?: 'active' | 'inactive' | 'expired';
}

interface BackendSubtitleSession {
  sessionCode?: string;
  fontSize?: number;
  fontColor?: string;
  backgroundColor?: string;
  status?: SubtitleSession['status'];
}

function mapSubtitleSession(raw: BackendSubtitleSession): SubtitleSession {
  return {
    code: raw.sessionCode ?? '',
    fontSize: raw.fontSize ?? 16,
    fontColor: raw.fontColor ?? '#FFFFFF',
    backgroundColor: raw.backgroundColor ?? '#000000',
    status: raw.status,
  };
}

type SubtitleSettings = Partial<Pick<SubtitleSession, 'fontSize' | 'fontColor' | 'backgroundColor'>>;

export async function createSubtitleSession(
  conversationId: string,
  payload?: SubtitleSettings
): Promise<SubtitleSession> {
  const { data } = await client.post<BackendSubtitleSession>(
    `/conversations/${conversationId}/subtitles`,
    payload ?? {}
  );
  return mapSubtitleSession(data);
}

export async function getSubtitleSession(conversationId: string): Promise<SubtitleSession> {
  const { data } = await client.get<BackendSubtitleSession>(
    `/conversations/${conversationId}/subtitles`
  );
  return mapSubtitleSession(data);
}

export async function updateSubtitleSession(
  conversationId: string,
  payload: SubtitleSettings & { status?: SubtitleSession['status'] }
): Promise<SubtitleSession> {
  const { data } = await client.patch<BackendSubtitleSession>(
    `/conversations/${conversationId}/subtitles`,
    payload
  );
  return mapSubtitleSession(data);
}

export async function deleteSubtitleSession(conversationId: string): Promise<void> {
  await client.delete(`/conversations/${conversationId}/subtitles`);
}

export async function pushCaption(
  conversationId: string,
  payload: { source: string; translated: string; speakerName?: string }
): Promise<void> {
  await client.post(`/conversations/${conversationId}/subtitles/push`, payload);
}

export async function getPublicSubtitleSession(code: string): Promise<SubtitleSession> {
  const { data } = await client.get<BackendSubtitleSession>(`/subtitles/${code}`);
  return mapSubtitleSession(data);
}
