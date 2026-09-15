import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDED_KEY = '@live_interpreter/onboarded';

interface OnboardingContextValue {
  hasOnboarded: boolean;
  isLoading: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const OnboardingContext = createContext<OnboardingContextValue | undefined>(
  undefined
);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDED_KEY);
        setHasOnboarded(value === 'true');
      } catch {
        // Unreadable storage — fall back to showing onboarding again.
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const completeOnboarding = useCallback(() => {
    setHasOnboarded(true);
    AsyncStorage.setItem(ONBOARDED_KEY, 'true').catch(() => {});
  }, []);

  const resetOnboarding = useCallback(() => {
    setHasOnboarded(false);
    AsyncStorage.removeItem(ONBOARDED_KEY).catch(() => {});
  }, []);

  const value = useMemo<OnboardingContextValue>(
    () => ({ hasOnboarded, isLoading, completeOnboarding, resetOnboarding }),
    [hasOnboarded, isLoading, completeOnboarding, resetOnboarding]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}
