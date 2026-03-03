import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  FadeIn,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { CULTURE_DIMENSIONS } from '@lehrstellen/shared';
import type { CultureScores } from '@lehrstellen/shared';
import api from '../../services/api';
import { colors, typography, fontWeights, spacing, borderRadius, shadows } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2;
const CARD_HEIGHT = 280;

/**
 * 8 "This or That" pairs — one per culture dimension.
 * Each has a contextual emoji + distinct gradient for the placeholder "image".
 * Swap gradient+emoji for <Image source={require('...')} /> later.
 */
const VIBE_PAIRS = [
  {
    key: 'hierarchyFocus' as const,
    optionA: { emoji: '🧑‍💻', label: 'Eigenstaendig', gradients: ['#FF8C42', '#FF5E1A'] as [string, string] },
    optionB: { emoji: '🏛️', label: 'Klari Hierarchie', gradients: ['#4A6CF7', '#2B47C7'] as [string, string] },
  },
  {
    key: 'punctualityRigidity' as const,
    optionA: { emoji: '🏄', label: 'Flexibel', gradients: ['#00D2A0', '#00A67D'] as [string, string] },
    optionB: { emoji: '⏰', label: 'Puenktlich', gradients: ['#A855F7', '#7C3AED'] as [string, string] },
  },
  {
    key: 'resilienceGrit' as const,
    optionA: { emoji: '🎨', label: 'Abwechslig', gradients: ['#F97316', '#EA580C'] as [string, string] },
    optionB: { emoji: '💪', label: 'Routine', gradients: ['#6366F1', '#4F46E5'] as [string, string] },
  },
  {
    key: 'socialEnvironment' as const,
    optionA: { emoji: '🎧', label: 'Allei schaffe', gradients: ['#8B5CF6', '#6D28D9'] as [string, string] },
    optionB: { emoji: '👥', label: 'Teamwork', gradients: ['#F59E0B', '#D97706'] as [string, string] },
  },
  {
    key: 'errorCulture' as const,
    optionA: { emoji: '🧪', label: 'Uusprobiere', gradients: ['#10B981', '#059669'] as [string, string] },
    optionB: { emoji: '🎯', label: 'Praezision', gradients: ['#EF4444', '#DC2626'] as [string, string] },
  },
  {
    key: 'clientFacing' as const,
    optionA: { emoji: '🖥️', label: 'Back-office', gradients: ['#3B82F6', '#2563EB'] as [string, string] },
    optionB: { emoji: '🤝', label: 'Kundekontakt', gradients: ['#EC4899', '#DB2777'] as [string, string] },
  },
  {
    key: 'digitalAffinity' as const,
    optionA: { emoji: '🔧', label: 'Handarbeit', gradients: ['#B45309', '#92400E'] as [string, string] },
    optionB: { emoji: '💻', label: 'Digital', gradients: ['#06B6D4', '#0891B2'] as [string, string] },
  },
  {
    key: 'prideFocus' as const,
    optionA: { emoji: '⚡', label: 'Schnell', gradients: ['#EAB308', '#CA8A04'] as [string, string] },
    optionB: { emoji: '⭐', label: 'Qualitaet', gradients: ['#7C3AED', '#6D28D9'] as [string, string] },
  },
];

