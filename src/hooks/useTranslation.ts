import { useCallback, useState } from 'react';
import { translate } from '@/services/translation';
import { ApiError, TranslationResult } from '@/types';

export function useTranslation(defaultSource = 'auto', defaultTarget = 'en') {
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (text: string, source = defaultSource, target = defaultTarget) => {
      setIsTranslating(true);
      setError(null);
      try {
        const res = await translate({ text, source, target });
        setResult(res);
        return res;
      } catch (e) {
        setError((e as ApiError).message);
        return null;
      } finally {
        setIsTranslating(false);
      }
    },
    [defaultSource, defaultTarget]
  );

  return { result, isTranslating, error, translate: run };
}
