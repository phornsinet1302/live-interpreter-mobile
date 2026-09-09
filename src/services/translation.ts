import { File } from 'expo-file-system';
import client from './api';
import { languageName } from '@/mocks/languages';
import { LanguageCode, TranslationRequest, TranslationResult, WordLookupResult } from '@/types';

interface TranslateResponse {
  translatedText: string;
  provider?: string;
  confidence?: number;
}

interface LookupResponse extends TranslateResponse {
  phonetic?: string;
  examples?: string[];
}

interface TranscribeResponse {
  transcript: string;
  translatedText: string;
  provider?: string;
  confidence?: number;
}

/** The backend's translate-family endpoints take full language names ("English") or "auto". */
function toLanguageName(code: LanguageCode): string {
  return code === 'auto' ? 'auto' : languageName(code);
}

export async function translate(request: TranslationRequest): Promise<TranslationResult> {
  const { data } = await client.post<TranslateResponse>('/translate', {
    text: request.text,
    sourceLanguage: toLanguageName(request.source),
    targetLanguage: toLanguageName(request.target),
  });
  return {
    sourceText: request.text,
    translatedText: data.translatedText,
    source: request.source,
    target: request.target,
    confidence: data.confidence,
  };
}

export async function translateLookup(
  text: string,
  source: LanguageCode,
  target: LanguageCode
): Promise<WordLookupResult> {
  const { data } = await client.post<LookupResponse>('/translate/lookup', {
    text,
    sourceLanguage: toLanguageName(source),
    targetLanguage: toLanguageName(target),
  });
  return {
    translatedText: data.translatedText,
    phonetic: data.phonetic,
    examples: data.examples ?? [],
    confidence: data.confidence,
  };
}

/**
 * Transcribes + translates a recorded clip in one call. `audioUri` is a local
 * file URI produced by expo-audio recording; the backend expects base64 audio.
 */
export async function transcribeAndTranslate(
  audioUri: string,
  source: LanguageCode,
  target: LanguageCode
): Promise<TranslationResult> {
  const file = new File(audioUri);
  const audio = await file.base64();

  const { data } = await client.post<TranscribeResponse>('/transcribe', {
    audio,
    mimeType: 'audio/m4a',
    sourceLanguage: toLanguageName(source),
    targetLanguage: toLanguageName(target),
  });

  return {
    sourceText: data.transcript,
    translatedText: data.translatedText,
    source,
    target,
    confidence: data.confidence,
  };
}
