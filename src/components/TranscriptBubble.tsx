import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TranscriptEntry } from '@/types';
import { colors, fonts, spacing } from '@/utils/theme';

interface TranscriptBubbleProps {
  entry: TranscriptEntry;
}

export function TranscriptBubble({ entry }: TranscriptBubbleProps) {
  return (
    <View style={styles.container}>
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
