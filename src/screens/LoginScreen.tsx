import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSignIn, useSSO } from '@clerk/expo';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { useOnboarding } from '@/hooks/useOnboarding';
import { clerkErrorMessage } from '@/utils/clerkError';
import { fonts, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { signIn } = useSignIn();
  const { startSSOFlow } = useSSO();
  const { completeOnboarding } = useOnboarding();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const onSignedIn = () => {
    completeOnboarding();
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const promptGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { createdSessionId, setActive: setActiveSSO } = await startSSOFlow({
        strategy: 'oauth_google',
      });
      if (createdSessionId && setActiveSSO) {
        await setActiveSSO({ session: createdSessionId });
        onSignedIn();
      }
    } catch (e) {
      setError(clerkErrorMessage(e, 'Google sign-in failed.'));
    } finally {
      setGoogleLoading(false);
    }
  };

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await signIn.password({
        identifier: email.trim(),
        password,
      });
      if (signInError) {
        setError(clerkErrorMessage(signInError, 'Could not sign in.'));
      } else if (signIn.status === 'complete') {
        await signIn.finalize();
        onSignedIn();
      } else {
        setError('Additional verification is required for this account.');
      }
    } catch (e) {
      setError(clerkErrorMessage(e, 'Could not sign in.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.topBarLink}
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={16} color={colors.text} />
          <Text style={styles.topBarText}>Back</Text>
        </Pressable>
        <Pressable
          style={styles.topBarLink}
          onPress={() => navigation.replace('Register')}
          hitSlop={12}
        >
          <Text style={styles.topBarMuted}>No account? </Text>
          <Text style={styles.topBarAccent}>Sign up</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.eyebrow}>Welcome back</Text>
          <Text style={styles.title}>
            Sign in to <Text style={styles.titleAccent}>Live Interpreter</Text>
          </Text>
          <Text style={styles.subtitle}>Continue where you left off.</Text>

          <View style={styles.form}>
            <Input
              label="Email address"
              placeholder="you@example.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Password"
              placeholder="Your password"
              isPassword
              value={password}
              onChangeText={setPassword}
            />

            <Pressable
              onPress={() => navigation.navigate('ForgotPassword')}
              hitSlop={8}
              style={styles.forgotLink}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              title="Sign In"
              onPress={onSubmit}
              loading={loading}
              disabled={!email.trim() || !password}
              style={styles.submit}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <GoogleSignInButton onPress={promptGoogleSignIn} loading={googleLoading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, typography: ThemeTypography) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  topBarLink: { flexDirection: 'row', alignItems: 'center' },
  topBarText: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.xs,
  },
  topBarMuted: { fontFamily: fonts.sans, fontSize: 13, color: colors.textMuted },
  topBarAccent: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.accent },
  container: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  eyebrow: { ...typography.eyebrow, marginBottom: spacing.sm },
  title: { ...typography.display, marginBottom: spacing.xs },
  titleAccent: { fontFamily: fonts.serifItalic },
  subtitle: { ...typography.bodyMuted, marginBottom: spacing.xl },
  form: { marginBottom: spacing.lg },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerMuted,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: { color: colors.danger, marginLeft: spacing.xs, flexShrink: 1 },
  submit: { marginTop: spacing.xs },
  forgotLink: { alignSelf: 'flex-end', marginBottom: spacing.md, marginTop: -spacing.xs },
  forgotText: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.accent },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.textFaint,
    marginHorizontal: spacing.sm,
  },
  });
}
