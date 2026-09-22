import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppPreferences } from '@/hooks/useAppPreferences';
import { useLiveTranscription } from '@/hooks/useLiveTranscription';
import * as conversationsService from '@/services/conversations';
import * as messagesService from '@/services/messages';
import * as speakersService from '@/services/speakers';
import * as suggestionsService from '@/services/suggestions';
import { TranscriptEntry } from '@/types';

interface UseLiveInterpreterOptions {
  // A fixed name for the conversation created behind this session (e.g. one
  // the user typed up front on the "New session" screen). Omit to fall back
  // to an auto date-based name — that's what the Home tab does.
  initialTitle?: string;
}

/**
 * Everything behind "tap mic, speak, see it translated live, with speakers
 * auto-identified and saved to History" — recording, transcription, lazy
 * conversation creation, per-segment voice identification, and the
 * continue/close/close-and-save confirmation on stop. Shared by the Home tab
 * and the named-session live screen so both behave identically; screens only
 * own how this gets rendered (Home's compact layout vs. the session screen's
 * font-size/fullscreen controls).
 */
export function useLiveInterpreter(options: UseLiveInterpreterOptions = {}) {
  const { user, isAuthenticated } = useAuth();
  const { preferences } = useAppPreferences();
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState(user?.preferredLanguage ?? 'en');
  const [stopSheetVisible, setStopSheetVisible] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const counter = useRef(0);
  const conversationIdRef = useRef<string | null>(null);
  const titleRef = useRef(options.initialTitle);
  const exchangesRef = useRef<{ source: string; translated: string }[]>([]);
  const suggestionsBusyRef = useRef(false);

  // `useState(user?.preferredLanguage ?? 'en')` above only reads `user` once,
  // at mount — but the backend profile (where preferredLanguage actually
  // lives) fetches asynchronously and almost never has landed by then, so
  // that initializer captured the 'en' fallback. Worse, the Home tab stays
  // mounted across tab switches (React Navigation doesn't unmount
  // backgrounded tabs by default), so a plain "apply once" effect would only
  // ever catch the very first load and miss every later change made from
  // Settings without a full app restart. This instead re-syncs on every real
  // change to the saved preference, but only while the current target still
  // matches the last value *we* applied — so it won't stomp on a language
  // the user deliberately picked in-session (e.g. via swap) since the last
  // sync, while still picking up a change made in Settings just now.
  const lastSyncedPreferredRef = useRef<string | null>(null);
  useEffect(() => {
    const preferred = user?.preferredLanguage;
    if (!preferred) return;
    setTargetLanguage((current) => {
      const inSync = lastSyncedPreferredRef.current === null || current === lastSyncedPreferredRef.current;
      lastSyncedPreferredRef.current = preferred;
      return inSync ? preferred : current;
    });
  }, [user?.preferredLanguage]);

  // Lazily creates a backend conversation the first time a segment actually
  // has speech, so History/Analytics reflect real usage. Reused for the rest
  // of this listening session; cleared on stop so the next one starts fresh.
  const ensureConversation = useCallback(async () => {
    if (!isAuthenticated) return null;
    if (conversationIdRef.current) return conversationIdRef.current;
    try {
      const conversation = await conversationsService.createConversation({
        title: titleRef.current ?? `Live translate · ${new Date().toLocaleDateString()}`,
        sourceLanguage,
        targetLanguage,
      });
      conversationIdRef.current = conversation.id;
      conversationsService.startConversation(conversation.id).catch(() => {});
      return conversation.id;
    } catch {
      return null;
    }
  }, [isAuthenticated, sourceLanguage, targetLanguage]);

  // Recomputes the "what to say next" suggestions from everything spoken so
  // far. Guarded by suggestionsBusyRef rather than a fixed debounce — a
  // request in flight just means the next segment's call waits for it, then
  // picks up whatever accumulated in exchangesRef meanwhile, so it naturally
  // paces itself to how fast Gemini responds instead of a fixed timer.
  const refreshSuggestions = useCallback(
    (effectiveSourceLanguage: string) => {
      if (suggestionsBusyRef.current) return;
      suggestionsBusyRef.current = true;
      setSuggestionsLoading(true);
      suggestionsService
        .previewNextStep(exchangesRef.current, effectiveSourceLanguage)
        .then((result) => setSuggestions(result))
        .catch(() => {})
        .finally(() => {
          suggestionsBusyRef.current = false;
          setSuggestionsLoading(false);
        });
    },
    []
  );

  const { listening, pendingCount, start, stop } = useLiveTranscription({
    sourceLanguage,
    targetLanguage,
    noiseReductionEnabled: preferences.noiseReductionEnabled,
    noiseEnvironment: preferences.noiseEnvironment,
    onSegment: useCallback(
      (result, startedAt, audioUri) => {
        const localId = `local-${counter.current++}`;
        const entry: TranscriptEntry = {
          id: localId,
          speakerId: user?.id ?? 'me',
          speakerName: user?.name ?? 'You',
          original: result.sourceText,
          translated: result.translatedText,
          source: result.source,
          target: result.target,
          timestamp: startedAt,
        };
        // Shown immediately under this device's own identity — the label
        // gets corrected in place a moment later once voice identification
        // (below) resolves, so the transcript never waits on it to appear.
        setEntries((prev) => [entry, ...prev].sort((a, b) => b.timestamp - a.timestamp));

        exchangesRef.current = [
          ...exchangesRef.current,
          { source: result.sourceText, translated: result.translatedText },
        ];
        // Suggestions must come back in the speaker's own language — when
        // source is "auto" there's no per-utterance detected language to use,
        // so fall back to the signed-in user's own preferred language as the
        // best available guess for what they're actually speaking.
        refreshSuggestions(sourceLanguage !== 'auto' ? sourceLanguage : user?.preferredLanguage ?? 'en');

        ensureConversation()
          .then((conversationId) => {
            if (!conversationId) return;
            return speakersService
              .identifySpeaker(conversationId, audioUri)
              .then(({ speaker }) => {
                const speakerName = speaker.displayName ?? speaker.label;
                setEntries((prev) =>
                  prev.map((e) => (e.id === localId ? { ...e, speakerId: speaker.id, speakerName } : e))
                );
                return messagesService.addMessage(conversationId, {
                  originalText: result.sourceText,
                  translatedText: result.translatedText,
                  confidence: result.confidence ?? null,
                  speakerId: speaker.id,
                });
              })
              .catch(() =>
                // Voice identification failed — still persist the message
                // under this device's own user rather than losing it.
                messagesService.addMessage(conversationId, {
                  originalText: result.sourceText,
                  translatedText: result.translatedText,
                  confidence: result.confidence ?? null,
                })
              );
          })
          .catch(() => {});
      },
      [user, ensureConversation, sourceLanguage, refreshSuggestions]
    ),
  });

  // Stops recording and either keeps the conversation that was already being
  // saved live (per-segment, via ensureConversation above) or throws it away
  // if the user chose not to save.
  const finishListening = useCallback(
    async (save: boolean) => {
      await stop();
      setSuggestions([]);
      exchangesRef.current = [];
      const conversationId = conversationIdRef.current;
      conversationIdRef.current = null;
      if (!conversationId) return;
      if (save) {
        conversationsService.endConversation(conversationId).catch(() => {});
      } else {
        conversationsService.deleteConversation(conversationId).catch(() => {});
        setEntries([]);
      }
    },
    [stop]
  );

  const onMicPress = useCallback(() => {
    if (!listening) {
      start();
      return;
    }
    if (!conversationIdRef.current) {
      // Nothing was actually transcribed yet this session — nothing to
      // save or discard, so just stop without bothering the user.
      stop();
      return;
    }
    setStopSheetVisible(true);
  }, [listening, start, stop]);

  const onContinueListening = useCallback(() => setStopSheetVisible(false), []);
  const onCloseWithoutSaving = useCallback(() => {
    setStopSheetVisible(false);
    finishListening(false);
  }, [finishListening]);
  const onCloseAndSave = useCallback(() => {
    setStopSheetVisible(false);
    finishListening(true);
  }, [finishListening]);

  const swapLanguages = useCallback(() => {
    if (sourceLanguage === 'auto') return;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
  }, [sourceLanguage, targetLanguage]);

  const canSwap = sourceLanguage !== 'auto';
  const statusText = listening
    ? pendingCount > 0
      ? 'Listening — translating…'
      : 'Listening…'
    : entries.length
    ? 'Tap to speak again'
    : 'Tap to speak';

  return {
    entries,
    sourceLanguage,
    setSourceLanguage,
    targetLanguage,
    setTargetLanguage,
    listening,
    pendingCount,
    statusText,
    suggestions,
    suggestionsLoading,
    canSwap,
    swapLanguages,
    conversationId: conversationIdRef.current,
    stopSheetVisible,
    onMicPress,
    onContinueListening,
    onCloseWithoutSaving,
    onCloseAndSave,
  };
}
