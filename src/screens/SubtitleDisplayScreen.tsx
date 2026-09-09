import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { randomDemoLine } from '@/mocks/session';
import * as subtitlesService from '@/services/subtitles';
import { connectSubtitlesSocket, disconnectSubtitlesSocket } from '@/services/socket';
import { fonts, radius, spacing } from '@/utils/theme';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SubtitleDisplay'>;
type Rt = RouteProp<RootStackParamList, 'SubtitleDisplay'>;

const CAPTION_COLORS = ['#FFFFFF', '#F4C542', '#7FD6C2', '#F49AC1', '#C1603A'];
const MIN_SIZE = 22;
const MAX_SIZE = 58;
const STEP = 4;

interface Caption {
  original: string;
  translated: string;
}

export function SubtitleDisplayScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const [meetingId] = useState(() => route.params?.meetingId ?? `demo-${Date.now()}`);
  const isDemo = meetingId.startsWith('demo-');

  const [fontSize, setFontSize] = useState(34);
  const [dark, setDark] = useState(true);
  const [color, setColor] = useState(CAPTION_COLORS[0]);
  const [code, setCode] = useState<string | null>(null);
  const [caption, setCaption] = useState<Caption>({
    original: '',
    translated: 'Waiting for the next line…',
  });

  useEffect(() => {
    let active = true;

    if (isDemo) {
      setCaption(randomDemoLine());
      return;
    }

    (async () => {
      try {
        let session: subtitlesService.SubtitleSession;
        try {
          session = await subtitlesService.getSubtitleSession(meetingId);
        } catch {
          session = await subtitlesService.createSubtitleSession(meetingId, {
            fontSize,
            fontColor: color,
            backgroundColor: dark ? '#000000' : '#FFFFFF',
          });
        }
        if (!active) return;
        setCode(session.code);
        setFontSize(session.fontSize);
        setColor(session.fontColor);
        setDark(session.backgroundColor.toLowerCase() !== '#ffffff');

        const socket = connectSubtitlesSocket(session.code);
        socket.on(
          'subtitle:text',
          (payload: { source?: string; original?: string; translated?: string }) => {
            setCaption({
              original: payload.source ?? payload.original ?? '',
              translated: payload.translated ?? '',
            });
          }
        );
      } catch {
        if (active) setCaption(randomDemoLine());
      }
    })();

    return () => {
      active = false;
      disconnectSubtitlesSocket();
    };
  }, [meetingId, isDemo]);

  const bg = dark ? '#12100D' : '#F4EEE4';
  const sub = dark ? 'rgba(255,255,255,0.55)' : 'rgba(43,38,32,0.55)';

  const persistSettings = (next: Partial<{ fontSize: number; fontColor: string; backgroundColor: string }>) => {
    if (isDemo || !code) return;
    subtitlesService.updateSubtitleSession(meetingId, next).catch(() => {});
  };

  const changeFontSize = (next: number) => {
    setFontSize(next);
    persistSettings({ fontSize: next });
  };
  const changeColor = (next: string) => {
    setColor(next);
    persistSettings({ fontColor: next });
  };
  const toggleBackground = () => {
    const nextDark = !dark;
    setDark(nextDark);
    persistSettings({ backgroundColor: nextDark ? '#000000' : '#FFFFFF' });
  };

  const onCast = () => {
    Alert.alert(
      'Open on another display',
      code
        ? `Share code ${code} — open it on the web app's subtitle viewer for a second display, or connect this device to a TV/monitor via screen mirroring.`
        : 'Connect this device to a TV or monitor via screen mirroring (AirPlay / Chromecast / HDMI) to project these subtitles full-screen.'
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="chevron-down" size={22} color={sub} />
          </Pressable>
          <Text style={[styles.topLabel, { color: sub }]}>
            {code ? `Subtitle display · ${code}` : 'Subtitle display'}
          </Text>
          <Pressable onPress={onCast} hitSlop={12}>
            <Ionicons name="tv-outline" size={20} color={sub} />
          </Pressable>
        </View>

        <View style={styles.captionWrap}>
          <Text style={[styles.caption, { fontSize, lineHeight: fontSize * 1.25, color }]}>
            {caption.translated}
          </Text>
          {caption.original ? (
            <Text style={[styles.captionSub, { color: sub }]}>{caption.original}</Text>
          ) : null}
        </View>

        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: sub }]}>Font size</Text>
            <View style={styles.stepper}>
              <Pressable
                onPress={() => changeFontSize(Math.max(MIN_SIZE, fontSize - STEP))}
                style={styles.stepperButton}
              >
                <Ionicons name="remove" size={16} color={dark ? '#fff' : '#2B2620'} />
              </Pressable>
              <Text style={[styles.stepperValue, { color: dark ? '#fff' : '#2B2620' }]}>{fontSize}</Text>
              <Pressable
                onPress={() => changeFontSize(Math.min(MAX_SIZE, fontSize + STEP))}
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
                  onPress={() => changeColor(c)}
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
            <Pressable onPress={toggleBackground} style={styles.bgToggle}>
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
