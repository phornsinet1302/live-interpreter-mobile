import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { ToggleRow } from '@/components/ToggleRow';
import { SelectPillGroup } from '@/components/SelectPillGroup';
import { useAppPreferences } from '@/hooks/useAppPreferences';
import { colors, spacing, typography } from '@/utils/theme';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'NoiseSettings'>;

export function NoiseSettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { preferences, setNoiseReductionEnabled, setNoiseEnvironment } = useAppPreferences();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Audio & Noise Reduction</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card} padded={false}>
          <View style={styles.cardPadding}>
            <ToggleRow
              icon="volume-mute-outline"
              label="Noise reduction"
              subtitle="Suppress background noise while recording"
              value={preferences.noiseReductionEnabled}
              onValueChange={setNoiseReductionEnabled}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardHeader}>Environment</Text>
          <Text style={styles.cardSubtitle}>Tune how aggressively background sound is filtered.</Text>
          <SelectPillGroup
            options={[
              { value: 'quiet', label: 'Quiet' },
              { value: 'normal', label: 'Normal' },
              { value: 'noisy', label: 'Noisy' },
            ]}
            value={preferences.noiseEnvironment}
            onChange={setNoiseEnvironment}
          />
        </Card>

        <View style={styles.noteRow}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
          <Text style={styles.noteText}>
            This controls the app's recording pipeline preferences. Real-time DSP noise
            suppression and echo cancellation need a native audio engine (e.g. WebRTC's built-in
            AEC/NS) wired into a future dev-client build.
          </Text>
        </View>
      </ScrollView>
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
  headerTitle: { ...typography.h3, flex: 1, textAlign: 'center', marginHorizontal: spacing.sm },
  container: { padding: spacing.md, paddingBottom: spacing.xl },
  card: { marginBottom: spacing.md },
  cardPadding: { paddingHorizontal: spacing.lg },
  cardHeader: { ...typography.h3, marginBottom: spacing.xs },
  cardSubtitle: { ...typography.caption, marginBottom: spacing.md },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: spacing.sm, gap: spacing.xs },
  noteText: { ...typography.caption, flex: 1 },
});
