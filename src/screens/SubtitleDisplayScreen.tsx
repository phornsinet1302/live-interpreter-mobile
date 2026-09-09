import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { randomDemoLine } from '@/mocks/session';
import { fonts, radius, spacing } from '@/utils/theme';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SubtitleDisplay'>;

const CAPTION_COLORS = ['#FFFFFF', '#F4C542', '#7FD6C2', '#F49AC1', '#C1603A'];
const MIN_SIZE = 22;
const MAX_SIZE = 58;
const STEP = 4;

export function SubtitleDisplayScreen() {
  const navigation = useNavigation<Nav>();
  const [fontSize, setFontSize] = useState(34);
  const [dark, setDark] = useState(true);
  const [color, setColor] = useState(CAPTION_COLORS[0]);
  const [caption] = useState(() => randomDemoLine());

  const bg = dark ? '#12100D' : '#F4EEE4';
  const sub = dark ? 'rgba(255,255,255,0.55)' : 'rgba(43,38,32,0.55)';

  const onCast = () => {
    Alert.alert(
      'Open on another display',
      'Connect this device to a TV or monitor via screen mirroring (AirPlay / Chromecast / HDMI) to project these subtitles full-screen. Native casting support needs a dev-client build with a casting SDK — not available in this Expo Go preview.'
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="chevron-down" size={22} color={sub} />
          </Pressable>
          <Text style={[styles.topLabel, { color: sub }]}>Subtitle display</Text>
          <Pressable onPress={onCast} hitSlop={12}>
            <Ionicons name="tv-outline" size={20} color={sub} />
          </Pressable>
        </View>

        <View style={styles.captionWrap}>
          <Text style={[styles.caption, { fontSize, lineHeight: fontSize * 1.25, color }]}>
            {caption.translated}
          </Text>
          <Text style={[styles.captionSub, { color: sub }]}>{caption.original}</Text>
        </View>

        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: sub }]}>Font size</Text>
            <View style={styles.stepper}>
              <Pressable
                onPress={() => setFontSize((s) => Math.max(MIN_SIZE, s - STEP))}
                style={styles.stepperButton}
              >
                <Ionicons name="remove" size={16} color={dark ? '#fff' : '#2B2620'} />
              </Pressable>
              <Text style={[styles.stepperValue, { color: dark ? '#fff' : '#2B2620' }]}>{fontSize}</Text>
              <Pressable
                onPress={() => setFontSize((s) => Math.min(MAX_SIZE, s + STEP))}
                style={styles.stepperButton}
              >
                <Ionicons name="add" size={16} color={dark ? '#fff' : '#2B2620'} />
              </Pressable>
            </View>
          </View>

          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: sub }]}>Caption color</Text>
            <View style={styles.swatchRow}>
              {CAPTION_COLORS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={[
                    styles.swatch,
                    { backgroundColor: c },
                    color === c && styles.swatchActive,
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: sub }]}>Background</Text>
            <Pressable onPress={() => setDark((d) => !d)} style={styles.bgToggle}>
              <Text style={[styles.bgToggleText, { color: dark ? '#fff' : '#2B2620' }]}>
                {dark ? 'Dark' : 'Light'}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  topLabel: { fontFamily: fonts.sansSemiBold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  captionWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  caption: {
    fontFamily: fonts.serifBold,
    textAlign: 'center',
  },
  captionSub: {
    fontFamily: fonts.sans,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  controls: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
  controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  controlLabel: { fontFamily: fonts.sansSemiBold, fontSize: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepperButton: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { fontFamily: fonts.sansSemiBold, fontSize: 14, width: 24, textAlign: 'center' },
  swatchRow: { flexDirection: 'row', gap: spacing.sm },
  swatch: { width: 22, height: 22, borderRadius: 11 },
  swatchActive: { borderWidth: 2, borderColor: '#C1603A' },
  bgToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  bgToggleText: { fontFamily: fonts.sansSemiBold, fontSize: 12 },
});
