import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, radius, spacing, ThemeColors } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';

interface GoogleSignInButtonProps {
  onPress: () => void;
  loading?: boolean;
}

export function GoogleSignInButton({ onPress, loading }: GoogleSignInButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [styles.base, { opacity: loading ? 0.6 : pressed ? 0.75 : 1 }]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <>
          <Ionicons name="logo-google" size={18} color={colors.text} style={styles.icon} />
          <Text style={styles.label}>Continue with Google</Text>
        </>
      )}
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
}
