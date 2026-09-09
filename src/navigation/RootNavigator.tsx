import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { colors, fonts } from '@/utils/theme';
import { RootStackParamList, MainTabParamList } from './types';

import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { StartJourneyScreen } from '@/screens/StartJourneyScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { RegisterScreen } from '@/screens/RegisterScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { ForgotPasswordScreen } from '@/screens/ForgotPasswordScreen';
import { EditProfileScreen } from '@/screens/EditProfileScreen';
import { DeleteAccountScreen } from '@/screens/DeleteAccountScreen';
import { SessionSetupScreen } from '@/screens/SessionSetupScreen';
import { SessionScreen } from '@/screens/SessionScreen';
import { SubtitleDisplayScreen } from '@/screens/SubtitleDisplayScreen';
import { SummaryScreen } from '@/screens/SummaryScreen';
import { HistoryDetailScreen } from '@/screens/HistoryDetailScreen';
import { UniversalTranslateScreen } from '@/screens/UniversalTranslateScreen';
import { AnalyticsScreen } from '@/screens/AnalyticsScreen';
import { NotificationsScreen } from '@/screens/NotificationsScreen';
import { NoiseSettingsScreen } from '@/screens/NoiseSettingsScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  headerTitleStyle: { fontFamily: fonts.sansSemiBold },
  headerTintColor: colors.text,
  contentStyle: { backgroundColor: colors.background },
} as const;

const authScreenOptions = {
  ...screenOptions,
  headerShown: false,
} as const;

const TAB_ICONS: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  History: 'time',
  Settings: 'settings',
};

function MainTabs() {
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
  const { isLoading: authLoading } = useAuth();
  const { hasOnboarded, isLoading: onboardingLoading } = useOnboarding();

  if (authLoading || onboardingLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={screenOptions}
        initialRouteName={hasOnboarded ? 'Main' : 'Welcome'}
      >
        {!hasOnboarded && (
          <>
            <RootStack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <RootStack.Screen
              name="StartJourney"
              component={StartJourneyScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
        <RootStack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="Login"
          component={LoginScreen}
          options={authScreenOptions}
        />
        <RootStack.Screen
          name="Register"
          component={RegisterScreen}
          options={authScreenOptions}
        />
        <RootStack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={authScreenOptions}
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
          name="SessionSetup"
          component={SessionSetupScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="Session"
          component={SessionScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="SubtitleDisplay"
          component={SubtitleDisplayScreen}
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
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
    backgroundColor: colors.background,
  },
});
