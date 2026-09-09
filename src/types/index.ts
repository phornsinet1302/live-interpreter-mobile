export interface User {
  id: string;
  name: string;
  email: string;
  preferredLanguage: string;
  avatarUrl?: string;
}

export interface AuthSession {
  token: string;
  refreshToken?: string;
  user: User;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
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

export interface Participant {
  id: string;
  name: string;
  language: LanguageCode;
  isHost: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  code: string;
  hostId: string;
  participants: Participant[];
  createdAt: string;
  active: boolean;
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

export type NotificationType =
  | 'invitation'
  | 'translation'
  | 'export'
  | 'reminder'
  | 'system';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface DailyStat {
  label: string;
  value: number;
}

export interface LanguageStat {
  language: LanguageCode;
  name: string;
  count: number;
  share: number;
}

export interface AnalyticsSnapshot {
  daily: DailyStat[];
  weekly: DailyStat[];
  monthly: DailyStat[];
  totalToday: number;
  totalWeek: number;
  totalMonth: number;
  averageAccuracy: number;
  aiSummaryUsage: number;
  historyUsage: number;
  languages: LanguageStat[];
}

export interface SpeakerSummary {
  speakerName: string;
  summary: string;
  lineCount: number;
}

export interface SuggestedNextStep {
  id: string;
  label: string;
  kind: 'question' | 'unfinished' | 'recommendation';
}

export interface SessionInsights {
  summary: string;
  actionItems: string[];
  keyPoints: string[];
  keywords: string[];
  speakerSummaries: SpeakerSummary[];
  nextSteps: SuggestedNextStep[];
}

export type ThemePreference = 'light' | 'dark' | 'system';
export type NoiseEnvironment = 'quiet' | 'normal' | 'noisy';

export interface AppPreferences {
  theme: ThemePreference;
  noiseReductionEnabled: boolean;
  noiseEnvironment: NoiseEnvironment;
  notificationsEnabled: boolean;
}
