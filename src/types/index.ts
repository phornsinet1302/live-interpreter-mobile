export interface User {
  id: string;
  name: string;
  email: string;
  preferredLanguage: string;
  avatarUrl?: string;
  theme?: ThemePreference;
}

export type LanguageCode = string; // e.g. "en", "km", "es", "auto"

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export interface TranslationRequest {
  text: string;
  source: LanguageCode;
  target: LanguageCode;
}

export interface TranslationResult {
  sourceText: string;
  translatedText: string;
  source: LanguageCode;
  target: LanguageCode;
  detectedLanguage?: LanguageCode;
  confidence?: number;
}

export interface WordLookupResult {
  translatedText: string;
  phonetic?: string;
  examples: string[];
  confidence?: number;
}

export type ConversationStatus = 'waiting' | 'active' | 'paused' | 'ended' | 'archived';

export interface Speaker {
  id: string;
  label: string;
  displayName?: string;
  language?: LanguageCode;
  isHost?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  status: ConversationStatus;
  favorite: boolean;
  createdAt: string;
}

export interface TranscriptEntry {
  id: string;
  speakerId: string;
  speakerName: string;
  original: string;
  translated: string;
  source: LanguageCode;
  target: LanguageCode;
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  meetingId?: string;
  title: string;
  source: LanguageCode;
  target: LanguageCode;
  entryCount: number;
  createdAt: string;
  favorite?: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface Reminder {
  id: string;
  message: string;
  remindAt: string;
}

export interface DailyStat {
  label: string;
  value: number;
}

export interface LanguagePairStat {
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  count: number;
  share: number;
}

export interface AnalyticsSnapshot {
  totalConversations: number;
  conversationsByStatus: Partial<Record<ConversationStatus, number>>;
  totalMessages: number;
  averageConfidence: number | null;
  daily: DailyStat[];
  weekly: DailyStat[];
  monthly: DailyStat[];
  conversationsSummarized: number;
  endedConversations: number;
  languagePairs: LanguagePairStat[];
}

export interface SpeakerSummary {
  speakerName: string;
  summary: string;
  lineCount?: number;
}

export interface SessionInsights {
  summary: string[];
  actionItems: string[];
  keywords: string[];
  speakerSummaries: SpeakerSummary[];
  nextSteps: string[];
}

export type ThemePreference = 'light' | 'dark' | 'system';
export type NoiseEnvironment = 'quiet' | 'normal' | 'noisy';

export interface AppPreferences {
  theme: ThemePreference;
  noiseReductionEnabled: boolean;
  noiseEnvironment: NoiseEnvironment;
  notificationsEnabled: boolean;
}
