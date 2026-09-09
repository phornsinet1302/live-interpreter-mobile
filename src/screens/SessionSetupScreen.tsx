import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import * as conversationsService from '@/services/conversations';
import { useAuth } from '@/hooks/useAuth';
import { radius, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SessionSetup'>;

export function SessionSetupScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const startDemo = () => {
    navigation.replace('Session', { meetingId: `demo-${Date.now()}` });
  };

  const onCreate = async () => {
    setLoading(true);
    setNotice(null);
    try {
      const conversation = await conversationsService.createConversation({
        title: title.trim() || 'New session',
        sourceLanguage: 'auto',
        targetLanguage: user?.preferredLanguage ?? 'en',
      });
      navigation.replace('Session', { meetingId: conversation.id });
    } catch {
      setNotice(
        "Couldn't reach the server to create a session — you can still try the flow with a demo session."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
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

          <View style={styles.form}>
            <Input
              label="Session name"
              placeholder="e.g. Client Kickoff Call"
              value={title}
              onChangeText={setTitle}
            />

            {notice && (
              <View style={styles.noticeBanner}>
                <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
                <Text style={styles.noticeText}>{notice}</Text>
              </View>
            )}

            <Button
              title="Create session"
              onPress={onCreate}
              loading={loading}
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

function createStyles(colors: ThemeColors, typography: ThemeTypography) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  topBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
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
}
