import React, { useState } from 'react';
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
import { MOCK_NOTIFICATIONS } from '@/mocks/notifications';
import { useAppPreferences } from '@/hooks/useAppPreferences';
import { colors, spacing, typography } from '@/utils/theme';
import { NotificationItem } from '@/types';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Notifications'>;

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function NotificationsScreen() {
  const navigation = useNavigation<Nav>();
  const { preferences, setNotificationsEnabled } = useAppPreferences();
  const [items, setItems] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

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

  const markRead = (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const sections = [
    { title: 'Today', data: items.filter((n) => isToday(n.createdAt)) },
    { title: 'Earlier', data: items.filter((n) => !isToday(n.createdAt)) },
  ].filter((s) => s.data.length > 0);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 20 }} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
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
        }
        renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
        renderItem={({ item }) => <NotificationRow item={item} onPress={() => markRead(item.id)} />}
        ListEmptyComponent={
          <EmptyState icon="notifications-outline" title="No notifications" subtitle="You're all caught up." />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  toggleCard: { marginBottom: spacing.md },
  togglePadding: { paddingHorizontal: spacing.lg },
  sectionTitle: { ...typography.label, marginTop: spacing.md, marginBottom: spacing.xs },
});
