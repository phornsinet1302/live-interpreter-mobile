import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppPreferences, NoiseEnvironment, ThemePreference } from '@/types';

const PREFERENCES_KEY = '@live_interpreter/app_preferences';

const DEFAULT_PREFERENCES: AppPreferences = {
  theme: 'system',
  noiseReductionEnabled: true,
  noiseEnvironment: 'normal',
  notificationsEnabled: false,
};

interface AppPreferencesContextValue {
  preferences: AppPreferences;
  isLoading: boolean;
  setTheme: (theme: ThemePreference) => void;
  setNoiseReductionEnabled: (enabled: boolean) => void;
  setNoiseEnvironment: (env: NoiseEnvironment) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const AppPreferencesContext = createContext<AppPreferencesContextValue | undefined>(
  undefined
);

export function AppPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<AppPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PREFERENCES_KEY);
        if (raw) {
          setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(raw) });
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persist = useCallback((next: AppPreferences) => {
    setPreferences(next);
    AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const setTheme = useCallback(
    (theme: ThemePreference) => persist({ ...preferences, theme }),
    [preferences, persist]
  );
  const setNoiseReductionEnabled = useCallback(
    (noiseReductionEnabled: boolean) => persist({ ...preferences, noiseReductionEnabled }),
    [preferences, persist]
  );
  const setNoiseEnvironment = useCallback(
    (noiseEnvironment: NoiseEnvironment) => persist({ ...preferences, noiseEnvironment }),
    [preferences, persist]
  );
  const setNotificationsEnabled = useCallback(
    (notificationsEnabled: boolean) => persist({ ...preferences, notificationsEnabled }),
    [preferences, persist]
  );

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      preferences,
      isLoading,
      setTheme,
      setNoiseReductionEnabled,
      setNoiseEnvironment,
      setNotificationsEnabled,
    }),
    [preferences, isLoading, setTheme, setNoiseReductionEnabled, setNoiseEnvironment, setNotificationsEnabled]
  );

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  );
}
