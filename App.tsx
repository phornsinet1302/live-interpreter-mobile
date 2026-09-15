import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_600SemiBold_Italic,
} from '@expo-google-fonts/playfair-display';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { AuthProvider } from '@/context/AuthContext';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { AppPreferencesProvider } from '@/context/AppPreferencesContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { useTheme } from '@/hooks/useTheme';
import { usePushNotifications } from '@/hooks/usePushNotifications';

SplashScreen.preventAutoHideAsync().catch(() => {});

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

function AppShell() {
  const { scheme } = useTheme();
  usePushNotifications();
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}

function ClerkSetupNotice() {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeTitle}>Clerk isn't configured yet</Text>
      <Text style={styles.noticeBody}>
        Add your publishable key from the Clerk dashboard to{'\n'}
        EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env, then restart the app.
      </Text>
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_600SemiBold_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <ClerkSetupNotice />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
        <AuthProvider>
          <OnboardingProvider>
            <AppPreferencesProvider>
              <NotificationsProvider>
                <AppShell />
              </NotificationsProvider>
            </AppPreferencesProvider>
          </OnboardingProvider>
        </AuthProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  notice: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4EEE4',
    paddingHorizontal: 32,
  },
  noticeTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: '#2B2620',
    marginBottom: 12,
    textAlign: 'center',
  },
  noticeBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#8C8478',
    textAlign: 'center',
    lineHeight: 20,
  },
});
