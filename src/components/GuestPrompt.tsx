import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { colors, radius, spacing, typography } from '@/utils/theme';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface GuestPromptProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

export function GuestPrompt({ icon, title, subtitle }: GuestPromptProps) {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={28} color={colors.accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.actions}>
        <Button
          title="Sign in"
          icon="log-in-outline"
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
        />
        <Button
          title="Create account"
          icon="person-add-outline"
          variant="secondary"
          onPress={() => navigation.navigate('Register')}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { ...typography.h2, textAlign: 'center' },
  subtitle: {
    ...typography.bodyMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  actions: { width: '100%', gap: spacing.sm },
  button: { width: '100%' },
});
