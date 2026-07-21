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

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isLoading,
      isAuthenticated: !!session,
      signIn,
      signUp,
      signOut,
    }),
    [session, isLoading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
