import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
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
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [preferences, setPreferences] = useState<AppPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PREFERENCES_KEY);
        if (raw) {
          setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(raw) });
        }
      } catch {
        // Corrupted or unreadable storage — keep the defaults already in state.
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persist = useCallback((next: AppPreferences) => {
    setPreferences(next);
    AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  // The account's saved theme (set here or on the web app) is the source of
  // truth once signed in — adopt it on login/refresh so the same account
  // shows the same appearance choice on every device.
  useEffect(() => {
    if (isAuthenticated && user?.theme && user.theme !== preferences.theme) {
      persist({ ...preferences, theme: user.theme });
    }
    // Only re-run when the account's own theme value changes — not on every
    // local preference edit, which would fight with setTheme below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.theme]);

  const setTheme = useCallback(
    (theme: ThemePreference) => {
      persist({ ...preferences, theme });
      if (isAuthenticated) {
        updateProfile({ theme }).catch(() => {});
      }
    },
    [preferences, persist, isAuthenticated, updateProfile]
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
