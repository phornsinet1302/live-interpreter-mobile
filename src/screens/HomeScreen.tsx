import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { TranscriptBubble } from '@/components/TranscriptBubble';
import { EmptyState } from '@/components/EmptyState';
import { LanguagePickerModal } from '@/components/LanguagePickerModal';
import { StopListeningSheet } from '@/components/StopListeningSheet';
import { NextStepSuggestions } from '@/components/NextStepSuggestions';
import { useAppPreferences } from '@/hooks/useAppPreferences';
import { useNotifications } from '@/hooks/useNotifications';
import { useLiveInterpreter } from '@/hooks/useLiveInterpreter';
import { languageName } from '@/mocks/languages';
import { fonts, radius, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { preferences } = useAppPreferences();
  const { unreadCount } = useNotifications();
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const [pickerFor, setPickerFor] = useState<'source' | 'target' | null>(null);

  const {
    entries,
    sourceLanguage,
    setSourceLanguage,
    targetLanguage,
    setTargetLanguage,
    listening,
    statusText,
    canSwap,
    swapLanguages,
    conversationId,
    suggestions,
    stopSheetVisible,
    onMicPress,
    onContinueListening,
    onCloseWithoutSaving,
    onCloseAndSave,
  } = useLiveInterpreter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.logoBar}>
        <Pressable onPress={() => navigation.navigate('NewSession')} hitSlop={8}>
          <Ionicons name="add-circle-outline" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.logoCenter}>
          <Image
            source={require('@/assets/logo-fluent.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Pressable onPress={() => navigation.navigate('Notifications')} hitSlop={8} style={styles.bellWrap}>
          <Ionicons name="notifications-outline" size={20} color={colors.text} />
          {unreadCount > 0 && <View style={styles.bellBadge} />}
        </Pressable>
      </View>

      <View style={styles.langSection}>
        <Ionicons name="leaf-outline" size={20} color={colors.accent} style={styles.leafLeft} />
        <Ionicons name="leaf-outline" size={16} color={colors.accent} style={styles.leafRight} />
        <View style={styles.langBar}>
          <Pressable style={styles.langPill} onPress={() => setPickerFor('source')}>
            <Text style={styles.langLabel}>Speaking</Text>
            <Text style={styles.langValue}>
              {sourceLanguage === 'auto' ? 'Auto-detect' : languageName(sourceLanguage)}
            </Text>
          </Pressable>
          <Pressable
            onPress={swapLanguages}
            disabled={!canSwap}
            hitSlop={8}
            style={({ pressed }) => [
              styles.swap,
              { opacity: !canSwap ? 0.4 : pressed ? 0.8 : 1 },
            ]}
          >
            <Ionicons name="swap-horizontal" size={16} color={colors.white} />
          </Pressable>
          <Pressable style={styles.langPill} onPress={() => setPickerFor('target')}>
            <Text style={styles.langLabel}>Translating to</Text>
            <Text style={styles.langValue}>{languageName(targetLanguage)}</Text>
          </Pressable>
        </View>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="mic-outline"
            title="Ready when you are"
            subtitle="Tap the mic below and start speaking to begin interpreting."
          />
        </View>
      ) : (
        <FlatList
          inverted
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TranscriptBubble entry={item} showSpeaker />}
          contentContainerStyle={styles.list}
        />
      )}

      <NextStepSuggestions suggestions={suggestions} />

      <View style={styles.controls}>
        <View style={styles.dots}>
          {Array.from({ length: 7 }).map((_, i) => (
            <View key={i} style={styles.dot} />
          ))}
        </View>
        <Pressable
          onPress={onMicPress}
          style={({ pressed }) => [
            styles.micButton,
            {
              backgroundColor: listening ? colors.danger : colors.accent,
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: listening ? 1.05 : 1 }],
            },
          ]}
        >
          <Ionicons
            name={listening ? 'stop' : 'mic'}
            size={30}
            color={colors.white}
          />
        </Pressable>
        <Text style={styles.statusText}>{statusText}</Text>
        {preferences.noiseReductionEnabled && (
          <View style={styles.noiseBadge}>
            <Ionicons name="volume-mute-outline" size={11} color={colors.accent} />
            <Text style={styles.noiseBadgeText}>Noise reduction on</Text>
          </View>
        )}
        {entries.length > 0 && (
          <Pressable
            onPress={() =>
              navigation.navigate('Summary', {
                entries,
                historyId: conversationId ?? undefined,
                title: 'This conversation',
              })
            }
            style={styles.summaryLink}
          >
            <Ionicons name="sparkles-outline" size={13} color={colors.accent} />
            <Text style={styles.summaryLinkText}>View AI summary & suggestions</Text>
          </Pressable>
        )}
      </View>

      <LanguagePickerModal
        visible={pickerFor !== null}
        selected={pickerFor === 'source' ? sourceLanguage : targetLanguage}
        allowAuto={pickerFor === 'source'}
        title={pickerFor === 'source' ? 'Speaking language' : 'Translate to'}
        onSelect={(code) => {
          if (pickerFor === 'source') setSourceLanguage(code);
          else setTargetLanguage(code);
        }}
        onClose={() => setPickerFor(null)}
      />

      <StopListeningSheet
        visible={stopSheetVisible}
        onContinue={onContinueListening}
        onCloseWithoutSaving={onCloseWithoutSaving}
        onCloseAndSave={onCloseAndSave}
      />
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, typography: ThemeTypography) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  logoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  logoCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  bellWrap: { position: 'relative' },
  bellBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1,
    borderColor: colors.background,
  },
  logoImage: { width: 46, height: 24 },
  langSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leafLeft: { position: 'absolute', top: 4, left: 24, opacity: 0.35 },
  leafRight: { position: 'absolute', bottom: 4, right: 24, opacity: 0.3 },
  langBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  langPill: {
    flex: 1,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  langLabel: { ...typography.label, fontSize: 9, marginBottom: 2 },
  langValue: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.text },
  swap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: spacing.md, flexGrow: 1, justifyContent: 'flex-end' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  controls: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundElevated,
  },
  dots: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  statusText: { ...typography.label, marginTop: spacing.md },
  noiseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.accentMuted,
  },
  noiseBadgeText: { fontFamily: fonts.sansSemiBold, fontSize: 10, color: colors.accent, marginLeft: 4 },
  summaryLink: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  summaryLinkText: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.accent, marginLeft: 4 },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  });
}
