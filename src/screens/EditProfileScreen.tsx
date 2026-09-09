import React, { useState } from 'react';
import {
  Alert,
  Image,
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
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Avatar } from '@/components/Avatar';
import { LanguagePickerModal } from '@/components/LanguagePickerModal';
import { useAuth } from '@/hooks/useAuth';
import { languageName } from '@/mocks/languages';
import { colors, fonts, radius, spacing, typography } from '@/utils/theme';
import { ApiError } from '@/types';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

export function EditProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl);
  const [language, setLanguage] = useState(user?.preferredLanguage ?? 'en');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Photo library access is required to change your picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateProfile({ name: name.trim(), preferredLanguage: language, avatarUrl });
      navigation.goBack();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Pressable onPress={pickAvatar} style={styles.avatarWrap}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Avatar name={name || user?.name} size={88} />
            )}
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={14} color={colors.white} />
            </View>
          </Pressable>
          <Text style={styles.avatarHint}>Tap to change photo</Text>

          <View style={styles.form}>
            <Input label="Full name" placeholder="Your name" value={name} onChangeText={setName} />

            <Text style={styles.label}>Preferred language</Text>
            <Pressable style={styles.selectField} onPress={() => setPickerVisible(true)}>
              <Ionicons name="globe-outline" size={18} color={colors.textFaint} style={styles.selectIcon} />
              <Text style={styles.selectValue}>{languageName(language)}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
            </Pressable>

            <View style={styles.readonlyRow}>
              <Ionicons name="mail-outline" size={18} color={colors.textFaint} style={styles.selectIcon} />
              <Text style={styles.readonlyValue}>{user?.email}</Text>
            </View>

            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              title="Save changes"
              onPress={onSave}
              loading={saving}
              disabled={!name.trim()}
              style={styles.submit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LanguagePickerModal
        visible={pickerVisible}
        selected={language}
        title="Preferred language"
        onSelect={setLanguage}
        onClose={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: spacing.lg, alignItems: 'center' },
  avatarWrap: { marginTop: spacing.lg },
  avatarImage: { width: 88, height: 88, borderRadius: 44 },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  avatarHint: { ...typography.caption, marginTop: spacing.sm, marginBottom: spacing.xl },
  form: { width: '100%' },
  label: { ...typography.label, marginBottom: spacing.xs },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  selectIcon: { marginRight: spacing.sm },
  selectValue: { flex: 1, fontFamily: fonts.sans, fontSize: 15, color: colors.text },
  readonlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  readonlyValue: { flex: 1, fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted },
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
});
