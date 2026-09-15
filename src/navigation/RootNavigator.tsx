import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer, Theme as NavTheme, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useTheme } from '@/hooks/useTheme';
import { ThemeColors, fonts } from '@/utils/theme';
import { RootStackParamList, MainTabParamList } from './types';

import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { StartJourneyScreen } from '@/screens/StartJourneyScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { RegisterScreen } from '@/screens/RegisterScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { ForgotPasswordScreen } from '@/screens/ForgotPasswordScreen';
import { EditProfileScreen } from '@/screens/EditProfileScreen';
import { DeleteAccountScreen } from '@/screens/DeleteAccountScreen';
import { NewSessionScreen } from '@/screens/NewSessionScreen';
import { SessionLiveScreen } from '@/screens/SessionLiveScreen';
import { SummaryScreen } from '@/screens/SummaryScreen';
import { HistoryDetailScreen } from '@/screens/HistoryDetailScreen';
import { UniversalTranslateScreen } from '@/screens/UniversalTranslateScreen';
import { AnalyticsScreen } from '@/screens/AnalyticsScreen';
import { NotificationsScreen } from '@/screens/NotificationsScreen';
import { NoiseSettingsScreen } from '@/screens/NoiseSettingsScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function createScreenOptions(colors: ThemeColors) {
  return {
    headerStyle: { backgroundColor: colors.background },
    headerShadowVisible: false,
    headerTitleStyle: { fontFamily: fonts.sansSemiBold },
    headerTintColor: colors.text,
    contentStyle: { backgroundColor: colors.background },
  } as const;
}

function createAuthScreenOptions(colors: ThemeColors) {
  return {
    ...createScreenOptions(colors),
    headerShown: false,
  } as const;
}

const TAB_ICONS: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  History: 'time',
  Settings: 'settings',
};

function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: fonts.sansSemiBold },
        headerTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.backgroundElevated,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: fonts.sansSemiBold, fontSize: 11 },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={
              focused
                ? TAB_ICONS[route.name as keyof MainTabParamList]
                : (`${TAB_ICONS[route.name as keyof MainTabParamList]}-outline` as keyof typeof Ionicons.glyphMap)
            }
            size={size - 2}
            color={color}
          />
        ),
      })}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tabs.Screen name="History" component={HistoryScreen} />
      <Tabs.Screen name="Settings" component={SettingsScreen} />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { isLoading: onboardingLoading, completeOnboarding } = useOnboarding();
  const { colors, scheme } = useTheme();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  // Single, authoritative place that reacts to actually becoming signed in —
  // rather than each auth screen navigating right after its own local Clerk
  // call succeeds. Screens' calls and the real global auth state can
  // disagree (that's exactly what caused "signed up successfully but
  // Settings still showed guest" earlier), so this is the one thing that
  // gets to decide "we're in" and send the user to Main.
  //
  // Skipped while ForgotPasswordScreen has focus: its own reset flow calls
  // signIn.finalize() too (so isAuthenticated flips true mid-flow, same as
  // Login/Register), but it intentionally shows its own "Password updated"
  // confirmation step first — an automatic redirect here would yank the
  // user past that before they see it. That screen navigates itself once
  // its own Continue button is tapped.
  //
  // authReadyRef guards against a false transition on cold start: while
  // Clerk is still resolving, isAuthenticated reads false, so a returning
  // logged-in user's very first "loading finished, now true" render looked
  // identical to a fresh sign-in and yanked them straight to Main before
  // they ever saw the onboarding trailer. The first render after loading
  // finishes just records the baseline instead of reacting to it — only
  // a transition that happens *after* that baseline is a real sign-in.
  const authReadyRef = useRef(false);
  const wasAuthenticatedRef = useRef(isAuthenticated);
  useEffect(() => {
    if (authLoading) return;
    if (!authReadyRef.current) {
      authReadyRef.current = true;
      wasAuthenticatedRef.current = isAuthenticated;
      return;
    }
    const wasAuthenticated = wasAuthenticatedRef.current;
    wasAuthenticatedRef.current = isAuthenticated;
    if (!isAuthenticated || wasAuthenticated) return;
    if (!navigationRef.isReady()) return;
    if (navigationRef.getCurrentRoute()?.name === 'ForgotPassword') return;
    completeOnboarding();
    navigationRef.reset({ index: 0, routes: [{ name: 'Main' }] });
  }, [isAuthenticated, authLoading, completeOnboarding, navigationRef]);

  if (authLoading || onboardingLoading) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const navTheme: NavTheme = {
    dark: scheme === 'dark',
    colors: {
      primary: colors.accent,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
  };

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <RootStack.Navigator
        screenOptions={createScreenOptions(colors)}
        initialRouteName="Welcome"
      >
        <RootStack.Screen
          name="Welcome"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="StartJourney"
          component={StartJourneyScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="Login"
          component={LoginScreen}
          options={createAuthScreenOptions(colors)}
        />
        <RootStack.Screen
          name="Register"
          component={RegisterScreen}
          options={createAuthScreenOptions(colors)}
        />
        <RootStack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={createAuthScreenOptions(colors)}
        />
        <RootStack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ title: 'Edit profile' }}
        />
        <RootStack.Screen
          name="DeleteAccount"
          component={DeleteAccountScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="NewSession"
          component={NewSessionScreen}
          options={{ headerShown: false, animation: 'slide_from_left', gestureEnabled: true }}
        />
        <RootStack.Screen
          name="SessionLive"
          component={SessionLiveScreen}
          options={{ headerShown: false, animation: 'slide_from_right', gestureEnabled: true }}
        />
        <RootStack.Screen
          name="Summary"
          component={SummaryScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="HistoryDetail"
          component={HistoryDetailScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="UniversalTranslate"
          component={UniversalTranslateScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="NoiseSettings"
          component={NoiseSettingsScreen}
          options={{ headerShown: false }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
