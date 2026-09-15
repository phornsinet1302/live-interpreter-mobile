import { fonts } from '@/utils/theme';

export type FontStyleKey = 'elegant' | 'clean' | 'bold';
export type BackgroundPresetKey = 'default' | 'dark' | 'light' | 'sepia';

export const FONT_STYLES: { key: FontStyleKey; label: string; original: string; translated: string }[] = [
  { key: 'elegant', label: 'Elegant', original: fonts.sansMedium, translated: fonts.serifItalic },
  { key: 'clean', label: 'Clean', original: fonts.sans, translated: fonts.sansMedium },
  { key: 'bold', label: 'Bold', original: fonts.sansBold, translated: fonts.serifBold },
];

export interface SessionBackgroundColors {
  background: string;
  backgroundElevated: string;
  text: string;
  textMuted: string;
  accent: string;
  border: string;
}

// colors: null means "follow the app's normal light/dark theme" rather than
// a fixed palette — the only preset that changes with the system/app theme.
export const BACKGROUND_PRESETS: {
  key: BackgroundPresetKey;
  label: string;
  swatch: string;
  colors: SessionBackgroundColors | null;
}[] = [
  { key: 'default', label: 'Default', swatch: '#C1603A', colors: null },
  {
    key: 'dark',
    label: 'Dark',
    swatch: '#111111',
    colors: {
      background: '#0A0908',
      backgroundElevated: '#161310',
      text: '#F5EFE6',
      textMuted: '#A79C8C',
      accent: '#E2895F',
      border: '#2A251E',
    },
  },
  {
    key: 'light',
    label: 'Light',
    swatch: '#FFFFFF',
    colors: {
      background: '#FFFFFF',
      backgroundElevated: '#F7F7F7',
      text: '#1A1A1A',
      textMuted: '#6B6B6B',
      accent: '#C1603A',
      border: '#E5E5E5',
    },
  },
  {
    key: 'sepia',
    label: 'Sepia',
    swatch: '#E8D8B0',
    colors: {
      background: '#F4ECD8',
      backgroundElevated: '#EDE2C8',
      text: '#3A2E1F',
      textMuted: '#7A6A50',
      accent: '#8B5A2B',
      border: '#DCCBA5',
    },
  },
];
