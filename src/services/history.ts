import client from './api';
import { HistoryItem, TranscriptEntry } from '@/types';

export async function getHistory(): Promise<HistoryItem[]> {
  const { data } = await client.get<HistoryItem[]>('/history');
  return data;
}

export async function getTranscript(
  historyId: string
): Promise<TranscriptEntry[]> {
  const { data } = await client.get<TranscriptEntry[]>(
    `/history/${historyId}/transcript`
  );
  return data;
}

export async function deleteHistoryItem(historyId: string): Promise<void> {
  await client.delete(`/history/${historyId}`);
}

export async function clearHistory(): Promise<void> {
  await client.delete('/history');
}
