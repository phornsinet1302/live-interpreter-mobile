import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import * as authService from '@/services/auth';
import { ApiError } from '@/types';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID: string =
  (Constants.expoConfig?.extra?.googleClientId as string) ?? '';

/**
 * Wraps Google sign-in behind expo-auth-session. When no client ID has been
 * configured in app.json (`extra.googleClientId`), `promptSignIn` shows an
 * explanation instead of starting a request that would fail with an
 * unregistered OAuth client.
 */
export function useGoogleAuth(onSignedIn: () => void) {
  const isConfigured = GOOGLE_CLIENT_ID.length > 0;

  const [, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID || 'not-configured',
    webClientId: GOOGLE_CLIENT_ID || undefined,
    iosClientId: GOOGLE_CLIENT_ID || undefined,
    androidClientId: GOOGLE_CLIENT_ID || undefined,
  });

  const promptSignIn = useCallback(async () => {
    if (!isConfigured) {
      Alert.alert(
        'Google sign-in not configured',
        'Add your Google OAuth client ID to app.json under extra.googleClientId to enable this button.'
      );
      return;
    }
    try {
      const result = await promptAsync();
      if (result.type === 'success') {
        const idToken = result.params.id_token;
        await authService.loginWithGoogle(idToken);
        onSignedIn();
      }
    } catch (e) {
      Alert.alert('Google sign-in failed', (e as ApiError).message ?? 'Please try again.');
    }
  }, [isConfigured, promptAsync, onSignedIn]);

  return { promptSignIn, isConfigured, response };
}
