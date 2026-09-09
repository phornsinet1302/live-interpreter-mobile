import { NotificationItem } from '@/types';

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'invitation',
    title: 'Workspace invitation',
    body: 'Sokha invited you to join the "Product Sync" workspace.',
    createdAt: hoursAgo(1),
    read: false,
  },
  {
    id: 'n2',
    type: 'translation',
    title: 'Translation completed',
    body: 'Your EN → KM session "Client Call" finished processing.',
    createdAt: hoursAgo(3),
    read: false,
  },
  {
    id: 'n3',
    type: 'export',
    title: 'Export completed',
    body: '"Weekly Standup" was exported as PDF and is ready to share.',
    createdAt: hoursAgo(5),
    read: true,
  },
  {
    id: 'n4',
    type: 'reminder',
    title: 'Reminder',
    body: "You have an unfinished session from yesterday — pick up where you left off.",
    createdAt: hoursAgo(26),
    read: true,
  },
  {
    id: 'n5',
    type: 'system',
    title: 'System update',
    body: 'Live Interpreter 1.1 adds group sessions and AI summaries.',
    createdAt: hoursAgo(48),
    read: true,
  },
];
