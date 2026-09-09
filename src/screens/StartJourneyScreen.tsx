import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { useOnboarding } from '@/hooks/useOnboarding';
import { fonts, radius, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'StartJourney'>;

const LANGUAGE_CHIPS: { label: string; style: object }[] = [
  { label: 'EN', style: { top: 4, left: 10 } },
  { label: 'FR', style: { top: 10, right: 4 } },
  { label: 'ES', style: { bottom: 4, left: 0 } },
  { label: 'DE', style: { bottom: 10, right: 12 } },
];

export function StartJourneyScreen() {
  const navigation = useNavigation<Nav>();
  const { completeOnboarding } = useOnboarding();
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const continueAsGuest = () => {
    completeOnboarding();
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Pressable
        style={styles.back}
        onPress={() => navigation.goBack()}
        hitSlop={12}
      >
        <Ionicons name="arrow-back" size={18} color={colors.text} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.container}>
        <View style={styles.wheel}>
          <View style={styles.wheelRing} />
          <View style={styles.wheelCenter}>
            <Ionicons name="swap-horizontal" size={28} color={colors.white} />
          </View>
          {LANGUAGE_CHIPS.map((chip) => (
            <View key={chip.label} style={[styles.langChip, chip.style]}>
              <Text style={styles.langChipText}>{chip.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>
            Start Your <Text style={styles.titleAccent}>Journey</Text>
          </Text>
          <Text style={styles.subtitle}>
            Join millions of speakers. Translate in 60+ languages, voice-first,
            in real time.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Log In"
            onPress={() => navigation.navigate('Login')}
            style={styles.button}
          />
          <Button
            title="Create Account"
            variant="secondary"
            onPress={() => navigation.navigate('Register')}
            style={styles.button}
          />
          <Button
            title="Continue as Guest"
            variant="ghost"
            onPress={continueAsGuest}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, typography: ThemeTypography) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  backText: { ...typography.body, fontFamily: fonts.sansMedium },
  container: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheel: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  wheelRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
  },
  wheelCenter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langChip: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langChipText: { fontFamily: fonts.sansBold, fontSize: 11, color: colors.text },
  copy: { alignItems: 'center', marginBottom: spacing.xl },
  title: { ...typography.display, textAlign: 'center', marginBottom: spacing.sm },
  titleAccent: { color: colors.accent },
  subtitle: {
    ...typography.bodyMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  actions: { width: '100%', gap: spacing.sm },
  button: { width: '100%' },
  });
}
