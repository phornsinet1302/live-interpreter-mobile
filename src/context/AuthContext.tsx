import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/expo';
import { resolveServerUrl, setTokenGetter } from '@/services/api';
import { connectMainSocket, disconnectMainSocket } from '@/services/socket';
import * as usersService from '@/services/users';
import { ThemePreference, User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateProfile: (payload: {
    name?: string;
    preferredLanguage?: string;
    theme?: ThemePreference;
  }) => Promise<void>;
  uploadAvatar: (uri: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded: authLoaded, isSignedIn, userId, getToken, signOut: clerkSignOut } = useClerkAuth();
  const { isLoaded: userLoaded, user: clerkUser } = useClerkUser();

  const [profile, setProfile] = useState<usersService.BackendUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Give the plain axios/socket modules a way to fetch a fresh Clerk token.
  useEffect(() => {
    setTokenGetter(isSignedIn ? () => getToken() : null);
  }, [isSignedIn, getToken]);

  useEffect(() => {
    let active = true;
    if (!isSignedIn) {
      setProfile(null);
      disconnectMainSocket();
      return;
    }
    (async () => {
      setProfileLoading(true);
      try {
        const token = await getToken();
        if (token) connectMainSocket(token);
        const me = await usersService.getMe();
        if (active) setProfile(me);
      } catch {
        // Backend profile fetch failed — fall back to Clerk-only identity below.
      } finally {
        if (active) setProfileLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isSignedIn, userId, getToken]);

  const updateProfile = useCallback(
    async (payload: { name?: string; preferredLanguage?: string; theme?: ThemePreference }) => {
      const updated = await usersService.updateMe(payload);
      setProfile(updated);
    },
    []
  );

  const uploadAvatar = useCallback(async (uri: string) => {
    const updated = await usersService.uploadAvatar(uri);
    setProfile(updated);
  }, []);

  const deleteAccount = useCallback(async () => {
    await usersService.deleteMe();
    await clerkSignOut();
  }, [clerkSignOut]);

  const signOut = useCallback(async () => {
    await clerkSignOut();
  }, [clerkSignOut]);

  const user = useMemo<User | null>(() => {
    if (!isSignedIn || !userId) return null;
    return {
      id: userId,
      name: profile?.name ?? clerkUser?.fullName ?? clerkUser?.firstName ?? 'You',
      email: clerkUser?.primaryEmailAddress?.emailAddress ?? '',
      preferredLanguage: profile?.preferredLanguage ?? 'en',
      avatarUrl: resolveServerUrl(profile?.avatarUrl ?? profile?.avatar) ?? clerkUser?.imageUrl,
      theme: profile?.theme,
    };
  }, [isSignedIn, userId, profile, clerkUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading: !authLoaded || !userLoaded || (!!isSignedIn && profileLoading && !profile),
      isAuthenticated: !!isSignedIn,
      updateProfile,
      uploadAvatar,
      deleteAccount,
      signOut,
    }),
    [user, authLoaded, userLoaded, isSignedIn, profileLoading, profile, updateProfile, uploadAvatar, deleteAccount, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
