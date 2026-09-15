import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { fonts, radius, spacing, ThemeColors, ThemeTypography } from '@/utils/theme';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const PHRASE_PAIRS: { src: string; dst: string }[] = [
  { src: 'Hello', dst: 'Bonjour' },
  { src: 'Bonjour', dst: 'こんにちは' },
  { src: 'Thank you', dst: 'شكراً' },
  { src: 'Good morning', dst: 'អរុណសួស្តី' },
];

const SPARK_LAYOUT: { top?: number; left?: number; right?: number; bottom?: number; size: number; delay: number }[] = [
  { top: -6, left: 10, size: 14, delay: 0 },
  { top: 14, right: -12, size: 10, delay: 500 },
  { bottom: 8, right: -4, size: 16, delay: 1000 },
  { bottom: -10, left: 26, size: 11, delay: 1600 },
  { top: '34%' as unknown as number, left: -16, size: 9, delay: 2100 },
  { top: -12, right: 22, size: 8, delay: 2600 },
];

/** Loops an Animated.Value 0→1 forever; `delay` staggers the first cycle only. */
function useLoop(duration: number, delay = 0) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.loop(
        Animated.timing(value, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [value, duration, delay]);
  return value;
}

/** Loops a gentle 1 → peak → 1 breathing scale forever. */
function useBreathe(duration = 3200, peak = 1.045) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(value, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(value, { toValue: 0, duration: duration / 2, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, [value, duration]);
  return value.interpolate({ inputRange: [0, 1], outputRange: [1, peak] });
}

export function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const { isAuthenticated } = useAuth();
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const finishOnboarding = () => {
    if (isAuthenticated) {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } else {
      navigation.navigate('StartJourney');
    }
  };

  const goToPage = (next: number) => {
    setPage(next);
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== page) setPage(next);
  };

  const handleNext = () => {
    if (page < 2) goToPage(page + 1);
    else finishOnboarding();
  };

  return (
    <SafeAreaView style={styles.safe}>
      {page < 2 && (
        <Pressable style={styles.skip} onPress={finishOnboarding} hitSlop={12}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        style={styles.track}
      >
        <View style={[styles.slide, { width }]}>
          <SpeakingHero colors={colors} />
          <SlideCopy
            styles={styles}
            eyebrow="01 · Speaking"
            title="Master Speaking Skills"
            desc="Practice pronunciation with AI-powered feedback and real-time corrections"
          />
        </View>

        <View style={[styles.slide, { width }]}>
          <TranslationHero colors={colors} />
          <SlideCopy
            styles={styles}
            eyebrow="02 · Translation"
            title="Instant Translation"
            desc="Translate between 50+ languages with context-aware AI translation"
          />
        </View>

        <View style={[styles.slide, { width }]}>
          <AssistantHero colors={colors} />
          <SlideCopy
            styles={styles}
            eyebrow="03 · AI Assistant"
            title="Intelligent Learning"
            desc="Get personalized lessons and suggestions powered by advanced AI"
          />
        </View>
      </ScrollView>

      <View style={styles.nav}>
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <Pressable key={i} onPress={() => goToPage(i)} hitSlop={8}>
              <View style={[styles.dot, page === i && styles.dotActive]} />
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>{page === 2 ? 'Get Started' : 'Next'}</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.primaryText} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function SlideCopy({
  styles,
  eyebrow,
  title,
  desc,
}: {
  styles: ReturnType<typeof createStyles>;
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <View style={styles.copy}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{desc}</Text>
    </View>
  );
}

function SpeakingHero({ colors }: { colors: ThemeColors }) {
  const ring1 = useLoop(2600);
  const ring2 = useLoop(2600, 700);
  const ring3 = useLoop(2600, 1400);
  const breathe = useBreathe();

  const ringStyle = (val: Animated.Value) => ({
    transform: [{ scale: val.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.35] }) }],
    opacity: val.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
  });

  return (
    <View style={heroStyles.stage}>
      <View style={[heroStyles.glow, { backgroundColor: colors.accentMuted }]} />
      <Animated.View style={[heroStyles.ring, { borderColor: colors.accent }, ringStyle(ring1)]} />
      <Animated.View style={[heroStyles.ring, { borderColor: colors.accent }, ringStyle(ring2)]} />
      <Animated.View style={[heroStyles.ring, { borderColor: colors.accent }, ringStyle(ring3)]} />
      <Animated.View
        style={[
          heroStyles.badge,
          { backgroundColor: colors.accent, transform: [{ scale: breathe }] },
        ]}
      >
        <Ionicons name="mic" size={40} color={colors.white} />
      </Animated.View>
    </View>
  );
}

