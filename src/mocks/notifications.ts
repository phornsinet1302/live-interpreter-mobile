import { NotificationItem } from '@/types';

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'success',
    title: 'Translation completed',
    body: 'Your EN → KM session "Client Call" finished processing.',
    createdAt: hoursAgo(1),
    read: false,
  },
  {
    id: 'n2',
    type: 'success',
    title: 'Export completed',
    body: '"Weekly Standup" was exported as PDF and is ready to share.',
    createdAt: hoursAgo(5),
    read: false,
  },
  {
    id: 'n3',
    type: 'info',
    title: 'Reminder',
    body: "You have an unfinished session from yesterday — pick up where you left off.",
    createdAt: hoursAgo(26),
    read: true,
  },
  {
    id: 'n4',
    type: 'info',
    title: 'System update',
    body: 'Live Interpreter 1.1 adds group sessions and AI summaries.',
    createdAt: hoursAgo(48),
    read: true,
  },
];
