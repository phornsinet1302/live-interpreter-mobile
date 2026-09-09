import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { TranscriptEntry } from '@/types';
import { colors, fonts, spacing } from '@/utils/theme';

interface TranscriptBubbleProps {
  entry: TranscriptEntry;
  /** Shows a speaker avatar + name above the entry — use in multi-speaker sessions. */
  showSpeaker?: boolean;
}

export function TranscriptBubble({ entry, showSpeaker = false }: TranscriptBubbleProps) {
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

const styles = StyleSheet.create({
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
    fontFamily: fonts.sansMedium,
    fontSize: 19,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
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
    fontFamily: fonts.serifItalic,
    fontSize: 20,
    color: colors.accent,
    textAlign: 'center',
    lineHeight: 27,
  },
});
