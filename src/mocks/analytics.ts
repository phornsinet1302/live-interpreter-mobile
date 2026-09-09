import { AnalyticsSnapshot } from '@/types';

export const MOCK_ANALYTICS: AnalyticsSnapshot = {
  daily: [
    { label: 'Mon', value: 12 },
    { label: 'Tue', value: 18 },
    { label: 'Wed', value: 9 },
    { label: 'Thu', value: 22 },
    { label: 'Fri', value: 30 },
    { label: 'Sat', value: 14 },
    { label: 'Sun', value: 7 },
  ],
  weekly: [
    { label: 'W1', value: 64 },
    { label: 'W2', value: 88 },
    { label: 'W3', value: 71 },
    { label: 'W4', value: 102 },
  ],
  monthly: [
    { label: 'Jun', value: 210 },
    { label: 'Jul', value: 265 },
    { label: 'Aug', value: 298 },
    { label: 'Sep', value: 174 },
  ],
  totalToday: 22,
  totalWeek: 112,
  totalMonth: 947,
  averageAccuracy: 0.94,
  aiSummaryUsage: 38,
  historyUsage: 156,
  languages: [
    { language: 'en', name: 'English', count: 412, share: 0.43 },
    { language: 'km', name: 'Khmer', count: 289, share: 0.31 },
    { language: 'fr', name: 'French', count: 96, share: 0.1 },
    { language: 'es', name: 'Spanish', count: 74, share: 0.08 },
    { language: 'zh', name: 'Chinese', count: 76, share: 0.08 },
  ],
};
