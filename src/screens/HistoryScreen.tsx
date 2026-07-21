import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { GuestPrompt } from '@/components/GuestPrompt';
import { useAuth } from '@/hooks/useAuth';
import { getHistory, getTranscript } from '@/services/history';
import { exportTranscriptToPdf } from '@/services/export';
import { colors, radius, spacing, typography } from '@/utils/theme';
import { formatDate } from '@/utils/format';
import { ApiError, HistoryItem } from '@/types';

export function HistoryScreen() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingId, setExportingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      let active = true;
      (async () => {
        setLoading(true);
        try {
          const data = await getHistory();
          if (active) setItems(data);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [isAuthenticated])
  );

  const onExport = useCallback(async (item: HistoryItem) => {
    setExportingId(item.id);
    try {
      const entries = await getTranscript(item.id);
      await exportTranscriptToPdf(item, entries);
    } catch (e) {
      Alert.alert('Export failed', (e as ApiError).message ?? 'Please try again.');
    } finally {
      setExportingId(null);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.guestSafe} edges={['bottom']}>
        <GuestPrompt
          icon="lock-closed-outline"
          title="Sign in to view your history"
          subtitle="Create a free account or sign in to save your sessions and export transcripts as PDF."
        />
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardIcon}>
              <Ionicons name="chatbubbles-outline" size={20} color={colors.accent} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.metaRow}>
                <Chip label={`${item.source.toUpperCase()} → ${item.target.toUpperCase()}`} tone="primary" />
                <Text style={styles.meta}>{item.entryCount} lines</Text>
              </View>
              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
            </View>
            <Pressable
              onPress={() => onExport(item)}
              disabled={exportingId === item.id}
              style={({ pressed }) => [
                styles.exportButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              {exportingId === item.id ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Ionicons name="download-outline" size={20} color={colors.accent} />
              )}
            </Pressable>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="time-outline"
            title="No sessions yet"
            subtitle="Your past interpreting sessions will show up here."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  guestSafe: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  list: { padding: spacing.md, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardBody: { flex: 1 },
  title: { ...typography.h3, marginBottom: spacing.xs },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxs,
  },
  meta: { ...typography.caption },
  date: { ...typography.caption },
  exportButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
