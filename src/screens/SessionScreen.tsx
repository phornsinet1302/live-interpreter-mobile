import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

import { TranscriptBubble } from '@/components/TranscriptBubble';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { Chip } from '@/components/Chip';
import { transcribeAndTranslate } from '@/services/translation';
import * as meetingService from '@/services/meeting';
import { useAuth } from '@/hooks/useAuth';
import { mockParticipants, randomDemoLine } from '@/mocks/session';
import { languageName } from '@/mocks/languages';
import { colors, fonts, radius, spacing, typography } from '@/utils/theme';
import { Participant, TranscriptEntry } from '@/types';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Session'>;
type Rt = RouteProp<RootStackParamList, 'Session'>;

export function SessionScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  // Stable per-mount fallback id — recomputing Date.now() on every render
  // would otherwise change `meetingId` each time and retrigger the
  // participants effect in an infinite loop.
  const [meetingId] = useState(() => route.params?.meetingId ?? `demo-${Date.now()}`);
  const isDemo = meetingId.startsWith('demo-');
  const { user } = useAuth();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [processing, setProcessing] = useState(false);
  const counter = useRef(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (isDemo) throw new Error('demo');
        const remote = await meetingService.getParticipants(meetingId);
        if (active) setParticipants(remote);
      } catch {
        if (active) {
          setParticipants(mockParticipants(user?.name ?? 'You', user?.preferredLanguage ?? 'en'));
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [meetingId, isDemo, user]);

  const targetLanguage = user?.preferredLanguage ?? 'en';

  const startRecording = useCallback(async () => {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) return;
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
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
      const result = await transcribeAndTranslate(uri, 'auto', targetLanguage);
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
  }, [recording, user, targetLanguage]);

  const addDemoReply = useCallback(() => {
    const others = participants.filter((p) => !p.isHost);
    if (others.length === 0) return;
    const speaker = others[Math.floor(Math.random() * others.length)];
    const line = randomDemoLine();
    setEntries((prev) => [
      {
        id: `demo-${counter.current++}`,
        speakerId: speaker.id,
        speakerName: speaker.name,
        original: line.original,
        translated: line.translated,
        source: speaker.language,
        target: targetLanguage,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  }, [participants, targetLanguage]);

  const endSession = () => {
    navigation.replace('Summary', {
      entries,
      title: isDemo ? 'Demo session' : `Session ${meetingId.slice(0, 6).toUpperCase()}`,
    });
  };

  const isRecording = !!recording;
  const multiSpeaker = participants.length > 1;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {isDemo ? 'Demo session' : 'Live session'}
        </Text>
        <Pressable onPress={() => navigation.navigate('SubtitleDisplay', { meetingId })} hitSlop={12}>
          <Ionicons name="tv-outline" size={20} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.participants}>
        {participants.map((p) => (
          <View key={p.id} style={styles.participantChip}>
            <Avatar name={p.name} size={30} />
            <Text style={styles.participantName} numberOfLines={1}>{p.isHost ? 'You' : p.name}</Text>
            <Chip label={languageName(p.language)} tone="muted" style={styles.participantLang} />
          </View>
        ))}
      </ScrollView>

      {isDemo && participants.some((p) => !p.isHost) && (
        <Pressable onPress={addDemoReply} style={styles.demoReplyButton}>
          <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.accent} />
          <Text style={styles.demoReplyText}>Simulate a reply from another participant</Text>
        </Pressable>
      )}

      <FlatList
        inverted
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TranscriptBubble entry={item} showSpeaker={multiSpeaker} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <EmptyState
              icon="mic-outline"
              title="Session ready"
              subtitle="Tap the mic to start speaking — everyone sees speaker-labeled subtitles."
            />
          </View>
        }
      />

      <View style={styles.controls}>
        <Pressable
          onPress={isRecording ? stopRecording : startRecording}
          disabled={processing}
          style={({ pressed }) => [
            styles.micButton,
            {
              backgroundColor: isRecording ? colors.danger : colors.accent,
              opacity: processing ? 0.6 : pressed ? 0.85 : 1,
            },
          ]}
        >
          <Ionicons name={isRecording ? 'stop' : 'mic'} size={26} color={colors.white} />
        </Pressable>
        <Pressable onPress={endSession} style={styles.endButton}>
          <Text style={styles.endText}>End session · View summary</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h3, flex: 1, textAlign: 'center', marginHorizontal: spacing.sm },
  participants: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
  participantChip: { alignItems: 'center', width: 76 },
  participantName: { fontFamily: fonts.sansSemiBold, fontSize: 11, color: colors.text, marginTop: 4 },
  participantLang: { marginTop: 4 },
  demoReplyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.accentMuted,
  },
  demoReplyText: { fontFamily: fonts.sansSemiBold, fontSize: 11, color: colors.accent, marginLeft: spacing.xs },
  list: { padding: spacing.md, flexGrow: 1, justifyContent: 'flex-end' },
  emptyWrap: { transform: [{ scaleY: -1 }] },
  controls: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundElevated,
    gap: spacing.sm,
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endButton: { paddingVertical: spacing.xs },
  endText: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.accent },
});
