import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import {
  BACKGROUND_PRESETS,
  FONT_STYLES,
  type BackgroundPresetKey,
  type FontStyleKey,
} from '@/utils/sessionAppearance';

interface SessionAppearanceSheetProps {
  visible: boolean;
  fontStyle: FontStyleKey;
  backgroundPreset: BackgroundPresetKey;
  onSelectFontStyle: (key: FontStyleKey) => void;
  onSelectBackgroundPreset: (key: BackgroundPresetKey) => void;
  onClose: () => void;
}

export function SessionAppearanceSheet({
  visible,
  fontStyle,
  backgroundPreset,
  onSelectFontStyle,
  onSelectBackgroundPreset,
  onClose,
}: SessionAppearanceSheetProps) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Appearance</Text>
          <Text style={styles.subtitle}>Only changes how this session looks — Home stays as-is.</Text>

          <Text style={styles.sectionLabel}>Font style</Text>
          <View style={styles.fontRow}>
            {FONT_STYLES.map((style) => {
              const selected = style.key === fontStyle;
              return (
                <Pressable
                  key={style.key}
                  onPress={() => onSelectFontStyle(style.key)}
                  style={[styles.fontOption, selected && styles.fontOptionSelected]}
                >
                  <Text style={[{ fontFamily: style.translated }, styles.fontOptionPreview]}>Aa</Text>
                  <Text style={[styles.fontOptionLabel, selected && styles.fontOptionLabelSelected]}>
                    {style.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Background</Text>
          <View style={styles.swatchRow}>
            {BACKGROUND_PRESETS.map((preset) => {
              const selected = preset.key === backgroundPreset;
              return (
                <Pressable
                  key={preset.key}
                  onPress={() => onSelectBackgroundPreset(preset.key)}
                  style={styles.swatchOption}
                >
                  <View
                    style={[
                      styles.swatch,
                      { backgroundColor: preset.swatch },
                      selected && styles.swatchSelected,
                    ]}
                  >
                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={preset.key === 'light' || preset.key === 'default' ? '#2B2620' : '#FFFFFF'}
                      />
                    )}
                  </View>
                  <Text style={styles.swatchLabel}>{preset.label}</Text>
                </Pressable>
              );
            })}
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
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: spacing.md,
    },
    title: { ...typography.h3, marginBottom: spacing.xxs },
    subtitle: { ...typography.caption, marginBottom: spacing.lg },
    sectionLabel: { ...typography.label, marginBottom: spacing.sm },
    fontRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    fontOption: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    fontOptionSelected: { borderColor: colors.accent, backgroundColor: colors.accentMuted },
    fontOptionPreview: { fontSize: 20, color: colors.text, marginBottom: spacing.xs },
    fontOptionLabel: { ...typography.caption },
    fontOptionLabelSelected: { color: colors.accent },
    swatchRow: { flexDirection: 'row', justifyContent: 'space-between' },
    swatchOption: { alignItems: 'center', gap: spacing.xs },
    swatch: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    swatchSelected: { borderWidth: 2.5, borderColor: colors.accent },
    swatchLabel: { ...typography.caption },
  });
}
