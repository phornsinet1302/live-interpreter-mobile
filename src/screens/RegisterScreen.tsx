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
import { useSignUp, useSSO } from '@clerk/expo';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { useOnboarding } from '@/hooks/useOnboarding';
import { clerkErrorMessage } from '@/utils/clerkError';
import { fonts, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { signUp } = useSignUp();
  const { startSSOFlow } = useSSO();
  const { completeOnboarding } = useOnboarding();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const canSubmit = name.trim() && email.trim() && password.length >= 6;

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
      const { error: signUpError } = await signUp.password({
        emailAddress: email.trim(),
        password,
        firstName: name.trim(),
      });
      if (signUpError) {
        setError(clerkErrorMessage(signUpError, 'Could not create your account.'));
        return;
      }
      const { error: codeError } = await signUp.verifications.sendEmailCode();
      if (codeError) {
        setError(clerkErrorMessage(codeError, 'Could not send a verification code.'));
        return;
      }
      setPendingVerification(true);
    } catch (e) {
      setError(clerkErrorMessage(e, 'Could not create your account.'));
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });
      if (verifyError) {
        setError(clerkErrorMessage(verifyError, 'Invalid or expired code.'));
      } else if (signUp.status === 'complete') {
        await signUp.finalize();
        onSignedIn();
      } else {
        setError('That code didn’t complete sign-up — please try again.');
      }
    } catch (e) {
      setError(clerkErrorMessage(e, 'Invalid or expired code.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.topBarLink}
          onPress={() => (pendingVerification ? setPendingVerification(false) : navigation.goBack())}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={16} color={colors.text} />
          <Text style={styles.topBarText}>Back</Text>
        </Pressable>
        {!pendingVerification && (
          <Pressable
            style={styles.topBarLink}
            onPress={() => navigation.replace('Login')}
            hitSlop={12}
          >
            <Text style={styles.topBarMuted}>Have an account? </Text>
            <Text style={styles.topBarAccent}>Sign in</Text>
          </Pressable>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {pendingVerification ? (
            <>
              <Text style={styles.eyebrow}>Almost there</Text>
              <Text style={styles.title}>
                Verify your <Text style={styles.titleAccent}>email</Text>
              </Text>
              <Text style={styles.subtitle}>
                Enter the code we sent to {email.trim()}.
              </Text>

              <View style={styles.form}>
                <Input
                  label="Verification code"
                  placeholder="123456"
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  value={code}
                  onChangeText={setCode}
                />

                {error && (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={16} color={colors.danger} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <Button
                  title="Verify & continue"
                  onPress={onVerify}
                  loading={loading}
                  disabled={!code.trim()}
                  style={styles.submit}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.eyebrow}>Free · Forever</Text>
              <Text style={styles.title}>
                Create your <Text style={styles.titleAccent}>account</Text>
              </Text>
              <Text style={styles.subtitle}>
                Join thousands of translators, travelers, and wordsmiths.
              </Text>

              <View style={styles.form}>
                <Input
                  label="Full name"
                  placeholder="Alex Chen"
                  autoCapitalize="words"
                  autoComplete="name"
                  value={name}
                  onChangeText={setName}
                />
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
                  placeholder="At least 6 characters"
                  isPassword
                  value={password}
                  onChangeText={setPassword}
                />

                {error && (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={16} color={colors.danger} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <Button
                  title="Create account"
                  onPress={onSubmit}
                  loading={loading}
                  disabled={!canSubmit}
                  style={styles.submit}
                />

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <GoogleSignInButton onPress={promptGoogleSignIn} loading={googleLoading} />
              </View>
            </>
          )}
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
