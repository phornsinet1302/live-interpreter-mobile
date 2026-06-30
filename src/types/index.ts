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
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
