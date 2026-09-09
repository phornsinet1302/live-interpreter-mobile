import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Input } from '@/components/Input';
import { EmptyState } from '@/components/EmptyState';
import { GuestPrompt } from '@/components/GuestPrompt';
import { useAuth } from '@/hooks/useAuth';
import { getHistory, deleteHistoryItem } from '@/services/history';
import { getFavoriteIds, toggleFavorite } from '@/services/favorites';
import { colors, radius, spacing, typography } from '@/utils/theme';
import { formatDate } from '@/utils/format';
import { HistoryItem } from '@/types';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HistoryScreen() {
  const navigation = useNavigation<Nav>();
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

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
          const [data, favs] = await Promise.all([getHistory(), getFavoriteIds()]);
          if (active) {
            setItems(data);
            setFavoriteIds(favs);
          }
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [isAuthenticated])
  );

  const languages = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      set.add(item.source);
      set.add(item.target);
    });
    return [...set];
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (q && !item.title.toLowerCase().includes(q)) return false;
      if (languageFilter && item.source !== languageFilter && item.target !== languageFilter) return false;
      if (favoritesOnly && !favoriteIds.includes(item.id)) return false;
      return true;
    });
  }, [items, query, languageFilter, favoritesOnly, favoriteIds]);

  const onToggleFavorite = useCallback(async (id: string) => {
    const next = await toggleFavorite(id);
    setFavoriteIds(next);
  }, []);

  const onDelete = useCallback((item: HistoryItem) => {
    Alert.alert('Delete session', `Remove "${item.title}" from your history?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setItems((prev) => prev.filter((i) => i.id !== item.id));
          try {
            await deleteHistoryItem(item.id);
          } catch {
            // No backend yet — keep it removed locally.
          }
        },
      },
    ]);
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
      <View style={styles.searchWrap}>
        <Input
          icon="search-outline"
          placeholder="Search sessions"
          value={query}
          onChangeText={setQuery}
          containerStyle={styles.searchInput}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <Pressable onPress={() => setFavoritesOnly((f) => !f)}>
          <Chip
            label="★ Favorites"
            tone={favoritesOnly ? 'primary' : 'muted'}
            style={styles.filterChip}
          />
        </Pressable>
        {languages.map((lang) => (
          <Pressable key={lang} onPress={() => setLanguageFilter((cur) => (cur === lang ? null : lang))}>
            <Chip
              label={lang.toUpperCase()}
              tone={languageFilter === lang ? 'primary' : 'muted'}
              style={styles.filterChip}
            />
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('HistoryDetail', { item })}>
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
              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => onToggleFavorite(item.id)}
                  hitSlop={8}
                  style={styles.iconButton}
                >
                  <Ionicons
                    name={favoriteIds.includes(item.id) ? 'star' : 'star-outline'}
                    size={18}
                    color={colors.accent}
                  />
                </Pressable>
                <Pressable onPress={() => onDelete(item)} hitSlop={8} style={styles.iconButton}>
                  <Ionicons name="trash-outline" size={18} color={colors.textFaint} />
                </Pressable>
              </View>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="time-outline"
            title={items.length === 0 ? 'No sessions yet' : 'No matching sessions'}
            subtitle={
              items.length === 0
                ? 'Your past interpreting sessions will show up here.'
                : 'Try a different search term or filter.'
            }
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
  searchWrap: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  searchInput: { marginBottom: 0 },
  filterRow: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.xs },
  filterChip: { marginRight: spacing.xs },
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
  cardActions: { flexDirection: 'row', marginLeft: spacing.sm },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
