import React, { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';

import { Button } from '@/components/Button';
import { TranscriptBubble } from '@/components/TranscriptBubble';
import { transcribeAndTranslate } from '@/services/translation';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing } from '@/utils/theme';
import { TranscriptEntry } from '@/types';

export function InterpreterScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [processing, setProcessing] = useState(false);
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

      const result = await transcribeAndTranslate(
        uri,
        'auto',
        user?.preferredLanguage ?? 'en'
      );
      setEntries((prev) => [
        {
          id: `local-${counter.current++}`,
          speakerId: user?.id ?? 'me',
          speakerName: user?.name ?? 'You',
          original: result.sourceText,
          translated: result.translatedText,
          source: result.detectedLanguage ?? result.source,
          target: result.target,
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    } finally {
      setProcessing(false);
    }
  }, [recording, user]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        inverted
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TranscriptBubble entry={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Tap the mic and start speaking to begin interpreting.
          </Text>
        }
      />
      <View style={styles.controls}>
        <Button
          title={recording ? 'Stop & translate' : 'Start speaking'}
          variant={recording ? 'danger' : 'primary'}
          loading={processing}
          onPress={recording ? stopRecording : startRecording}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, flexGrow: 1, justifyContent: 'flex-end' },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    transform: [{ scaleY: -1 }],
  },
  controls: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
