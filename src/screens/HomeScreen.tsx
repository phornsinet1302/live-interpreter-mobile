import React, { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

import { TranscriptBubble } from '@/components/TranscriptBubble';
import { EmptyState } from '@/components/EmptyState';
import { transcribeAndTranslate } from '@/services/translation';
import { useAuth } from '@/hooks/useAuth';
import { colors, fonts, radius, spacing, typography } from '@/utils/theme';
import { TranscriptEntry } from '@/types';

export function HomeScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [processing, setProcessing] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState(
    user?.preferredLanguage ?? 'en'
  );
  const counter = useRef(0);

  const startRecording = useCallback(async () => {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    const { recording: rec } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    setRecording(rec);
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recording) return;
    setProcessing(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (!uri) return;

      const result = await transcribeAndTranslate(uri, sourceLanguage, targetLanguage);
      const detected = result.detectedLanguage ?? result.source;
      if (sourceLanguage === 'auto' && detected) {
        setSourceLanguage(detected);
      }
      setEntries((prev) => [
        {
          id: `local-${counter.current++}`,
          speakerId: user?.id ?? 'me',
          speakerName: user?.name ?? 'You',
          original: result.sourceText,
          translated: result.translatedText,
          source: detected,
          target: result.target,
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    } finally {
      setProcessing(false);
    }
  }, [recording, user, sourceLanguage, targetLanguage]);

  const swapLanguages = useCallback(() => {
    if (sourceLanguage === 'auto') return;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
  }, [sourceLanguage, targetLanguage]);

  const isRecording = !!recording;
  const canSwap = sourceLanguage !== 'auto';
  const statusText = isRecording
    ? 'Recording — tap to stop'
    : processing
    ? 'Translating…'
    : entries.length
    ? 'Tap to speak again'
    : 'Tap to speak';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.logoBar}>
        <Ionicons name="globe-outline" size={16} color={colors.accent} />
        <Text style={styles.logoText}>Live Interpreter</Text>
      </View>

      <View style={styles.langSection}>
        <Ionicons name="leaf-outline" size={20} color={colors.accent} style={styles.leafLeft} />
        <Ionicons name="leaf-outline" size={16} color={colors.accent} style={styles.leafRight} />
        <View style={styles.langBar}>
          <View style={styles.langPill}>
            <Text style={styles.langLabel}>Speaking</Text>
            <Text style={styles.langValue}>
              {sourceLanguage === 'auto' ? 'Auto-detect' : sourceLanguage.toUpperCase()}
            </Text>
          </View>
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
          <View style={styles.langPill}>
            <Text style={styles.langLabel}>Translating to</Text>
            <Text style={styles.langValue}>{targetLanguage.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <FlatList
        inverted
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TranscriptBubble entry={item} />}
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

      <View style={styles.controls}>
        <View style={styles.dots}>
          {Array.from({ length: 7 }).map((_, i) => (
            <View key={i} style={styles.dot} />
          ))}
        </View>
        <Pressable
          onPress={isRecording ? stopRecording : startRecording}
          disabled={processing}
          style={({ pressed }) => [
            styles.micButton,
            {
              backgroundColor: isRecording ? colors.danger : colors.accent,
              opacity: processing ? 0.6 : pressed ? 0.85 : 1,
              transform: [{ scale: isRecording ? 1.05 : 1 }],
            },
          ]}
        >
          <Ionicons
            name={isRecording ? 'stop' : 'mic'}
            size={30}
            color={colors.white}
          />
        </Pressable>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  logoBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  logoText: { fontFamily: fonts.serif, fontSize: 15, color: colors.text },
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
  emptyWrap: { transform: [{ scaleY: -1 }] },
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
  micButton: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
