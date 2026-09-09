import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getMainSocket } from '@/services/socket';
import * as notificationsService from '@/services/notifications';
import { NotificationItem } from '@/types';

interface NotificationsContextValue {
  items: NotificationItem[];
  unreadCount: number;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const NotificationsContext = createContext<NotificationsContextValue | undefined>(
  undefined
);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setUnreadCount(0);
      return;
    }
    try {
      const [list, count] = await Promise.all([
        notificationsService.listNotifications(),
        notificationsService.getUnreadCount(),
      ]);
      setItems(list);
      setUnreadCount(count);
    } catch {
      // Leave whatever was last loaded — the screen falls back to mock data itself.
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = getMainSocket();
    if (!socket) return;

    const onNew = (notification: NotificationItem) => {
      setItems((prev) => [notification, ...prev]);
      setUnreadCount((c) => c + 1);
    };
    socket.on('notification:new', onNew);
    return () => {
      socket.off('notification:new', onNew);
    };
  }, [isAuthenticated]);

  const markRead = useCallback(async (id: string) => {
    const wasUnread = items.find((n) => n.id === id)?.read === false;
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await notificationsService.markRead(id);
    } catch {
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
      if (wasUnread) setUnreadCount((c) => c + 1);
    }
  }, [items]);

  const markAllRead = useCallback(async () => {
    const previous = items;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await notificationsService.markAllRead();
    } catch {
      setItems(previous);
      setUnreadCount(previous.filter((n) => !n.read).length);
    }
  }, [items]);

  const remove = useCallback(async (id: string) => {
    const previous = items;
    setItems((prev) => prev.filter((n) => n.id !== id));
    try {
      await notificationsService.deleteNotification(id);
    } catch {
      setItems(previous);
    }
  }, [items]);

  const value = useMemo<NotificationsContextValue>(
    () => ({ items, unreadCount, refresh, markRead, markAllRead, remove }),
    [items, unreadCount, refresh, markRead, markAllRead, remove]
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}
