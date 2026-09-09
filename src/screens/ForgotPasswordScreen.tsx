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
import { useSignIn } from '@clerk/expo';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useOnboarding } from '@/hooks/useOnboarding';
import { clerkErrorMessage } from '@/utils/clerkError';
import { fonts, radius, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const { signIn } = useSignIn();
  const { completeOnboarding } = useOnboarding();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const onRequestCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: createError } = await signIn.create({ identifier: email.trim() });
      if (createError) {
        setError(clerkErrorMessage(createError, 'Could not find that account.'));
        return;
      }
      const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
      if (sendError) {
        setError(clerkErrorMessage(sendError, 'Could not send a reset code.'));
        return;
      }
      setStep('reset');
    } catch (e) {
      setError(clerkErrorMessage(e, 'Could not send a reset code.'));
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({
        code: code.trim(),
      });
      if (verifyError) {
        setError(clerkErrorMessage(verifyError, 'Invalid or expired code.'));
        return;
      }
      const { error: submitError } = await signIn.resetPasswordEmailCode.submitPassword({
        password: newPassword,
      });
      if (submitError) {
        setError(clerkErrorMessage(submitError, 'Could not set your new password.'));
        return;
      }
      if (signIn.status === 'complete') {
        await signIn.finalize();
        setStep('done');
      } else {
        setError('That code didn’t complete the reset — please try again.');
      }
    } catch (e) {
      setError(clerkErrorMessage(e, 'Invalid or expired code.'));
    } finally {
      setLoading(false);
    }
  };

  const onDoneContinue = () => {
    completeOnboarding();
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.topBarLink}
          onPress={() => (step === 'reset' ? setStep('request') : navigation.goBack())}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={16} color={colors.text} />
          <Text style={styles.topBarText}>Back</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {step === 'done' ? (
            <View style={styles.successWrap}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle-outline" size={28} color={colors.accent} />
              </View>
              <Text style={[styles.title, styles.centerText]}>Password updated</Text>
              <Text style={[styles.subtitle, styles.centerText]}>
                You're signed in with your new password.
              </Text>
              <Button title="Continue" onPress={onDoneContinue} style={styles.submit} />
            </View>
          ) : step === 'reset' ? (
            <>
              <Text style={styles.eyebrow}>Check your email</Text>
              <Text style={styles.title}>
                Enter the <Text style={styles.titleAccent}>code</Text>
              </Text>
              <Text style={styles.subtitle}>
                We sent a code to {email.trim()}. Enter it below with your new password.
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
                <Input
                  label="New password"
                  placeholder="At least 6 characters"
                  isPassword
                  value={newPassword}
                  onChangeText={setNewPassword}
                />

                {error && (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={16} color={colors.danger} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <Button
                  title="Reset password"
                  onPress={onResetPassword}
                  loading={loading}
                  disabled={!code.trim() || newPassword.length < 6}
                  style={styles.submit}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.eyebrow}>Reset password</Text>
              <Text style={styles.title}>
                Forgot your <Text style={styles.titleAccent}>password?</Text>
              </Text>
              <Text style={styles.subtitle}>
                Enter the email on your account and we'll send you a reset code.
              </Text>

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

                {error && (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={16} color={colors.danger} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <Button
                  title="Send reset code"
                  onPress={onRequestCode}
                  loading={loading}
                  disabled={!email.trim()}
                  style={styles.submit}
                />
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
  topBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  topBarLink: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  topBarText: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.xs,
  },
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
  successWrap: { alignItems: 'center' },
  centerText: { textAlign: 'center' },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  });
}
