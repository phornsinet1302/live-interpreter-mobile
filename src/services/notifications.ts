import client from './api';
import { NotificationItem, NotificationType } from '@/types';

interface BackendNotification {
  id?: string;
  _id?: string;
  type?: NotificationType;
  title?: string;
  message?: string;
  body?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt?: string;
}

function mapNotification(raw: BackendNotification): NotificationItem {
  return {
    id: raw.id ?? raw._id ?? String(Math.random()),
    type: raw.type ?? 'info',
    title: raw.title ?? 'Notification',
    body: raw.message ?? raw.body ?? '',
    createdAt: raw.createdAt ?? new Date().toISOString(),
    read: raw.isRead ?? raw.read ?? false,
  };
}

// The backend wraps paginated list responses as { data: T[], meta: {...} }.
interface Paginated<T> {
  data: T[];
}

export async function listNotifications(isRead?: boolean): Promise<NotificationItem[]> {
  const { data } = await client.get<Paginated<BackendNotification> | BackendNotification[]>(
    '/notifications',
    { params: isRead === undefined ? undefined : { isRead } }
  );
  const raw = Array.isArray(data) ? data : data.data ?? [];
  return raw.map(mapNotification);
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await client.get<{ count?: number; unreadCount?: number } | number>(
    '/notifications/unread-count'
  );
  if (typeof data === 'number') return data;
  return data.count ?? data.unreadCount ?? 0;
}

export async function markAllRead(): Promise<void> {
  await client.patch('/notifications/read-all');
}

export async function markRead(id: string): Promise<void> {
  await client.patch(`/notifications/${id}/read`);
}

export async function deleteNotification(id: string): Promise<void> {
  await client.delete(`/notifications/${id}`);
}
