import { AnalyticsSnapshot } from '@/types';

export const MOCK_ANALYTICS: AnalyticsSnapshot = {
  totalConversations: 24,
  conversationsByStatus: { waiting: 1, active: 1, paused: 0, ended: 20, archived: 2 },
  totalMessages: 312,
  averageConfidence: 0.94,
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
    { label: '01', value: 64 },
    { label: '02', value: 88 },
    { label: '03', value: 71 },
    { label: '04', value: 102 },
  ],
  monthly: [
    { label: '06', value: 210 },
    { label: '07', value: 265 },
    { label: '08', value: 298 },
    { label: '09', value: 174 },
  ],
  conversationsSummarized: 15,
  endedConversations: 20,
  languagePairs: [
    { sourceLanguage: 'en', targetLanguage: 'km', count: 142, share: 0.43 },
    { sourceLanguage: 'km', targetLanguage: 'en', count: 96, share: 0.29 },
    { sourceLanguage: 'en', targetLanguage: 'fr', count: 46, share: 0.14 },
    { sourceLanguage: 'en', targetLanguage: 'es', count: 28, share: 0.08 },
    { sourceLanguage: 'en', targetLanguage: 'zh', count: 20, share: 0.06 },
  ],
};
