import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import RadarChart from '../charts/RadarChart';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../constants/theme';
import { GAMIFICATION_CONFIG, QUIZ_BADGE_CONFIG, topThreeCodes } from '../../types/quiz.types';
import type { HollandCodes, QuizGamificationState } from '../../types/quiz.types';

const RIASEC_LABELS = ['Realistisch', 'Forschend', 'Künstlerisch', 'Sozial', 'Unternehmerisch', 'Konventionell'];

interface Props {
  hollandCodes: HollandCodes;
  gamification: QuizGamificationState;
}

export default function PersonalityRevealView({ hollandCodes, gamification }: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    scale.value = withDelay(300, withTiming(1, { duration: 600 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const values = [
    hollandCodes.realistic,
    hollandCodes.investigative,
    hollandCodes.artistic,
    hollandCodes.social,
    hollandCodes.enterprising,
    hollandCodes.conventional,
  ];

  const top3 = topThreeCodes(hollandCodes);
  const levelTitle = GAMIFICATION_CONFIG.levelTitles[Math.min(gamification.level - 1, 2)];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dein Persönlichkeitsprofil</Text>
      <Text style={styles.subtitle}>Basierend auf deinem «Build Your Day»</Text>

      <Animated.View style={[styles.chartContainer, animatedStyle]}>
        <RadarChart values={values} labels={RIASEC_LABELS} size={280} />
      </Animated.View>

      <View style={styles.codeRow}>
        {top3.map((code, i) => (
          <View key={code} style={[styles.codeBadge, i === 0 && styles.codeBadgePrimary]}>
            <Text style={[styles.codeText, i === 0 && styles.codeTextPrimary]}>{code}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.codeLabel}>Dein Holland-Code: {top3.join('')}</Text>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>{levelTitle}</Text>
        <Text style={styles.statsXP}>{gamification.xp} XP gesammelt</Text>
        {gamification.speedBonusCount > 0 && (
          <Text style={styles.statsBonus}>{gamification.speedBonusCount}x Speed-Bonus</Text>
        )}
        <View style={styles.badgesRow}>
          {gamification.earnedBadges.map((badge) => (
            <View key={badge} style={styles.earnedBadge}>
              <Text style={styles.earnedBadgeIcon}>{QUIZ_BADGE_CONFIG[badge].icon}</Text>
              <Text style={styles.earnedBadgeLabel}>{QUIZ_BADGE_CONFIG[badge].label}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  title: {
    fontSize: typography.h2,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginTop: spacing.lg,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  chartContainer: {
    marginBottom: spacing.lg,
  },
  codeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  codeBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBadgePrimary: {
    backgroundColor: colors.primary,
  },
  codeText: {
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
    color: colors.textSecondary,
  },
  codeTextPrimary: {
    color: colors.white,
  },
  codeLabel: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
    marginBottom: spacing.xl,
  },
  statsCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  statsTitle: {
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statsXP: {
    fontSize: typography.body,
    color: colors.quizXP,
    fontWeight: fontWeights.semiBold,
    marginBottom: spacing.xs,
  },
  statsBonus: {
    fontSize: typography.bodySmall,
    color: colors.success,
    marginBottom: spacing.md,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  earnedBadge: {
    alignItems: 'center',
    gap: 4,
  },
  earnedBadgeIcon: {
    fontSize: 28,
  },
  earnedBadgeLabel: {
    fontSize: typography.tiny,
    color: colors.textSecondary,
  },
});
