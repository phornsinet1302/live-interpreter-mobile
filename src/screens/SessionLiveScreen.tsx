import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { TranscriptBubble } from '@/components/TranscriptBubble';
import { EmptyState } from '@/components/EmptyState';
import { LanguagePickerModal } from '@/components/LanguagePickerModal';
import { StopListeningSheet } from '@/components/StopListeningSheet';
import { NextStepSuggestions } from '@/components/NextStepSuggestions';
import { SessionAppearanceSheet } from '@/components/SessionAppearanceSheet';
import { useLiveInterpreter } from '@/hooks/useLiveInterpreter';
import { languageName } from '@/mocks/languages';
import { fonts, radius, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import {
  BACKGROUND_PRESETS,
  FONT_STYLES,
  type BackgroundPresetKey,
  type FontStyleKey,
} from '@/utils/sessionAppearance';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SessionLive'>;
type Rt = RouteProp<RootStackParamList, 'SessionLive'>;

const MIN_FONT_SCALE = 0.8;
const MAX_FONT_SCALE = 2;
const FONT_SCALE_STEP = 0.15;

export function SessionLiveScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { title } = route.params;
  const { colors: themeColors, typography, scheme } = useTheme();

  const [pickerFor, setPickerFor] = useState<'source' | 'target' | null>(null);
  const [fontScale, setFontScale] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [fontStyle, setFontStyle] = useState<FontStyleKey>('elegant');
  const [backgroundPreset, setBackgroundPreset] = useState<BackgroundPresetKey>('default');
  const [appearanceSheetVisible, setAppearanceSheetVisible] = useState(false);

  // Only this screen's own presentation — Home and everywhere else keep
  // reading the normal app theme untouched.
  const backgroundConfig = BACKGROUND_PRESETS.find((p) => p.key === backgroundPreset)!;
  const colors: ThemeColors = backgroundConfig.colors ? { ...themeColors, ...backgroundConfig.colors } : themeColors;
  const isCustomized = fontStyle !== 'elegant' || backgroundPreset !== 'default';
  const fontStyleConfig = FONT_STYLES.find((f) => f.key === fontStyle)!;
  const transcriptAppearance = isCustomized
    ? {
        text: colors.text,
        textMuted: colors.textMuted,
        accent: colors.accent,
        border: colors.border,
        originalFont: fontStyleConfig.original,
        translatedFont: fontStyleConfig.translated,
      }
    : undefined;
  // A fixed Dark/Light/Sepia background should force the matching status bar
  // style regardless of the device's own light/dark setting; only "Default"
  // follows the app's normal theme.
  const statusBarStyle: 'light' | 'dark' =
    backgroundPreset === 'dark' ? 'light' : backgroundPreset === 'default' ? (scheme === 'dark' ? 'light' : 'dark') : 'dark';

  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

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
  } = useLiveInterpreter({ initialTitle: title });

  const adjustFontScale = (delta: number) =>
    setFontScale((s) => Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, +(s + delta).toFixed(2))));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar hidden={fullscreen} style={statusBarStyle} />

      {!fullscreen && (
        <>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </Pressable>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
            <Pressable onPress={() => setFullscreen(true)} hitSlop={12}>
              <Ionicons name="expand-outline" size={20} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.toolbar}>
            <View style={styles.fontControl}>
              <Pressable
                onPress={() => adjustFontScale(-FONT_SCALE_STEP)}
                disabled={fontScale <= MIN_FONT_SCALE}
                hitSlop={8}
                style={styles.fontButton}
              >
                <Text style={[styles.fontButtonText, { fontSize: 13 }]}>A</Text>
              </Pressable>
              <Text style={styles.fontValue}>{Math.round(fontScale * 100)}%</Text>
              <Pressable
                onPress={() => adjustFontScale(FONT_SCALE_STEP)}
                disabled={fontScale >= MAX_FONT_SCALE}
                hitSlop={8}
                style={styles.fontButton}
              >
                <Text style={[styles.fontButtonText, { fontSize: 18 }]}>A</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => setAppearanceSheetVisible(true)}
              hitSlop={8}
              style={[styles.paletteButton, isCustomized && styles.paletteButtonActive]}
            >
              <Ionicons name="color-palette-outline" size={16} color={isCustomized ? colors.accent : colors.text} />
            </Pressable>

            <View style={styles.langBar}>
              <Pressable style={styles.langPill} onPress={() => setPickerFor('source')}>
                <Text style={styles.langValue} numberOfLines={1}>
                  {sourceLanguage === 'auto' ? 'Auto-detect' : languageName(sourceLanguage)}
                </Text>
              </Pressable>
              <Pressable onPress={swapLanguages} disabled={!canSwap} hitSlop={8} style={styles.swap}>
                <Ionicons
                  name="swap-horizontal"
                  size={14}
                  color={colors.white}
                  style={{ opacity: canSwap ? 1 : 0.4 }}
                />
              </Pressable>
              <Pressable style={styles.langPill} onPress={() => setPickerFor('target')}>
                <Text style={styles.langValue} numberOfLines={1}>
                  {languageName(targetLanguage)}
                </Text>
              </Pressable>
            </View>
          </View>
        </>
      )}

      {fullscreen && (
        <Pressable onPress={() => setFullscreen(false)} hitSlop={12} style={styles.exitFullscreen}>
          <Ionicons name="contract-outline" size={20} color={colors.text} />
        </Pressable>
      )}

      <FlatList
        inverted
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TranscriptBubble entry={item} showSpeaker fontScale={fontScale} appearance={transcriptAppearance} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <EmptyState
              icon="mic-outline"
              title="Ready when you are"
              subtitle="Tap the mic below and start speaking to begin interpreting."
            />
          </View>
        }
      />

      {!fullscreen && <NextStepSuggestions suggestions={suggestions} />}

      <View style={styles.controls}>
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
          <Ionicons name={listening ? 'stop' : 'mic'} size={28} color={colors.white} />
        </Pressable>
        <Text style={styles.statusText}>{statusText}</Text>
        {!fullscreen && entries.length > 0 && (
          <Pressable
            onPress={() =>
              navigation.navigate('Summary', {
                entries,
                historyId: conversationId ?? undefined,
                title,
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

      <SessionAppearanceSheet
        visible={appearanceSheetVisible}
        fontStyle={fontStyle}
        backgroundPreset={backgroundPreset}
        onSelectFontStyle={setFontStyle}
        onSelectBackgroundPreset={setBackgroundPreset}
        onClose={() => setAppearanceSheetVisible(false)}
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    headerTitle: { ...typography.h3, flex: 1, textAlign: 'center', marginHorizontal: spacing.sm },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      gap: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    paletteButton: {
      width: 30,
      height: 30,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    paletteButtonActive: { borderColor: colors.accent, backgroundColor: colors.accentMuted },
    fontControl: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      gap: spacing.xs,
    },
    fontButton: { paddingHorizontal: spacing.xs, paddingVertical: 2 },
    fontButtonText: { fontFamily: fonts.sansSemiBold, color: colors.text },
    fontValue: { ...typography.caption, minWidth: 36, textAlign: 'center' },
    langBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1, justifyContent: 'flex-end' },
    langPill: {
      backgroundColor: colors.backgroundElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.pill,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      maxWidth: 96,
    },
    langValue: { fontFamily: fonts.sansSemiBold, fontSize: 11, color: colors.text },
    swap: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    exitFullscreen: {
      position: 'absolute',
      top: spacing.lg,
      right: spacing.lg,
      zIndex: 10,
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    list: { padding: spacing.md, flexGrow: 1, justifyContent: 'flex-end' },
    emptyWrap: { transform: [{ scaleY: -1 }] },
    controls: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.backgroundElevated,
    },
    statusText: { ...typography.label, marginTop: spacing.md },
    summaryLink: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
    summaryLinkText: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.accent, marginLeft: 4 },
    micButton: {
      width: 64,
      height: 64,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