function TranslationHero({ colors }: { colors: ThemeColors }) {
  const spin = useLoop(22000);
  const breathe = useBreathe();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fade, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      setPhraseIndex((i) => (i + 1) % PHRASE_PAIRS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [fade]);

  const pair = PHRASE_PAIRS[phraseIndex];
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={heroStyles.stage}>
      <View style={[heroStyles.glow, { backgroundColor: colors.accentMuted }]} />
      <Animated.View style={[heroStyles.orbit, { borderColor: colors.border, transform: [{ rotate }] }]} />
      <Animated.View
        style={[
          heroStyles.squircleBadge,
          { backgroundColor: colors.backgroundElevated, borderColor: colors.border, transform: [{ scale: breathe }] },
        ]}
      >
        <Ionicons name="swap-horizontal" size={34} color={colors.accent} />
      </Animated.View>
      <Animated.View style={[heroStyles.phraseRail, { opacity: fade }]}>
        <Text style={[heroStyles.phraseSrc, { color: colors.textFaint }]}>{pair.src}</Text>
        <Text style={[heroStyles.phraseArrow, { color: colors.accent }]}>→</Text>
        <Text style={[heroStyles.phraseDst, { color: colors.text }]}>{pair.dst}</Text>
      </Animated.View>
    </View>
  );
}

function AssistantHero({ colors }: { colors: ThemeColors }) {
  const spin = useLoop(9000);
  const breathe = useBreathe(3400);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={heroStyles.stage}>
      <View style={[heroStyles.glow, { backgroundColor: colors.accentMuted }]} />
      <Animated.View style={[heroStyles.gearWrap, { transform: [{ scale: breathe }] }]}>
        <Animated.View
          style={[
            heroStyles.gear,
            { backgroundColor: colors.backgroundElevated, borderColor: colors.border, transform: [{ rotate }] },
          ]}
        >
          <Ionicons name="settings" size={34} color={colors.accent} />
        </Animated.View>
        {SPARK_LAYOUT.map((s, i) => (
          <Spark key={i} layout={s} color={colors.accent} />
        ))}
      </Animated.View>
    </View>
  );
}

function Spark({
  layout,
  color,
}: {
  layout: { top?: number; left?: number; right?: number; bottom?: number; size: number; delay: number };
  color: string;
}) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.loop(
        Animated.timing(value, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
      ).start();
    }, layout.delay);
    return () => clearTimeout(timer);
  }, [value, layout.delay]);

  const opacity = value.interpolate({ inputRange: [0, 0.35, 0.7, 1], outputRange: [0, 1, 0.85, 0] });
  const translateY = value.interpolate({ inputRange: [0, 1], outputRange: [4, -12] });
  const scale = value.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0.5, 1, 0.6] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: layout.top,
        left: layout.left,
        right: layout.right,
        bottom: layout.bottom,
        opacity,
        transform: [{ translateY }, { scale }],
      }}
    >
      <Ionicons name="sparkles" size={layout.size} color={color} />
    </Animated.View>
  );
}

const heroStyles = StyleSheet.create({
  stage: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
  },
  badge: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbit: {
    position: 'absolute',
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  squircleBadge: {
    width: 92,
    height: 92,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phraseRail: {
    position: 'absolute',
    bottom: -34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phraseSrc: { fontFamily: fonts.sansSemiBold, fontSize: 14 },
  phraseArrow: { fontFamily: fonts.sansSemiBold, fontSize: 12 },
  phraseDst: { fontFamily: fonts.sansSemiBold, fontSize: 14 },
  gearWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gear: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function createStyles(colors: ThemeColors, typography: ThemeTypography) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    skip: {
      position: 'absolute',
      top: spacing.md,
      right: spacing.lg,
      zIndex: 5,
      padding: spacing.xs,
    },
    skipText: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.textMuted },
    track: { flex: 1 },
    slide: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
    },
    copy: { alignItems: 'center', marginTop: spacing.xl },
    eyebrow: { ...typography.eyebrow, marginBottom: spacing.sm },
    title: { ...typography.display, fontSize: 26, textAlign: 'center', marginBottom: spacing.sm },
    desc: { ...typography.bodyMuted, textAlign: 'center', maxWidth: 260 },
    nav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
    },
    dots: { flexDirection: 'row', gap: spacing.xs },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    dotActive: { width: 20, backgroundColor: colors.accent },
    nextBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm + 2,
      borderRadius: radius.pill,
    },
    nextBtnText: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.primaryText },
  });
}
