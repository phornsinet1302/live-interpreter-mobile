import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { TranscriptBubble } from '@/components/TranscriptBubble';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { Chip } from '@/components/Chip';
import { Input } from '@/components/Input';
import * as conversationsService from '@/services/conversations';
import * as speakersService from '@/services/speakers';
import * as messagesService from '@/services/messages';
import * as subtitlesService from '@/services/subtitles';
import { getMainSocket } from '@/services/socket';
import { useAuth } from '@/hooks/useAuth';
import { useLiveTranscription } from '@/hooks/useLiveTranscription';
import { mockParticipants, randomDemoLine } from '@/mocks/session';
import { languageName } from '@/mocks/languages';
import { fonts, radius, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { Speaker, TranscriptEntry } from '@/types';
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

  const [participants, setParticipants] = useState<Speaker[]>([]);
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [addingSpeaker, setAddingSpeaker] = useState(false);
  const [newSpeakerLabel, setNewSpeakerLabel] = useState('');
  const counter = useRef(0);
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (isDemo) throw new Error('demo');
        await conversationsService.startConversation(meetingId);
        const remote = await speakersService.listSpeakers(meetingId);
        if (active) {
          setParticipants(
            remote.length
              ? remote
              : [{ id: 'host', label: user?.name ?? 'You', displayName: user?.name, isHost: true }]
          );
        }
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

  useEffect(() => {
    if (isDemo) return;
    const socket = getMainSocket();
    if (!socket) return;
    socket.emit('conversation:join', meetingId);

    const onMessage = (raw: Parameters<typeof messagesService.mapMessage>[0]) => {
      const message = messagesService.mapMessage(raw);
      setEntries((prev) => (prev.some((e) => e.id === message.id) ? prev : [message, ...prev]));
    };
    const onSpeakerUpdate = (speaker: Speaker) => {
      setParticipants((prev) => {
        const exists = prev.some((p) => p.id === speaker.id);
        return exists ? prev.map((p) => (p.id === speaker.id ? { ...p, ...speaker } : p)) : [...prev, speaker];
      });
    };
    socket.on('message:new', onMessage);
    socket.on('speaker:update', onSpeakerUpdate);

    return () => {
      socket.emit('conversation:leave', meetingId);
      socket.off('message:new', onMessage);
      socket.off('speaker:update', onSpeakerUpdate);
    };
  }, [meetingId, isDemo]);

  const targetLanguage = user?.preferredLanguage ?? 'en';

  const { listening, pendingCount, start, stop } = useLiveTranscription({
    sourceLanguage: 'auto',
    targetLanguage,
    onSegment: useCallback(
      (result, startedAt) => {
        const localEntry: TranscriptEntry = {
          id: `local-${counter.current++}`,
          speakerId: user?.id ?? 'me',
          speakerName: user?.name ?? 'You',
          original: result.sourceText,
          translated: result.translatedText,
          source: result.source,
          target: result.target,
          timestamp: startedAt,
        };
        setEntries((prev) => [localEntry, ...prev].sort((a, b) => b.timestamp - a.timestamp));

        if (!isDemo) {
          messagesService
            .addMessage(meetingId, { originalText: result.sourceText })
            .catch(() => {});
          subtitlesService
            .pushCaption(meetingId, {
              source: result.sourceText,
              translated: result.translatedText,
              speakerName: user?.name,
            })
            .catch(() => {});
        }
      },
      [user, isDemo, meetingId]
    ),
  });

  const addDemoReply = useCallback(() => {
    const others = participants.filter((p) => !p.isHost);
    if (others.length === 0) return;
    const speaker = others[Math.floor(Math.random() * others.length)];
    const line = randomDemoLine();
    setEntries((prev) => [
      {
        id: `demo-${counter.current++}`,
        speakerId: speaker.id,
        speakerName: speaker.displayName ?? speaker.label,
        original: line.original,
        translated: line.translated,
        source: speaker.language ?? 'auto',
        target: targetLanguage,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  }, [participants, targetLanguage]);

  const onAddSpeaker = useCallback(async () => {
    const label = newSpeakerLabel.trim();
    if (!label || isDemo) return;
    try {
      const speaker = await speakersService.addSpeaker(meetingId, { label });
      setParticipants((prev) => [...prev, speaker]);
    } catch {
      // No backend — nothing to add.
    } finally {
      setNewSpeakerLabel('');
      setAddingSpeaker(false);
    }
  }, [newSpeakerLabel, isDemo, meetingId]);

  const endSession = () => {
    if (!isDemo) {
      conversationsService.endConversation(meetingId).catch(() => {});
    }
    navigation.replace('Summary', {
      entries,
      historyId: isDemo ? undefined : meetingId,
      title: isDemo ? 'Demo session' : `Session ${meetingId.slice(0, 6).toUpperCase()}`,
    });
  };

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
            <Avatar name={p.displayName ?? p.label} size={30} />
            <Text style={styles.participantName} numberOfLines={1}>
              {p.isHost ? 'You' : p.displayName ?? p.label}
            </Text>
            {p.language ? <Chip label={languageName(p.language)} tone="muted" style={styles.participantLang} /> : null}
          </View>
        ))}
        {!isDemo && (
          <Pressable onPress={() => setAddingSpeaker((v) => !v)} style={styles.addSpeakerChip}>
            <Ionicons name="add" size={18} color={colors.accent} />
          </Pressable>
        )}
      </ScrollView>

      {addingSpeaker && (
        <View style={styles.addSpeakerRow}>
          <Input
            placeholder="Speaker name"
            value={newSpeakerLabel}
            onChangeText={setNewSpeakerLabel}
            containerStyle={styles.addSpeakerInput}
          />
          <Pressable onPress={onAddSpeaker} style={styles.addSpeakerConfirm}>
            <Ionicons name="checkmark" size={18} color={colors.white} />
          </Pressable>
        </View>
      )}

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
          onPress={listening ? stop : start}
          style={({ pressed }) => [
            styles.micButton,
            {
              backgroundColor: listening ? colors.danger : colors.accent,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Ionicons name={listening ? 'stop' : 'mic'} size={26} color={colors.white} />
        </Pressable>
        <Text style={styles.statusText}>
          {listening ? (pendingCount > 0 ? 'Listening — translating…' : 'Listening…') : 'Tap to speak'}
        </Text>
        <Pressable onPress={endSession} style={styles.endButton}>
          <Text style={styles.endText}>End session · View summary</Text>
        </Pressable>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h3, flex: 1, textAlign: 'center', marginHorizontal: spacing.sm },
  participants: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
  participantChip: { alignItems: 'center', width: 76 },
  participantName: { fontFamily: fonts.sansSemiBold, fontSize: 11, color: colors.text, marginTop: 4 },
  participantLang: { marginTop: 4 },
  addSpeakerChip: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  addSpeakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  addSpeakerInput: { flex: 1, marginBottom: 0 },
  addSpeakerConfirm: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  statusText: { ...typography.label, marginTop: spacing.sm },
  endButton: { paddingVertical: spacing.xs },
  endText: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.accent },
  });
}
