import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, radius, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';

export type ExportFormat = 'pdf' | 'docx' | 'txt';

interface ExportOptionsSheetProps {
  visible: boolean;
  busy?: boolean;
  onClose: () => void;
  onSelect: (format: ExportFormat) => void;
}

const OPTIONS: { format: ExportFormat; label: string; sub: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { format: 'pdf', label: 'Export as PDF', sub: 'Best for sharing and printing', icon: 'document-text-outline' },
  { format: 'docx', label: 'Export as DOCX', sub: 'Editable in Word or Google Docs', icon: 'document-outline' },
  { format: 'txt', label: 'Export as TXT', sub: 'Plain text, smallest file size', icon: 'reader-outline' },
];

export function ExportOptionsSheet({ visible, busy, onClose, onSelect }: ExportOptionsSheetProps) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Export transcript</Text>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.format}
              disabled={busy}
              onPress={() => onSelect(opt.format)}
              style={({ pressed }) => [styles.row, { opacity: busy ? 0.5 : pressed ? 0.7 : 1 }]}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={opt.icon} size={18} color={colors.accent} />
              </View>
              <View style={styles.text}>
                <Text style={styles.label}>{opt.label}</Text>
                <Text style={styles.sub}>{opt.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
            </Pressable>
          ))}
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
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: spacing.md,
    },
    title: { ...typography.h3, marginBottom: spacing.sm },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: colors.accentMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    text: { flex: 1 },
    label: { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.text },
    sub: { ...typography.caption, marginTop: 2 },
  });
}
