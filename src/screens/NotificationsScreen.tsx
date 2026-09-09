import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Card } from '@/components/Card';
import { ToggleRow } from '@/components/ToggleRow';
import { NotificationRow } from '@/components/NotificationRow';
import { EmptyState } from '@/components/EmptyState';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { SelectPillGroup } from '@/components/SelectPillGroup';
import { MOCK_NOTIFICATIONS } from '@/mocks/notifications';
import { useAppPreferences } from '@/hooks/useAppPreferences';
import { useNotifications } from '@/hooks/useNotifications';
import * as remindersService from '@/services/reminders';
import { fonts, radius, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { Reminder } from '@/types';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Notifications'>;
type ReminderOffset = '1h' | '1d' | '3d';

const OFFSET_MS: Record<ReminderOffset, number> = {
  '1h': 3_600_000,
  '1d': 86_400_000,
  '3d': 3 * 86_400_000,
};

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function NotificationsScreen() {
  const navigation = useNavigation<Nav>();
  const { preferences, setNotificationsEnabled } = useAppPreferences();
  const { items, markRead, markAllRead } = useNotifications();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderOffset, setReminderOffset] = useState<ReminderOffset>('1d');
  const [addingReminder, setAddingReminder] = useState(false);
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  useEffect(() => {
    remindersService
      .listReminders()
      .then(setReminders)
      .catch(() => {});
  }, []);

  const onToggle = async (value: boolean) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission denied',
          'Notifications are blocked for this app in system settings.'
        );
        setNotificationsEnabled(false);
        return;
      }
    }
    setNotificationsEnabled(value);
  };

  const onAddReminder = useCallback(async () => {
    const message = reminderMessage.trim();
    if (!message) return;
    setAddingReminder(true);
    try {
      const remindAt = new Date(Date.now() + OFFSET_MS[reminderOffset]).toISOString();
      const reminder = await remindersService.createReminder({ message, remindAt });
      setReminders((prev) => [reminder, ...prev]);
      setReminderMessage('');
    } catch {
      Alert.alert('Could not schedule reminder', 'Please try again.');
    } finally {
      setAddingReminder(false);
    }
  }, [reminderMessage, reminderOffset]);

  const onDeleteReminder = useCallback(async (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    try {
      await remindersService.deleteReminder(id);
    } catch {
      // Already removed locally.
    }
  }, []);

  const usingPreview = items.length === 0;
  const list = usingPreview ? MOCK_NOTIFICATIONS : items;
  const sections = [
    { title: 'Today', data: list.filter((n) => isToday(n.createdAt)) },
    { title: 'Earlier', data: list.filter((n) => !isToday(n.createdAt)) },
  ].filter((s) => s.data.length > 0);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        {!usingPreview ? (
          <Pressable onPress={markAllRead} hitSlop={12}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </Pressable>
        ) : (
          <View style={{ width: 20 }} />
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <Card style={styles.toggleCard} padded={false}>
              <View style={styles.togglePadding}>
                <ToggleRow
                  icon="notifications-outline"
                  label="Enable push notifications"
                  subtitle="Get notified about sessions, exports, and reminders"
                  value={preferences.notificationsEnabled}
                  onValueChange={onToggle}
                />
              </View>
            </Card>

            <Card style={styles.card}>
              <Text style={styles.cardHeader}>Reminders</Text>
              {reminders.map((r) => (
                <View key={r.id} style={styles.reminderRow}>
                  <View style={styles.reminderIcon}>
                    <Ionicons name="alarm-outline" size={16} color={colors.accent} />
                  </View>
                  <View style={styles.reminderText}>
                    <Text style={styles.reminderMessage}>{r.message}</Text>
                    <Text style={styles.reminderTime}>
                      {new Date(r.remindAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </Text>
                  </View>
                  <Pressable onPress={() => onDeleteReminder(r.id)} hitSlop={8}>
                    <Ionicons name="close" size={16} color={colors.textFaint} />
                  </Pressable>
                </View>
              ))}

              <Input
                placeholder="Remind me to…"
                value={reminderMessage}
                onChangeText={setReminderMessage}
                containerStyle={styles.reminderInput}
              />
              <SelectPillGroup
                options={[
                  { value: '1h', label: 'In 1 hour' },
                  { value: '1d', label: 'Tomorrow' },
                  { value: '3d', label: 'In 3 days' },
                ]}
                value={reminderOffset}
                onChange={setReminderOffset}
              />
              <Button
                title="Add reminder"
                variant="secondary"
                onPress={onAddReminder}
                loading={addingReminder}
                disabled={!reminderMessage.trim()}
                style={styles.addReminderButton}
              />
            </Card>

            {usingPreview && (
              <Text style={styles.previewNote}>Preview data — sign in to see your real notifications.</Text>
            )}
          </>
        }
        renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
        renderItem={({ item }) => (
          <NotificationRow item={item} onPress={() => (usingPreview ? undefined : markRead(item.id))} />
        )}
        ListEmptyComponent={
          <EmptyState icon="notifications-outline" title="No notifications" subtitle="You're all caught up." />
        }
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
  headerTitle: { ...typography.h3 },
  markAllText: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.accent },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  toggleCard: { marginBottom: spacing.md },
  togglePadding: { paddingHorizontal: spacing.lg },
  card: { marginBottom: spacing.md },
  cardHeader: { ...typography.h3, marginBottom: spacing.sm },
  reminderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  reminderIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  reminderText: { flex: 1 },
  reminderMessage: { ...typography.body, fontSize: 14 },
  reminderTime: { ...typography.caption },
  reminderInput: { marginTop: spacing.sm, marginBottom: spacing.sm },
  addReminderButton: { marginTop: spacing.sm, alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  previewNote: { ...typography.caption, textAlign: 'center', marginBottom: spacing.sm },
  sectionTitle: { ...typography.label, marginTop: spacing.md, marginBottom: spacing.xs },
  });
}
