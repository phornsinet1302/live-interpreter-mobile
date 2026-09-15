import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { TranscriptEntry } from '@/types';
import { fonts, spacing, ThemeColors } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';

/** Lets a screen override the normal theme colors/fonts for its own transcript
 *  presentation (e.g. SessionLiveScreen's background + font-style panel)
 *  without touching the shared theme other screens use. */
export interface TranscriptBubbleAppearance {
  text: string;
  textMuted: string;
  accent: string;
  border: string;
  originalFont: string;
  translatedFont: string;
}

interface TranscriptBubbleProps {
  entry: TranscriptEntry;
  /** Shows a speaker avatar + name above the entry — use in multi-speaker sessions. */
  showSpeaker?: boolean;
  /** Multiplier on the base text size — used by the session screen's font-size control. */
  fontScale?: number;
  /** Omit to use the normal app theme and default fonts. */
  appearance?: TranscriptBubbleAppearance;
}

export function TranscriptBubble({ entry, showSpeaker = false, fontScale = 1, appearance }: TranscriptBubbleProps) {
  const { colors: themeColors } = useTheme();
  const colors = useMemo<ThemeColors>(
    () =>
      appearance
        ? {
            ...themeColors,
            text: appearance.text,
            textMuted: appearance.textMuted,
            accent: appearance.accent,
            border: appearance.border,
          }
        : themeColors,
    [themeColors, appearance]
  );
  const originalFont = appearance?.originalFont ?? fonts.sansMedium;
  const translatedFont = appearance?.translatedFont ?? fonts.serifItalic;
  const styles = useMemo(
    () => createStyles(colors, fontScale, originalFont, translatedFont),
    [colors, fontScale, originalFont, translatedFont]
  );

  return (
    <View style={styles.container}>
      {showSpeaker && (
        <View style={styles.speakerRow}>
          <Avatar name={entry.speakerName} size={22} />
          <Text style={styles.speakerName}>{entry.speakerName}</Text>
        </View>
      )}
      <Text style={styles.original}>{entry.original}</Text>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <View style={styles.dividerDot} />
        <View style={styles.dividerLine} />
      </View>
      <Text style={styles.translated}>{entry.translated}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors, fontScale: number, originalFont: string, translatedFont: string) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.lg,
    },
    speakerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    speakerName: {
      fontFamily: fonts.sansSemiBold,
      fontSize: 12,
      color: colors.textMuted,
      marginLeft: spacing.xs,
    },
    original: {
      fontFamily: originalFont,
      fontSize: 19 * fontScale,
      color: colors.text,
      textAlign: 'center',
      // Generous on purpose — this can render Khmer/Chinese/etc. via OS font
      // fallback (Inter has no coverage for those scripts), and Khmer's
      // stacked diacritics need real headroom or they clip top/bottom.
      lineHeight: 30 * fontScale,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'stretch',
      marginVertical: spacing.md,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
    dividerDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginHorizontal: spacing.sm,
    },
    translated: {
      fontFamily: translatedFont,
      fontSize: 20 * fontScale,
      color: colors.accent,
      textAlign: 'center',
      lineHeight: 32 * fontScale,
    },
  });
}
