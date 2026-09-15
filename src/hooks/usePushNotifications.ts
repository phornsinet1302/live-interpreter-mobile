import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAuth } from '@/hooks/useAuth';
import { useAppPreferences } from '@/hooks/useAppPreferences';
import { registerPushToken } from '@/services/push';

// Controls how a push is presented while the app is in the foreground (by
// default expo-notifications shows nothing). Set once at module scope rather
// than inside the hook body so it isn't re-registered on every render.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Registers this device for OS-level push notifications whenever the user is
 * signed in and has notifications enabled in Settings, and unregisters
 * (clears the token server-side) when either turns off. Mount once near the
 * app root — see AppShell in App.tsx.
 *
 * Note: remote push isn't supported in Expo Go on SDK 53+, and getting a
 * real token requires an EAS project id (`eas init`). Both failure modes are
 * swallowed here since this is best-effort background registration, not a
 * user-initiated action — src/screens/NotificationsScreen.tsx's toggle
 * handles the user-facing "permission denied" case separately.
 */
export function usePushNotifications() {
  const { isAuthenticated } = useAuth();
  const { preferences } = useAppPreferences();
  const registeredRef = useRef(false);

  useEffect(() => {
    let active = true;
    const shouldRegister = isAuthenticated && preferences.notificationsEnabled;

    (async () => {
      if (!shouldRegister) {
        if (registeredRef.current) {
          registeredRef.current = false;
          registerPushToken(null).catch(() => {});
        }
        return;
      }

      try {
        const { status: existing } = await Notifications.getPermissionsAsync();
        let status = existing;
        if (status !== 'granted') {
          const requested = await Notifications.requestPermissionsAsync();
          status = requested.status;
        }
        if (status !== 'granted' || !active) return;

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) return;

        const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
        if (!active) return;
        registeredRef.current = true;
        await registerPushToken(token);
      } catch {
        // Expo Go without remote-push support, missing EAS project id, or a
        // device/permissions hiccup — nothing actionable for the user here.
      }
    })();

    return () => {
      active = false;
    };
  }, [isAuthenticated, preferences.notificationsEnabled]);
}
