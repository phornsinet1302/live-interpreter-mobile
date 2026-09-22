import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { GuestPrompt } from '@/components/GuestPrompt';
import { LanguagePickerModal } from '@/components/LanguagePickerModal';
import { SelectPillGroup } from '@/components/SelectPillGroup';
import { useAuth } from '@/hooks/useAuth';
import { useAppPreferences } from '@/hooks/useAppPreferences';
import { useTheme } from '@/hooks/useTheme';
import { languageName } from '@/mocks/languages';
import { fonts, radius, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface RowConfig {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  danger?: boolean;
  onPress: () => void;
}

function SectionCard({ title, rows }: { title: string; rows: RowConfig[] }) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card padded={false} style={styles.card}>
        {rows.map((row, i) => (
          <Row key={row.label} row={row} isLast={i === rows.length - 1} />
        ))}
      </Card>
    </View>
  );
}

function Row({ row, isLast }: { row: RowConfig; isLast: boolean }) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  return (
    <Pressable
      onPress={row.onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowDivider,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.rowIcon, row.danger && styles.rowIconDanger]}>
        <Ionicons name={row.icon} size={18} color={row.danger ? colors.danger : colors.accent} />
      </View>
      <Text style={[styles.rowLabel, row.danger && { color: colors.danger }]}>{row.label}</Text>
      {row.value ? <Text style={styles.rowValue}>{row.value}</Text> : null}
      <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
    </Pressable>
  );
}

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { user, isAuthenticated, signOut, updateProfile } = useAuth();
  const { preferences, setTheme } = useAppPreferences();
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const [languagePickerVisible, setLanguagePickerVisible] = useState(false);

  const onSelectLanguage = (code: string) => {
    updateProfile({ preferredLanguage: code }).catch(() => {
      Alert.alert('Could not save', 'Please check your connection and try again.');
    });
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.guestSafe} edges={['bottom']}>
        <GuestPrompt
          icon="person-circle-outline"
          title="You're browsing as a guest"
          subtitle="Sign in or create an account to manage your profile and preferences."
        />
        <View style={styles.guestTools}>
          <SectionCard
            title="Tools"
            rows={[
              {
                icon: 'add-circle-outline',
                label: 'New session',
                onPress: () => navigation.navigate('NewSession'),
              },
            ]}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profile}>
          <Avatar name={user?.name} uri={user?.avatarUrl} size={64} />
          <Text style={styles.name}>{user?.name ?? 'Guest'}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
        </View>

        <SectionCard
          title="Account"
          rows={[
            {
              icon: 'person-outline',
              label: 'Edit profile',
              value: user?.name,
              onPress: () => navigation.navigate('EditProfile'),
            },
            {
              icon: 'trash-outline',
              label: 'Delete account',
              danger: true,
              onPress: () => navigation.navigate('DeleteAccount'),
            },
          ]}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Card style={styles.appearanceCard}>
            <View style={styles.appearanceRow}>
              <View style={styles.rowIcon}>
                <Ionicons name="contrast-outline" size={18} color={colors.accent} />
              </View>
              <Text style={styles.rowLabel}>Appearance</Text>
            </View>
            <SelectPillGroup
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System' },
              ]}
              value={preferences.theme}
              onChange={setTheme}
            />
          </Card>
          <Card padded={false} style={styles.card}>
            <Row
              row={{
                icon: 'globe-outline',
                label: 'Preferred language',
                value: languageName(user?.preferredLanguage ?? 'en'),
                onPress: () => setLanguagePickerVisible(true),
              }}
              isLast={false}
            />
            <Row
              row={{
                icon: 'notifications-outline',
                label: 'Notifications',
                onPress: () => navigation.navigate('Notifications'),
              }}
              isLast={false}
            />
            <Row
              row={{
                icon: 'volume-mute-outline',
                label: 'Audio & noise reduction',
                onPress: () => navigation.navigate('NoiseSettings'),
              }}
              isLast
            />
          </Card>
        </View>

        <SectionCard
          title="Tools"
          rows={[
            {
              icon: 'add-circle-outline',
              label: 'New session',
              onPress: () => navigation.navigate('NewSession'),
            },
            {
              icon: 'stats-chart-outline',
              label: 'Analytics dashboard',
              onPress: () => navigation.navigate('Analytics'),
            },
          ]}
        />

        <View style={styles.spacer} />

        <Button title="Sign out" icon="log-out-outline" variant="danger" onPress={signOut} />

        <Text style={styles.version}>Live Interpreter · v1.0.0</Text>
      </ScrollView>

      <LanguagePickerModal
        visible={languagePickerVisible}
        selected={user?.preferredLanguage ?? 'en'}
        title="Preferred language"
        onSelect={onSelectLanguage}
        onClose={() => setLanguagePickerVisible(false)}
      />
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, typography: ThemeTypography) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    guestSafe: { flex: 1, backgroundColor: colors.background },
    guestTools: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
    container: { flexGrow: 1, padding: spacing.lg },
    profile: { alignItems: 'center', marginBottom: spacing.xl },
    name: { ...typography.h2, marginTop: spacing.md },
    email: { ...typography.bodyMuted, marginTop: spacing.xxs },
    section: { marginBottom: spacing.lg },
    sectionTitle: { ...typography.label, marginBottom: spacing.sm },
    card: {},
    appearanceCard: { marginBottom: spacing.sm },
    appearanceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
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
    rowIconDanger: { backgroundColor: colors.dangerMuted },
    rowLabel: { ...typography.body, flex: 1, fontFamily: fonts.sansMedium },
    rowValue: { ...typography.caption, marginRight: spacing.sm },
    spacer: { minHeight: spacing.sm },
    version: {
      ...typography.caption,
      textAlign: 'center',
      marginTop: spacing.lg,
    },
  });
}
