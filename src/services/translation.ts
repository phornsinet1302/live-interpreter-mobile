import client from './api';
import { Language, TranslationRequest, TranslationResult } from '@/types';

export async function translate(
  request: TranslationRequest
): Promise<TranslationResult> {
  const { data } = await client.post<TranslationResult>('/translate', request);
  return data;
}

export async function detectLanguage(text: string): Promise<string> {
  const { data } = await client.post<{ language: string }>('/translate/detect', {
    text,
  });
  return data.language;
}

export async function getSupportedLanguages(): Promise<Language[]> {
  const { data } = await client.get<Language[]>('/translate/languages');
  return data;
}

/**
 * Send captured audio for speech-to-text + translation in one call.
 * `audioUri` is a local file URI produced by expo-av recording.
 */
export async function transcribeAndTranslate(
  audioUri: string,
  source: string,
  target: string
): Promise<TranslationResult> {
  const form = new FormData();
  form.append('audio', {
    uri: audioUri,
    name: 'speech.m4a',
    type: 'audio/m4a',
  } as unknown as Blob);
  form.append('source', source);
  form.append('target', target);

  const { data } = await client.post<TranslationResult>(
    '/translate/speech',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
}
