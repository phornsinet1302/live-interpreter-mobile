import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/utils/theme';

interface GoogleSignInButtonProps {
  onPress: () => void;
}

export function GoogleSignInButton({ onPress }: GoogleSignInButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.base, { opacity: pressed ? 0.75 : 1 }]}
    >
      <Ionicons name="logo-google" size={18} color={colors.text} style={styles.icon} />
      <Text style={styles.label}>Continue with Google</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  icon: { marginRight: spacing.sm },
  label: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.text },
});
