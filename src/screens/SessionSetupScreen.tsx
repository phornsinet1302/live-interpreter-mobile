import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { SelectPillGroup } from '@/components/SelectPillGroup';
import * as meetingService from '@/services/meeting';
import { useAuth } from '@/hooks/useAuth';
import { colors, radius, spacing, typography } from '@/utils/theme';
import { ApiError } from '@/types';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SessionSetup'>;
type Mode = 'create' | 'join';

export function SessionSetupScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('create');
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const startDemo = () => {
    navigation.replace('Session', { meetingId: `demo-${Date.now()}` });
  };

  const onCreate = async () => {
    setLoading(true);
    setNotice(null);
    try {
      const meeting = await meetingService.createMeeting(title.trim() || 'New session');
      navigation.replace('Session', { meetingId: meeting.id });
    } catch {
      setNotice(
        "Couldn't reach the server to create a session — you can still try the flow with a demo session."
      );
    } finally {
      setLoading(false);
    }
  };

  const onJoin = async () => {
    setLoading(true);
    setNotice(null);
    try {
      const meeting = await meetingService.joinMeeting(
        code.trim().toUpperCase(),
        user?.preferredLanguage ?? 'en'
      );
      navigation.replace('Session', { meetingId: meeting.id });
    } catch {
      setNotice(
        "Couldn't reach the server to join that code — you can still try the flow with a demo session."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.iconWrap}>
            <Ionicons name="people-outline" size={28} color={colors.accent} />
          </View>
          <Text style={styles.title}>Group session</Text>
          <Text style={styles.subtitle}>
            Create a shared session so every participant sees live, speaker-labeled subtitles in
            their own language.
          </Text>

          <SelectPillGroup
            options={[
              { value: 'create', label: 'Create' },
              { value: 'join', label: 'Join by code' },
            ]}
            value={mode}
            onChange={setMode}
          />

          <View style={styles.form}>
            {mode === 'create' ? (
              <Input
                label="Session name"
                placeholder="e.g. Client Kickoff Call"
                value={title}
                onChangeText={setTitle}
              />
            ) : (
              <Input
                label="Session code"
                placeholder="e.g. 8F3QZ1"
                autoCapitalize="characters"
                value={code}
                onChangeText={setCode}
              />
            )}

            {notice && (
              <View style={styles.noticeBanner}>
                <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
                <Text style={styles.noticeText}>{notice}</Text>
              </View>
            )}

            <Button
              title={mode === 'create' ? 'Create session' : 'Join session'}
              onPress={mode === 'create' ? onCreate : onJoin}
              loading={loading}
              disabled={mode === 'join' && !code.trim()}
              style={styles.submit}
            />

            {notice && (
              <Button
                title="Start a demo session instead"
                variant="secondary"
                icon="play-outline"
                onPress={startDemo}
                style={styles.submit}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: spacing.lg, alignItems: 'center', paddingTop: spacing.lg },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { ...typography.h1, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: {
    ...typography.bodyMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  form: { width: '100%', marginTop: spacing.lg },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  noticeText: { ...typography.caption, marginLeft: spacing.xs, flex: 1 },
  submit: { marginTop: spacing.xs },
});
