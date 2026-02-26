import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../constants/theme';
import { getCategoryColor } from '../../constants/mapCategories';
import CompatibilityBadge from '../ui/CompatibilityBadge';

interface Props {
  match: {
    beruf: { code: string; nameDe: string; field?: string; educationType?: string; durationYears?: number };
    matchPercentage: number;
    explanations?: string[];
  };
  onPress: () => void;
}

export default function BerufMatchCard({ match, onPress }: Props) {
  const explanations = match.explanations ?? [];
  const categoryColor = getCategoryColor(match.beruf.field);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.fieldBadge, { backgroundColor: categoryColor + '20' }]}>
            <Text style={[styles.fieldText, { color: categoryColor }]}>{match.beruf.field ?? 'Beruf'}</Text>
          </View>
          <CompatibilityBadge score={match.matchPercentage} size="sm" />
        </View>
        <Text style={styles.name}>{match.beruf.nameDe}</Text>
        {match.beruf.educationType && (
          <Text style={styles.meta}>{match.beruf.educationType} · {match.beruf.durationYears} Jahre</Text>
        )}
      </View>

      {explanations.length > 0 && (
        <View style={styles.explanations}>
          {explanations.map((exp, i) => (
            <Text key={i} style={styles.explanation}>{exp}</Text>
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: borderRadius.xl, marginHorizontal: spacing.md, marginBottom: spacing.md, padding: spacing.md, ...shadows.card },
  header: {},
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  fieldBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  fieldText: { fontSize: typography.caption, fontWeight: fontWeights.semiBold },
  name: { fontSize: typography.h4, fontWeight: fontWeights.bold, color: colors.text, marginBottom: 4 },
  meta: { fontSize: typography.bodySmall, color: colors.textSecondary },
  explanations: { marginTop: spacing.md, gap: spacing.xs },
  explanation: { fontSize: typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },
});
