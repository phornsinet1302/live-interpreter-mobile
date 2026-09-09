import { useCallback, useEffect, useRef, useState } from 'react';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { transcribeAndTranslate } from '@/services/translation';
import { LanguageCode, TranslationResult } from '@/types';

// Below this level (dB) the mic is treated as picking up silence, not speech.
const SILENCE_THRESHOLD_DB = -40;
// How long silence must hold before a segment is cut and submitted.
const SILENCE_DURATION_MS = 700;
// Minimum length before a segment is worth submitting (skips accidental taps).
const MIN_SEGMENT_MS = 500;
// Hard cap so continuous speech with no pauses still submits periodically.
const MAX_SEGMENT_MS = 10000;
// How often the recorder reports metering while listening.
const METER_INTERVAL_MS = 120;

interface UseLiveTranscriptionOptions {
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  onSegment: (result: TranslationResult, startedAt: number) => void;
}

/**
 * Drives a "press once to start, keep talking" live translation loop: while
 * listening, audio is recorded in back-to-back segments that are cut
 * automatically on pauses in speech (via mic metering) rather than requiring
 * the user to stop recording before anything gets translated. Each finished
 * segment is transcribed+translated in the background while the next segment
 * is already recording, so results appear continuously instead of only once
 * at the end.
 *
 * A segment is only ever submitted for transcription if it actually
 * contained sound above the silence threshold at some point — a segment
 * that's silent from start to finish (mic left on between sentences, or with
 * nobody talking) just keeps recording/restarting locally with no network
 * call, instead of firing off an empty request on every silence timeout.
 * Without that guard this hammered /transcribe roughly once a second while
 * "Listening" sat idle, which blows through the backend's rate limit within
 * well under a minute.
 */
export function useLiveTranscription({
  sourceLanguage,
  targetLanguage,
  onSegment,
}: UseLiveTranscriptionOptions) {
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const recorderState = useAudioRecorderState(recorder, METER_INTERVAL_MS);
  const [listening, setListening] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const listeningRef = useRef(false);
  const segmentStartRef = useRef<number | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const hasSpeechRef = useRef(false);
  const cyclingRef = useRef(false);

  const languagesRef = useRef({ sourceLanguage, targetLanguage });
  languagesRef.current = { sourceLanguage, targetLanguage };
  const onSegmentRef = useRef(onSegment);
  onSegmentRef.current = onSegment;

  const beginSegment = useCallback(async () => {
    await recorder.prepareToRecordAsync();
    recorder.record();
    segmentStartRef.current = Date.now();
    silenceStartRef.current = null;
    hasSpeechRef.current = false;
  }, [recorder]);

  const finalizeSegment = useCallback(
    async (shouldSubmit: boolean) => {
      if (cyclingRef.current) return;
      cyclingRef.current = true;
      try {
        const startedAt = segmentStartRef.current ?? Date.now();
        await recorder.stop();
        const uri = recorder.uri;

        if (shouldSubmit && uri && Date.now() - startedAt >= MIN_SEGMENT_MS) {
          setPendingCount((c) => c + 1);
          const { sourceLanguage: src, targetLanguage: tgt } = languagesRef.current;
          transcribeAndTranslate(uri, src, tgt)
            .then((result) => {
              if (result.sourceText.trim()) onSegmentRef.current(result, startedAt);
            })
            .catch(() => {})
            .finally(() => setPendingCount((c) => Math.max(0, c - 1)));
        }

        if (listeningRef.current) {
          await beginSegment();
        }
      } catch {
        // A recorder-level failure (e.g. the audio session got interrupted) —
        // stop listening rather than leaving the loop in a broken state.
        listeningRef.current = false;
        setListening(false);
      } finally {
        cyclingRef.current = false;
      }
    },
    [recorder, beginSegment]
  );

  const start = useCallback(async () => {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) return false;
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      listeningRef.current = true;
      setListening(true);
      await beginSegment();
      return true;
    } catch {
      listeningRef.current = false;
      setListening(false);
      return false;
    }
  }, [beginSegment]);

  const stop = useCallback(async () => {
    listeningRef.current = false;
    setListening(false);
    if (recorderState.isRecording) {
      await finalizeSegment(hasSpeechRef.current);
    }
  }, [finalizeSegment, recorderState.isRecording]);

  // Silence / max-duration watchdog — re-evaluated on every polled recorder update.
  useEffect(() => {
    if (!listening || !recorderState.isRecording || cyclingRef.current) return;
    const startedAt = segmentStartRef.current;
    if (startedAt == null) return;

    const now = Date.now();
    const elapsed = now - startedAt;
    const metering = recorderState.metering ?? -160;

    if (metering >= SILENCE_THRESHOLD_DB) {
      hasSpeechRef.current = true;
      silenceStartRef.current = null;
    } else if (hasSpeechRef.current) {
      // Only start counting a "pause that ends the segment" once we've
      // actually heard speech in it — silence before that is just the mic
      // sitting idle, not the tail end of an utterance.
      if (silenceStartRef.current == null) silenceStartRef.current = now;
      const silenceElapsed = now - silenceStartRef.current;
      if (elapsed >= MIN_SEGMENT_MS && silenceElapsed >= SILENCE_DURATION_MS) {
        finalizeSegment(true);
        return;
      }
    }

    if (elapsed >= MAX_SEGMENT_MS) {
      finalizeSegment(hasSpeechRef.current);
    }
  }, [recorderState.metering, recorderState.durationMillis, listening, finalizeSegment]);

  return { listening, pendingCount, start, stop };
}
