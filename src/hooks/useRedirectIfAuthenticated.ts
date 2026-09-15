import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { RootStackParamList } from '@/navigation/types';

/**
 * Clerk's own <SignIn>/<SignUp> components auto-redirect away when a session
 * already exists (in single-session mode, which this app uses) — see Clerk's
 * own "cannotRenderComponentWhenSessionExists" behavior. This app's auth
 * screens are fully custom (headless useSignIn/useSignUp hooks), so that
 * guard doesn't exist unless added explicitly. Without it, landing on
 * Login/Register/ForgotPassword while already signed in leaves the user
 * stuck: Clerk correctly refuses a second sign-in attempt ("You're already
 * signed in") and there was no way off the screen. Call this once near the
 * top of each of those three screens.
 *
 * Checked once on mount, not reactively — RootNavigator only renders these
 * screens after Clerk has finished loading, so `isAuthenticated` is already
 * accurate by the time this runs. Reacting to every change instead would
 * also misfire on ForgotPasswordScreen, whose own reset flow legitimately
 * flips isAuthenticated to true mid-flow and shows its own success step
 * before navigating — a reactive guard would yank the user past that.
 */
export function useRedirectIfAuthenticated() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAuthenticated } = useAuth();
  const { completeOnboarding } = useOnboarding();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isAuthenticated) return;
    completeOnboarding();
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  }, []);
}
