import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { colors, fonts, radius, spacing, typography } from '@/utils/theme';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const GREETINGS: { label: string; style: object }[] = [
  { label: 'Hello!', style: { top: 8, left: 6 } },
  { label: 'Bonjour', style: { top: 30, right: 0 } },
  { label: '¡Hola!', style: { bottom: 10, left: 20 } },
];

export function WelcomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.logoRow}>
          <Ionicons name="chatbubble-ellipses" size={18} color={colors.accent} />
          <Text style={styles.logo}>Live Interpreter</Text>
        </View>

        <View style={styles.illustration}>
          <Ionicons
            name="leaf-outline"
            size={26}
            color={colors.accent}
            style={styles.leafOne}
          />
          <Ionicons
            name="leaf-outline"
            size={20}
            color={colors.accent}
            style={styles.leafTwo}
          />
          <View style={styles.circleOuter}>
            <View style={styles.circleInner}>
              <Ionicons name="globe-outline" size={56} color={colors.accent} />
            </View>
          </View>
          {GREETINGS.map((g) => (
            <View key={g.label} style={[styles.bubble, g.style]}>
              <Text style={styles.bubbleText}>{g.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>
            Welcome to{'\n'}
            <Text style={styles.titleAccent}>Live Interpreter</Text>
          </Text>
          <Text style={styles.subtitle}>
            Break language barriers — speak naturally, translate instantly,
            connect globally.
          </Text>
        </View>

        <Button
          title="Get Started"
          icon="arrow-forward"
          onPress={() => navigation.navigate('StartJourney')}
          style={styles.cta}
        />

        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    position: 'absolute',
    top: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logo: { fontFamily: fonts.serif, fontSize: 18, color: colors.text },
  illustration: {
    width: 260,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  circleOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  leafOne: { position: 'absolute', top: 0, left: 0, opacity: 0.6 },
  leafTwo: { position: 'absolute', bottom: 4, right: 4, opacity: 0.5 },
  bubble: {
    position: 'absolute',
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
  },
  bubbleText: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.text },
  copy: { alignItems: 'center', marginBottom: spacing.xl },
  title: {
    ...typography.display,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  titleAccent: { fontFamily: fonts.serifItalic, color: colors.accent },
  subtitle: {
    ...typography.bodyMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  cta: { width: '100%', marginBottom: spacing.lg },
  dots: { flexDirection: 'row', gap: spacing.xs },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: { backgroundColor: colors.accent, width: 18 },
});