export default function VibeCheckScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Animated values for card press
  const scaleA = useSharedValue(1);
  const scaleB = useSharedValue(1);
  const progressWidth = useSharedValue(0);

  const pair = VIBE_PAIRS[currentIndex];

  const animatedScaleA = useAnimatedStyle(() => ({
    transform: [{ scale: scaleA.value }],
  }));

  const animatedScaleB = useAnimatedStyle(() => ({
    transform: [{ scale: scaleB.value }],
  }));

  const animatedProgress = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const advanceToNext = useCallback(() => {
    if (currentIndex + 1 < VIBE_PAIRS.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsTransitioning(false);
    } else {
      setIsComplete(true);
      setIsTransitioning(false);
    }
  }, [currentIndex]);

  const handleChoice = useCallback(
    (side: 'left' | 'right' | 'neutral') => {
      if (isTransitioning || isSubmitting) return;
      setIsTransitioning(true);

      const value = side === 'left' ? 20 : side === 'right' ? 80 : 50;

      // Haptic
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Pulse animation on chosen card
      if (side === 'left') {
        scaleA.value = withSequence(
          withSpring(1.08, { damping: 8, stiffness: 400 }),
          withSpring(1, { damping: 14, stiffness: 200 }),
        );
      } else if (side === 'right') {
        scaleB.value = withSequence(
          withSpring(1.08, { damping: 8, stiffness: 400 }),
          withSpring(1, { damping: 14, stiffness: 200 }),
        );
      }

      setScores((prev) => ({ ...prev, [pair.key]: value }));

      // Update progress bar
      const nextProgress = ((currentIndex + 1) / VIBE_PAIRS.length) * 100;
      progressWidth.value = withTiming(nextProgress, { duration: 300 });

      // Advance after brief delay
      setTimeout(() => {
        runOnJS(advanceToNext)();
      }, 400);
    },
    [isTransitioning, isSubmitting, pair, currentIndex, scaleA, scaleB, progressWidth, advanceToNext],
  );

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await api.put('/students/me', {
        cultureScores: scores as Partial<CultureScores>,
      });
      router.replace('/(onboarding)/fields');
    } catch (error: any) {
      Alert.alert(
        'Fehler',
        error.response?.data?.message || 'Vibe Check chonnt noed gspeicheret werde.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [scores, router]);

  // --- Completion screen ---
  if (isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.completeContainer}
        >
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={styles.completeTitle}>Top, mir hend din Vibe!</Text>
          <Text style={styles.completeSubtitle}>
            Jetzt choemmer dir die richtige Lehrstelle zeige.
          </Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.continueGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.continueText}>
                {isSubmitting ? 'Wird gspeicheret...' : 'Weiter'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // --- Main question screen ---
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.stepLabel}>
            {currentIndex + 1} / {VIBE_PAIRS.length}
          </Text>
          <Text style={styles.title}>Vibe Check</Text>
          <Text style={styles.subtitle}>
            Was passt besser zu dir? Tipp uf s'Bild wo dir besser gfallt.
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, animatedProgress]} />
        </View>

        {/* Cards */}
        <Animated.View
          key={`pair-${currentIndex}`}
          entering={SlideInRight.springify().damping(18).stiffness(200)}
          exiting={SlideOutLeft.duration(250)}
          style={styles.cardsRow}
        >
          {/* Option A (Left = score 20) */}
          <Animated.View style={[styles.cardWrapper, animatedScaleA]}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleChoice('left')}
              disabled={isTransitioning}
            >
              <LinearGradient
                colors={pair.optionA.gradients}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              >
                <Text style={styles.cardEmoji}>{pair.optionA.emoji}</Text>
                <Text style={styles.cardLabel}>{pair.optionA.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* VS divider */}
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* Option B (Right = score 80) */}
          <Animated.View style={[styles.cardWrapper, animatedScaleB]}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleChoice('right')}
              disabled={isTransitioning}
            >
              <LinearGradient
                colors={pair.optionB.gradients}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              >
                <Text style={styles.cardEmoji}>{pair.optionB.emoji}</Text>
                <Text style={styles.cardLabel}>{pair.optionB.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Neutral button */}
        <TouchableOpacity
          style={styles.neutralButton}
          onPress={() => handleChoice('neutral')}
          disabled={isTransitioning}
          activeOpacity={0.7}
        >
          <Text style={styles.neutralText}>Egal 🤷</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  stepLabel: {
    fontSize: typography.caption,
    fontWeight: fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: fontWeights.extraBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },

  // Progress
  progressTrack: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },

  // Cards
  cardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxHeight: CARD_HEIGHT + spacing.lg,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  cardEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  cardLabel: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.white,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },

  // VS divider
  vsContainer: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.extraBold,
    color: colors.textTertiary,
    letterSpacing: 1,
  },

  // Neutral
  neutralButton: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  neutralText: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.textSecondary,
  },

  // Completion
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  completeEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  completeTitle: {
    fontSize: typography.h1,
    fontWeight: fontWeights.extraBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  completeSubtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 24,
  },
  continueButton: {
    width: '100%',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  continueGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  continueText: {
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
});
