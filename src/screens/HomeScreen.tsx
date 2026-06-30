import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { createMeeting, joinMeeting } from '@/services/meeting';
import { colors, radius, spacing } from '@/utils/theme';
import { RootStackParamList } from '@/navigation/types';
import { ApiError } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      const meeting = await createMeeting('Quick session');
      navigation.navigate('Interpreter', { meetingId: meeting.id });
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const join = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const meeting = await joinMeeting(
        code.trim(),
        user?.preferredLanguage ?? 'en'
      );
      navigation.navigate('Interpreter', { meetingId: meeting.id });
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <Text style={styles.greeting}>
          Hello{user?.name ? `, ${user.name}` : ''} 👋
        </Text>
        <Text style={styles.subtitle}>Start or join a live session</Text>

        <Button title="Start new session" onPress={start} loading={busy} />

        <View style={styles.divider}>
          <Text style={styles.dividerText}>or join with a code</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Meeting code"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          value={code}
          onChangeText={setCode}
        />
        <Button
          title="Join session"
          variant="secondary"
          onPress={join}
          loading={busy}
        />

        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.lg },
  greeting: { color: colors.text, fontSize: 26, fontWeight: '700' },
  subtitle: { color: colors.textMuted, marginBottom: spacing.xl },
  divider: { alignItems: 'center', marginVertical: spacing.lg },
  dividerText: { color: colors.textMuted },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  error: { color: colors.danger, marginTop: spacing.md },
});
