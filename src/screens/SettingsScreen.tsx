import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { GuestPrompt } from '@/components/GuestPrompt';
import { useAuth } from '@/hooks/useAuth';
import { colors, radius, spacing, typography } from '@/utils/theme';

const ROWS: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: (user: ReturnType<typeof useAuth>['user']) => string;
}[] = [
  { icon: 'person-outline', label: 'Name', value: (u) => u?.name ?? '—' },
  { icon: 'mail-outline', label: 'Email', value: (u) => u?.email ?? '—' },
  {
    icon: 'globe-outline',
    label: 'Preferred language',
    value: (u) => (u?.preferredLanguage ?? '—').toUpperCase(),
  },
];

export function SettingsScreen() {
  const { user, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.guestSafe} edges={['bottom']}>
        <GuestPrompt
          icon="person-circle-outline"
          title="You're browsing as a guest"
          subtitle="Sign in or create an account to manage your profile and preferences."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profile}>
          <Avatar name={user?.name} size={64} />
          <Text style={styles.name}>{user?.name ?? 'Guest'}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
        </View>

        <Card padded={false} style={styles.card}>
          {ROWS.map((row, i) => (
            <View
              key={row.label}
              style={[styles.row, i < ROWS.length - 1 && styles.rowDivider]}
            >
              <View style={styles.rowIcon}>
                <Ionicons name={row.icon} size={18} color={colors.accent} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowValue}>{row.value(user)}</Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={styles.spacer} />

        <Button
          title="Sign out"
          icon="log-out-outline"
          variant="danger"
          onPress={signOut}
        />

        <Text style={styles.version}>Live Interpreter · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  guestSafe: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
  container: { flexGrow: 1, padding: spacing.lg },
  profile: { alignItems: 'center', marginBottom: spacing.xl },
  name: { ...typography.h2, marginTop: spacing.md },
  email: { ...typography.bodyMuted, marginTop: spacing.xxs },
  card: { marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowText: { flex: 1 },
  rowLabel: { ...typography.caption, marginBottom: 2 },
  rowValue: { ...typography.body },
  spacer: { flex: 1, minHeight: spacing.lg },
  version: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
