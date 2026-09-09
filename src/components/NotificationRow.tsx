import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationItem, NotificationType } from '@/types';
import { colors, fonts, radius, spacing, typography } from '@/utils/theme';

const ICONS: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  invitation: 'people-outline',
  translation: 'language-outline',
  export: 'download-outline',
  reminder: 'alarm-outline',
  system: 'sparkles-outline',
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.round(diffMs / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

interface NotificationRowProps {
  item: NotificationItem;
  onPress?: () => void;
}

export function NotificationRow({ item, onPress }: NotificationRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={ICONS[item.type]} size={18} color={colors.accent} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          {!item.read && <View style={styles.dot} />}
        </View>
        <Text style={styles.text} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: spacing.md },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  body: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { ...typography.h3, flexShrink: 1 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginLeft: spacing.xs,
  },
  text: { ...typography.bodyMuted, fontSize: 13, marginTop: 2 },
  time: { ...typography.caption, marginTop: 4 },
});
