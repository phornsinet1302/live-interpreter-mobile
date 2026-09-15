import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { radius, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';

interface ConfirmSheetProps {
  visible: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Danger-styled confirm button — the norm for a destructive action like this. */
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Themed replacement for Alert.alert(...) confirmations — matches the app's
 *  own bottom-sheet style (see StopListeningSheet/ExportOptionsSheet)
 *  instead of the plain OS dialog. */
export function ConfirmSheet({
  visible,
  icon = 'trash-outline',
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  destructive = true,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          <View style={[styles.iconWrap, destructive && styles.iconWrapDanger]}>
            <Ionicons name={icon} size={26} color={destructive ? colors.danger : colors.accent} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <Button
              title={confirmLabel}
              variant={destructive ? 'danger' : 'primary'}
              onPress={onConfirm}
              loading={busy}
              style={styles.action}
            />
            <Button title={cancelLabel} variant="ghost" onPress={onCancel} disabled={busy} />
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
    iconWrapDanger: { backgroundColor: colors.dangerMuted },
    title: { ...typography.h2, marginBottom: spacing.xs, textAlign: 'center' },
    message: {
      ...typography.bodyMuted,
      textAlign: 'center',
      marginBottom: spacing.lg,
      paddingHorizontal: spacing.sm,
    },
    actions: { width: '100%', gap: spacing.sm },
    action: {},
  });
}
