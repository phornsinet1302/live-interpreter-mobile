import { Language } from '@/types';

// English and Khmer are pinned first per FR-2 ("System shall support English, Khmer").
export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino' },
];

export function languageName(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.name ?? code.toUpperCase();
}

/**
 * Normalizes a stored "preferred language" value to a code this app's
 * pickers/translate calls actually use. The web app writes full names
 * ("English") to the same backend field the mobile app writes codes to
 * ("en") — without this, a preference set on the web would silently fail to
 * match anything here (LanguagePickerModal wouldn't highlight it, and the
 * raw name would get sent straight through as if it were a code). Accepts
 * either a code or a name case-insensitively; falls back to "en" only if the
 * value matches neither, so a genuinely unrecognized value doesn't propagate
 * further as garbage.
 */
export function toLanguageCode(value: string | undefined | null): string {
  if (!value) return 'en';
  const lower = value.trim().toLowerCase();
  const byCode = LANGUAGES.find((l) => l.code.toLowerCase() === lower);
  if (byCode) return byCode.code;
  const byName = LANGUAGES.find((l) => l.name.toLowerCase() === lower);
  if (byName) return byName.code;
  return 'en';
}
