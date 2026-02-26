import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../constants/theme';
import { getCategoryColor } from '../../constants/mapCategories';
import type { Beruf } from '../../types/beruf.types';

interface Props {
  beruf: Beruf;
  onPress: () => void;
}

const RIASEC_KEYS = ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'] as const;
const RIASEC_SHORT = ['R', 'I', 'A', 'S', 'E', 'C'];
const RIASEC_COLORS: Record<string, string> = {
  realistic: '#607D8B',
  investigative: '#2196F3',
  artistic: '#9C27B0',
  social: '#4CAF50',
  enterprising: '#FF9800',
  conventional: '#795548',
};

export default function BerufRow({ beruf, onPress }: Props) {
  const categoryColor = getCategoryColor(beruf.field);

  // Get top 3 RIASEC dimensions sorted by score
  const topDimensions = beruf.personalityFit
    ? RIASEC_KEYS
        .map((key, idx) => ({
          key,
          label: RIASEC_SHORT[idx],
          score: beruf.personalityFit![key] ?? 0,
          color: RIASEC_COLORS[key],
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
    : [];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {beruf.nameDe}
        </Text>

        {/* Mini RIASEC bars */}
        {topDimensions.length > 0 && (
          <View style={styles.riasecRow}>
            {topDimensions.map((dim) => (
              <View key={dim.key} style={styles.riasecItem}>
                <Text style={[styles.riasecLabel, { color: dim.color }]}>{dim.label}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.round(dim.score * 100)}%`, backgroundColor: dim.color },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.metaRow}>
          {beruf.field ? (
            <View style={[styles.badge, { backgroundColor: categoryColor + '18' }]}>
              <Text style={[styles.badgeText, { color: categoryColor }]}>{beruf.field}</Text>
            </View>
          ) : null}
          {beruf.educationType ? (
            <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>{beruf.educationType}</Text>
            </View>
          ) : null}
          {beruf.durationYears ? (
            <Text style={styles.duration}>{beruf.durationYears} Jahre</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  riasecRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  riasecItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  riasecLabel: {
    fontSize: typography.tiny,
    fontWeight: fontWeights.bold,
    width: 14,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: typography.tiny,
    fontWeight: fontWeights.medium,
  },
  duration: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
});
