import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { radius, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';

interface StopListeningSheetProps {
  visible: boolean;
  onContinue: () => void;
  onCloseWithoutSaving: () => void;
  onCloseAndSave: () => void;
}

export function StopListeningSheet({
  visible,
  onContinue,
  onCloseWithoutSaving,
  onCloseAndSave,
}: StopListeningSheetProps) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onContinue}>
      <Pressable style={styles.backdrop} onPress={onContinue}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          <View style={styles.iconWrap}>
            <Ionicons name="mic-off-outline" size={26} color={colors.accent} />
          </View>
          <Text style={styles.title}>Stop listening?</Text>
          <Text style={styles.subtitle}>
            You can keep going, close without saving, or save this conversation to your history.
          </Text>

          <View style={styles.actions}>
            <Button title="Save & close" onPress={onCloseAndSave} style={styles.action} />
            <Button
              title="Close without saving"
              variant="danger"
              onPress={onCloseWithoutSaving}
              style={styles.action}
            />
            <Button title="Continue listening" variant="ghost" onPress={onContinue} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(colors: ThemeColors, typography: ThemeTypography) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(43, 38, 32, 0.4)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: colors.backgroundElevated,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      padding: spacing.lg,
      paddingBottom: spacing.xl,
      alignItems: 'center',
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: spacing.md,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: radius.xl,
      backgroundColor: colors.accentMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    title: { ...typography.h2, marginBottom: spacing.xs, textAlign: 'center' },
    subtitle: {
      ...typography.bodyMuted,
      textAlign: 'center',
      marginBottom: spacing.lg,
      paddingHorizontal: spacing.sm,
    },
    actions: { width: '100%', gap: spacing.sm },
    action: {},
  });
}
