import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/Input';
import { LANGUAGES } from '@/mocks/languages';
import { Language } from '@/types';
import { fonts, radius, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';

interface LanguagePickerModalProps {
  visible: boolean;
  selected?: string;
  title?: string;
  allowAuto?: boolean;
  onSelect: (code: string) => void;
  onClose: () => void;
}

export function LanguagePickerModal({
  visible,
  selected,
  title = 'Choose a language',
  allowAuto = false,
  onSelect,
  onClose,
}: LanguagePickerModalProps) {
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? LANGUAGES.filter(
          (l) => l.name.toLowerCase().includes(q) || l.nativeName.toLowerCase().includes(q)
        )
      : LANGUAGES;
    return list;
  }, [query]);

  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? 24 : 12) + spacing.sm;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
      statusBarTranslucent
    >
      <View style={[styles.safe, { paddingTop: topPadding, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <Input
            icon="search-outline"
            placeholder="Search languages"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => item.code}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            allowAuto ? (
              <Row
                label="Auto-detect"
                sub="Detect the spoken language automatically"
                active={selected === 'auto'}
                onPress={() => {
                  onSelect('auto');
                  onClose();
                }}
              />
            ) : null
          }
          renderItem={({ item }: { item: Language }) => (
            <Row
              label={item.name}
              sub={item.nativeName}
              active={selected === item.code}
              onPress={() => {
                onSelect(item.code);
                onClose();
              }}
            />
          )}
        />
      </View>
    </Modal>
  );
}

function Row({
  label,
  sub,
  active,
  onPress,
}: {
  label: string;
  sub: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      {active ? <Ionicons name="checkmark-circle" size={20} color={colors.accent} /> : null}
    </Pressable>
  );
}

function createStyles(colors: ThemeColors, typography: ThemeTypography) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    title: { ...typography.h2 },
    searchWrap: { paddingHorizontal: spacing.lg },
    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowText: {},
    rowLabel: { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.text },
    rowSub: { ...typography.caption, marginTop: 2 },
  });
}
