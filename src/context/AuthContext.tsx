import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/expo';
import { resolveServerUrl, setTokenGetter } from '@/services/api';
import { connectMainSocket, disconnectMainSocket } from '@/services/socket';
import * as usersService from '@/services/users';
import { toLanguageCode } from '@/mocks/languages';
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

const PROFILE_FETCH_RETRY_DELAYS_MS = [500, 1500, 3000];

// Right after a fresh sign-in, Clerk's token can briefly not be attached yet
// (a race between the session activating and the token cache catching up) —
// a single getMe() attempt right then can fail even though the session is
// genuinely valid. Retrying with backoff instead of accepting the first
// failure means "signed in but profile never loads" isn't the default
// outcome of that race.
async function fetchProfileWithRetry(): Promise<usersService.BackendUser> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await usersService.getMe();
    } catch (error) {
      if (attempt >= PROFILE_FETCH_RETRY_DELAYS_MS.length) throw error;
      await new Promise((resolve) => setTimeout(resolve, PROFILE_FETCH_RETRY_DELAYS_MS[attempt]));
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded: authLoaded, isSignedIn, userId, getToken, signOut: clerkSignOut } = useClerkAuth();
  const { isLoaded: userLoaded, user: clerkUser } = useClerkUser();

  const [profile, setProfile] = useState<usersService.BackendUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Clerk's isSignedIn appears to blip false for a moment roughly once a
  // minute (observed via the backend's request log: /users/me refetching on
  // a ~60s cadence, which only happens here when isSignedIn's VALUE changes —
  // consistent with Clerk's background session-token refresh transiently
  // reporting signed-out before recovering). A raw pass-through of that flag
  // as isAuthenticated made Settings/History flash to their signed-out view
  // whenever a screen happened to render during one of those blips, even
  // though the user was never actually signed out. Only believe a drop to
  // signed-out after it holds for a bit, so a few-hundred-ms refresh blip
  // doesn't read as a real sign-out; a genuine sign-out (tapping "Sign out",
  // token actually revoked) stays false well past this window regardless.
  const [stableSignedIn, setStableSignedIn] = useState(isSignedIn);
  useEffect(() => {
    if (isSignedIn) {
      setStableSignedIn(true);
      return;
    }
    const timer = setTimeout(() => setStableSignedIn(false), 2500);
    return () => clearTimeout(timer);
  }, [isSignedIn]);

  // Clerk hands back a new `getToken` function identity on pretty much every
  // render, not just when the session actually changes. Both effects below
  // only ever need to call "whatever getToken currently is" — they don't
  // need to re-run just because that reference changed — so it's read via a
  // ref instead of being a dependency. Depending on it directly used to
  // retrigger the profile-fetch effect below on every render (each fetch
  // completing calls setProfile/setProfileLoading, which re-renders
  // AuthProvider, which hands Clerk a new getToken, which re-triggered the
  // effect again) — an infinite loop that was hammering the backend with
  // hundreds of /users/me requests per minute and starving out every other
  // request's share of the rate limit.
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  // Give the plain axios/socket modules a way to fetch a fresh Clerk token.
  // Uses the debounced flag too — nulling this out on every ~60s refresh
  // blip could fail a request that happened to be in flight at that moment.
  useEffect(() => {
    setTokenGetter(stableSignedIn ? () => getTokenRef.current() : null);
  }, [stableSignedIn]);

  useEffect(() => {
    let active = true;
    if (!stableSignedIn) {
      setProfile(null);
      disconnectMainSocket();
      return;
    }
    (async () => {
      setProfileLoading(true);
      try {
        const token = await getTokenRef.current();
        if (token) connectMainSocket(token);
        const me = await fetchProfileWithRetry();
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
  }, [stableSignedIn, userId]);

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
    if (!stableSignedIn || !userId) return null;
    return {
      id: userId,
      name: profile?.name ?? clerkUser?.fullName ?? clerkUser?.firstName ?? 'You',
      email: clerkUser?.primaryEmailAddress?.emailAddress ?? '',
      preferredLanguage: toLanguageCode(profile?.preferredLanguage),
      avatarUrl: resolveServerUrl(profile?.avatarUrl ?? profile?.avatar) ?? clerkUser?.imageUrl,
      theme: profile?.theme,
    };
  }, [stableSignedIn, userId, profile, clerkUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      // Deliberately NOT gated on profileLoading — `user` above already falls
      // back to Clerk-only fields while the backend profile is in flight, so
      // waiting here would just add a network round-trip to every cold start
      // for data the UI doesn't actually need yet. The profile fills in via a
      // re-render moments later once it arrives.
      //
      // The `isSignedIn === true && !stableSignedIn` clause closes a one-render
      // race for a returning already-signed-in user: authLoaded/userLoaded can
      // flip true a render before the stableSignedIn debounce effect above has
      // caught up to Clerk's isSignedIn, so isLoading would otherwise go false
      // for one frame while isAuthenticated is still false — long enough for a
      // consumer to treat the very next render's flip to true as a fresh
      // "just signed in" transition (it caused RootNavigator to reset straight
      // to Main, skipping the onboarding trailer). Staying "loading" until
      // stableSignedIn has actually caught up means isAuthenticated is already
      // correct on the first render isLoading reports false.
      isLoading: !authLoaded || !userLoaded || (isSignedIn === true && !stableSignedIn),
      isAuthenticated: !!stableSignedIn,
      updateProfile,
      uploadAvatar,
      deleteAccount,
      signOut,
    }),
    [user, authLoaded, userLoaded, isSignedIn, stableSignedIn, profileLoading, profile, updateProfile, uploadAvatar, deleteAccount, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
