import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Chip } from '@/components/Chip';
import { TranscriptBubble } from '@/components/TranscriptBubble';
import { EmptyState } from '@/components/EmptyState';
import { ExportOptionsSheet, ExportFormat } from '@/components/ExportOptionsSheet';
import { ConfirmSheet } from '@/components/ConfirmSheet';
import { getTranscript, deleteHistoryItem, setFavorite as setConversationFavorite } from '@/services/history';
import { exportTranscript } from '@/services/export';
import { fonts, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { ApiError, TranscriptEntry } from '@/types';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'HistoryDetail'>;
type Rt = RouteProp<RootStackParamList, 'HistoryDetail'>;

export function HistoryDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { item } = route.params;

  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(!!item.favorite);
  const [exportSheetVisible, setExportSheetVisible] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteSheetVisible, setDeleteSheetVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getTranscript(item.id);
        if (active) setEntries(data);
      } catch {
        // No backend yet — the screen still shows summary/export actions.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [item.id]);

  const onToggleFavorite = useCallback(async () => {
    const next = !favorite;
    setFavorite(next);
    try {
      await setConversationFavorite(item.id, next);
    } catch {
      setFavorite(!next);
    }
  }, [item.id, favorite]);

  const onExport = useCallback(
    async (format: ExportFormat) => {
      setExporting(true);
      try {
        await exportTranscript(item, entries, format);
        setExportSheetVisible(false);
      } catch (e) {
        Alert.alert('Export failed', (e as ApiError).message ?? 'Please try again.');
      } finally {
        setExporting(false);
      }
    },
    [item, entries]
  );

  const onConfirmDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteHistoryItem(item.id);
      navigation.goBack();
    } catch {
      setDeleting(false);
      // Leave the sheet open with the session intact rather than pretending it deleted.
    }
  }, [item.id, navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{item.title}</Text>
        <Pressable onPress={onToggleFavorite} hitSlop={12}>
          <Ionicons name={favorite ? 'star' : 'star-outline'} size={20} color={colors.accent} />
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <Chip label={`${item.source.toUpperCase()} → ${item.target.toUpperCase()}`} tone="primary" />
        <Text style={styles.metaText}>{item.entryCount} lines</Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          style={styles.actionButton}
          onPress={() => navigation.navigate('Summary', { entries, historyId: item.id, title: item.title })}
        >
          <Ionicons name="sparkles-outline" size={16} color={colors.accent} />
          <Text style={styles.actionLabel}>AI Summary</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => setExportSheetVisible(true)}>
          <Ionicons name="download-outline" size={16} color={colors.accent} />
          <Text style={styles.actionLabel}>Export</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => setDeleteSheetVisible(true)}>
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
          <Text style={[styles.actionLabel, { color: colors.danger }]}>Delete</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: entry }) => <TranscriptBubble entry={entry} showSpeaker />}
          ListEmptyComponent={
            <EmptyState
              icon="chatbubbles-outline"
              title="No transcript available"
              subtitle="This session's full transcript will appear here once it's connected to a backend."
            />
          }
        />
      )}

      <ExportOptionsSheet
        visible={exportSheetVisible}
        busy={exporting}
        onClose={() => setExportSheetVisible(false)}
        onSelect={onExport}
      />

      <ConfirmSheet
        visible={deleteSheetVisible}
        title="Delete session"
        message="This removes the session from your history. This cannot be undone."
        busy={deleting}
        onConfirm={onConfirmDelete}
        onCancel={() => setDeleteSheetVisible(false)}
      />
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, typography: ThemeTypography) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h3, flex: 1, textAlign: 'center', marginHorizontal: spacing.sm },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  metaText: { ...typography.caption },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  actionLabel: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.accent },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.md, flexGrow: 1 },
  });
}
