import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { radius, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'NewSession'>;

export function NewSessionScreen() {
  const navigation = useNavigation<Nav>();
  const [title, setTitle] = useState('');
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const onStart = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    navigation.replace('SessionLive', { title: trimmed });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.iconWrap}>
            <Ionicons name="mic-outline" size={28} color={colors.accent} />
          </View>
          <Text style={styles.title}>New session</Text>
          <Text style={styles.subtitle}>
            Give it a name so you can find it later — everyone's speech still gets translated and
            labeled live, same as the Home tab.
          </Text>

          <View style={styles.form}>
            <Input
              label="Session name"
              placeholder="e.g. Team Standup, Client Call"
              value={title}
              onChangeText={setTitle}
              autoFocus
              onSubmitEditing={onStart}
            />
            <Button
              title="Start session"
              icon="arrow-forward"
              onPress={onStart}
              disabled={!title.trim()}
              style={styles.submit}
            />
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
    topBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
    container: { flexGrow: 1, padding: spacing.lg, alignItems: 'center', paddingTop: spacing.lg },
    iconWrap: {
      width: 64,
      height: 64,
      borderRadius: radius.xl,
      backgroundColor: colors.accentMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    title: { ...typography.h1, textAlign: 'center', marginBottom: spacing.xs },
    subtitle: {
      ...typography.bodyMuted,
      textAlign: 'center',
      marginBottom: spacing.lg,
      paddingHorizontal: spacing.md,
    },
    form: { width: '100%', marginTop: spacing.lg },
    submit: { marginTop: spacing.xs },
  });
}
