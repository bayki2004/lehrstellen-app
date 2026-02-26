import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius, fontWeights } from '../../constants/theme';
import { GAMIFICATION_CONFIG, QUIZ_BADGE_CONFIG } from '../../types/quiz.types';
import type { QuizGamificationState } from '../../types/quiz.types';

interface Props {
  gamification: QuizGamificationState;
}

export default function QuizGamificationBar({ gamification }: Props) {
  const { xp, level, earnedBadges } = gamification;
  const title = GAMIFICATION_CONFIG.levelTitles[Math.min(level - 1, GAMIFICATION_CONFIG.levelTitles.length - 1)];
  const levelIcon = GAMIFICATION_CONFIG.levelIcons[Math.min(level - 1, GAMIFICATION_CONFIG.levelIcons.length - 1)];

  // Progress to next level
  const thresholds = GAMIFICATION_CONFIG.levelThresholds;
  const maxLevel = thresholds.length;
  let progress = 1;
  if (level < maxLevel) {
    const currentThreshold = thresholds[level - 1];
    const nextThreshold = thresholds[level];
    const range = nextThreshold - currentThreshold;
    progress = range > 0 ? (xp - currentThreshold) / range : 1;
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.levelIcon}>{levelIcon}</Text>
        <Text style={styles.levelTitle}>{title}</Text>
        <Text style={styles.xp}>{xp} XP</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
      </View>
      {earnedBadges.length > 0 && (
        <View style={styles.badges}>
          {earnedBadges.map((badge) => (
            <View key={badge} style={styles.badge}>
              <Text style={styles.badgeIcon}>{QUIZ_BADGE_CONFIG[badge].icon}</Text>
              <Text style={styles.badgeLabel}>{QUIZ_BADGE_CONFIG[badge].label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  levelIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  levelTitle: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    flex: 1,
  },
  xp: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.bold,
    color: colors.quizXP,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  badges: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.quizBadge + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  badgeLabel: {
    fontSize: typography.tiny,
    color: colors.quizBadge,
    fontWeight: fontWeights.medium,
  },
});
