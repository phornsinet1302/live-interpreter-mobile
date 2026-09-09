import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
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
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ToggleRow } from '@/components/ToggleRow';
import { translate, translateLookup } from '@/services/translation';
import { useAuth } from '@/hooks/useAuth';
import { fonts, radius, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { ApiError, WordLookupResult } from '@/types';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'UniversalTranslate'>;

export function UniversalTranslateScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const target = user?.preferredLanguage ?? 'en';

  const [overlayEnabled, setOverlayEnabled] = useState(false);

  const [clipboardText, setClipboardText] = useState('');
  const [clipboardResult, setClipboardResult] = useState<string | null>(null);
  const [clipboardBusy, setClipboardBusy] = useState(false);

  const [ocrCaptured, setOcrCaptured] = useState(false);

  const [webInput, setWebInput] = useState('');
  const [webResult, setWebResult] = useState<string | null>(null);
  const [webBusy, setWebBusy] = useState(false);

  const [lookupText, setLookupText] = useState('');
  const [lookupResult, setLookupResult] = useState<WordLookupResult | null>(null);
  const [lookupBusy, setLookupBusy] = useState(false);
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const onOverlayToggle = (value: boolean) => {
    setOverlayEnabled(value);
    if (!value) return;
    if (Platform.OS === 'android') {
      Alert.alert(
        'Enable floating overlay',
        'Android needs the "Display over other apps" permission for a floating translation bubble. Open system settings to grant it?',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open settings', onPress: () => Linking.openSettings() },
        ]
      );
    } else {
      Alert.alert(
        'Not available on iOS',
        "iOS doesn't allow regular apps to draw a system-wide floating overlay. Use Clipboard or Screen text translation below instead."
      );
    }
  };

  const onClipboardTranslate = async () => {
    setClipboardBusy(true);
    setClipboardResult(null);
    try {
      const text = await Clipboard.getStringAsync();
      if (!text.trim()) {
        Alert.alert('Clipboard is empty', 'Copy some text first, then try again.');
        return;
      }
      setClipboardText(text);
      const result = await translate({ text, source: 'auto', target });
      setClipboardResult(result.translatedText);
    } catch (e) {
      Alert.alert('Translation failed', (e as ApiError).message ?? 'Please try again.');
    } finally {
      setClipboardBusy(false);
    }
  };

  const onCopyResult = async () => {
    if (clipboardResult) await Clipboard.setStringAsync(clipboardResult);
  };

  const onCaptureScreenText = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera access is required to capture on-screen text.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (result.canceled || !result.assets[0]) return;
    // This backend doesn't expose an OCR/image-translate endpoint yet, so the
    // photo is captured but not sent anywhere.
    setOcrCaptured(true);
  };

  const onLookup = async () => {
    if (!lookupText.trim()) return;
    setLookupBusy(true);
    setLookupResult(null);
    try {
      const result = await translateLookup(lookupText, 'auto', target);
      setLookupResult(result);
    } catch (e) {
      Alert.alert('Lookup failed', (e as ApiError).message ?? 'Please try again.');
    } finally {
      setLookupBusy(false);
    }
  };

  const onWebsiteTranslate = async () => {
    if (!webInput.trim()) return;
    const isUrl = /^https?:\/\//i.test(webInput.trim());
    if (isUrl) {
      setWebResult(
        'Full webpage fetch + translation needs a backend rendering step. Paste the page text directly instead for an immediate translation.'
      );
      return;
    }
    setWebBusy(true);
    setWebResult(null);
    try {
      const result = await translate({ text: webInput, source: 'auto', target });
      setWebResult(result.translatedText);
    } catch (e) {
      Alert.alert('Translation failed', (e as ApiError).message ?? 'Please try again.');
    } finally {
      setWebBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Universal Translate</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card} padded={false}>
          <View style={styles.cardPadding}>
            <ToggleRow
              icon="apps-outline"
              label="Floating overlay"
              subtitle="Translate any app with an on-screen bubble"
              value={overlayEnabled}
              onValueChange={onOverlayToggle}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="copy-outline" size={16} color={colors.accent} />
            <Text style={styles.cardHeader}>Clipboard translation</Text>
          </View>
          <Text style={styles.cardSubtitle}>Copy text anywhere, then translate it here.</Text>
          <Button
            title="Translate clipboard"
            icon="clipboard-outline"
            variant="secondary"
            onPress={onClipboardTranslate}
            loading={clipboardBusy}
            style={styles.actionButton}
          />
          {clipboardText ? <Text style={styles.sourceText}>{clipboardText}</Text> : null}
          {clipboardResult ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{clipboardResult}</Text>
              <Pressable onPress={onCopyResult} style={styles.copyResultButton}>
                <Ionicons name="copy-outline" size={14} color={colors.accent} />
                <Text style={styles.copyResultText}>Copy translated</Text>
              </Pressable>
            </View>
          ) : null}
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="camera-outline" size={16} color={colors.accent} />
            <Text style={styles.cardHeader}>Screen text translation</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Capture a photo of on-screen text (signs, menus, screenshots) to translate it.
          </Text>
          <Button
            title="Scan & translate"
            icon="scan-outline"
            variant="secondary"
            onPress={onCaptureScreenText}
            style={styles.actionButton}
          />
          {ocrCaptured ? (
            <Text style={styles.noteText}>
              Photo captured. This backend doesn't have text-recognition (OCR) support yet — once
              an endpoint like /translate/image is added, this card will send the photo there.
            </Text>
          ) : null}
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="book-outline" size={16} color={colors.accent} />
            <Text style={styles.cardHeader}>Word lookup</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Look up a word or phrase with phonetics and example sentences.
          </Text>
          <Input
            placeholder="e.g. serendipity"
            value={lookupText}
            onChangeText={setLookupText}
            autoCapitalize="none"
            containerStyle={styles.webInput}
          />
          <Button
            title="Look up"
            variant="secondary"
            onPress={onLookup}
            loading={lookupBusy}
            disabled={!lookupText.trim()}
            style={styles.actionButton}
          />
          {lookupResult ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{lookupResult.translatedText}</Text>
              {lookupResult.phonetic ? (
                <Text style={styles.phoneticText}>/{lookupResult.phonetic}/</Text>
              ) : null}
              {lookupResult.examples.map((ex, i) => (
                <Text key={i} style={styles.exampleText}>
                  · {ex}
                </Text>
              ))}
            </View>
          ) : null}
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="globe-outline" size={16} color={colors.accent} />
            <Text style={styles.cardHeader}>Website translation</Text>
          </View>
          <Text style={styles.cardSubtitle}>Paste page text, or a URL, to translate it.</Text>
          <Input
            placeholder="Paste text or a URL"
            value={webInput}
            onChangeText={setWebInput}
            multiline
            containerStyle={styles.webInput}
          />
          <Button
            title="Translate"
            variant="secondary"
            onPress={onWebsiteTranslate}
            loading={webBusy}
            disabled={!webInput.trim()}
            style={styles.actionButton}
          />
          {webResult ? <Text style={styles.noteText}>{webResult}</Text> : null}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, typography: ThemeTypography) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h3 },
  container: { padding: spacing.md, paddingBottom: spacing.xl },
  card: { marginBottom: spacing.md },
  cardPadding: { paddingHorizontal: spacing.lg },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs, gap: spacing.xs },
  cardHeader: { ...typography.h3 },
  cardSubtitle: { ...typography.caption, marginBottom: spacing.md },
  actionButton: { alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  sourceText: { ...typography.bodyMuted, fontStyle: 'italic', marginTop: spacing.md },
  resultBox: {
    marginTop: spacing.sm,
    backgroundColor: colors.accentMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  resultText: { fontFamily: fonts.serifItalic, fontSize: 16, color: colors.text },
  phoneticText: { ...typography.caption, marginTop: spacing.xs },
  exampleText: { ...typography.bodyMuted, fontSize: 13, marginTop: spacing.xs },
  copyResultButton: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  copyResultText: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.accent, marginLeft: 4 },
  noteText: { ...typography.caption, marginTop: spacing.sm },
  webInput: { marginTop: spacing.xs },
  });
}
