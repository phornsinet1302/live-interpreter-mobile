import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TranscriptEntry } from '@/types';
import { colors, radius, spacing } from '@/utils/theme';
import { formatTime } from '@/utils/format';

export function TranscriptBubble({ entry }: { entry: TranscriptEntry }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.speaker}>{entry.speakerName}</Text>
        <Text style={styles.time}>{formatTime(entry.timestamp)}</Text>
      </View>
      <Text style={styles.original}>{entry.original}</Text>
      <Text style={styles.translated}>{entry.translated}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  speaker: { color: colors.primary, fontWeight: '600' },
  time: { color: colors.textMuted, fontSize: 12 },
  original: { color: colors.textMuted, fontStyle: 'italic', marginBottom: 2 },
  translated: { color: colors.text, fontSize: 16 },
});
