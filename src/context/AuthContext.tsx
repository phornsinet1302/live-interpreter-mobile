import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AuthSession, LoginCredentials, User } from '@/types';
import * as authService from '@/services/auth';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (payload: LoginCredentials & { name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (
    payload: Partial<Pick<User, 'name' | 'preferredLanguage' | 'avatarUrl'>>
  ) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const restored = await authService.restoreSession();
        setSession(restored);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const next = await authService.login(credentials);
    setSession(next);
  }, []);

  const signUp = useCallback(
    async (payload: LoginCredentials & { name: string }) => {
      const next = await authService.register(payload);
      setSession(next);
    },
    []
  );

  const signOut = useCallback(async () => {
    await authService.logout();
    setSession(null);
  }, []);

  const updateProfile = useCallback(
    async (payload: Partial<Pick<User, 'name' | 'preferredLanguage' | 'avatarUrl'>>) => {
      const updatedUser = await authService.updateProfile(payload);
      setSession((prev) => (prev ? { ...prev, user: updatedUser } : prev));
    },
    []
  );

  const deleteAccount = useCallback(async () => {
    await authService.deleteAccount();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isLoading,
      isAuthenticated: !!session,
      signIn,
      signUp,
      signOut,
      updateProfile,
      deleteAccount,
    }),
    [session, isLoading, signIn, signUp, signOut, updateProfile, deleteAccount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
