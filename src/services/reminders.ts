import client from './api';
import { Reminder } from '@/types';

interface BackendReminder {
  id?: string;
  _id?: string;
  message?: string;
  remindAt?: string;
}

function mapReminder(raw: BackendReminder): Reminder {
  return {
    id: raw.id ?? raw._id ?? String(Math.random()),
    message: raw.message ?? '',
    remindAt: raw.remindAt ?? new Date().toISOString(),
  };
}

export async function createReminder(payload: { message: string; remindAt: string }): Promise<Reminder> {
  const { data } = await client.post<BackendReminder>('/reminders', payload);
  return mapReminder(data);
}

export async function listReminders(): Promise<Reminder[]> {
  const { data } = await client.get<{ data: BackendReminder[] } | BackendReminder[]>('/reminders');
  const raw = Array.isArray(data) ? data : data.data ?? [];
  return raw.map(mapReminder);
}

export async function deleteReminder(id: string): Promise<void> {
  await client.delete(`/reminders/${id}`);
}
