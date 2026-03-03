import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StudentGradeDTO, MulticheckGrades } from '@lehrstellen/shared';
import { getZeugnisSubjects } from '@lehrstellen/shared';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../constants/theme';

interface Props {
  grade: StudentGradeDTO;
  onDelete?: () => void;
}

export default function GradeCard({ grade, onDelete }: Props) {
  const isZeugnis = grade.documentType === 'zeugnis';

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.badge, isZeugnis ? styles.badgeZeugnis : styles.badgeMulticheck]}>
          <Text style={styles.badgeText}>
            {isZeugnis ? '📄 Zeugnis' : '📊 ' + (grade.testVariant ?? 'Multicheck')}
          </Text>
        </View>
        {onDelete && (
          <Pressable onPress={onDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </Pressable>
        )}
      </View>

      {/* Metadata */}
      <View style={styles.meta}>
        {isZeugnis ? (
          <Text style={styles.metaText}>
            {grade.canton && `Kanton ${grade.canton}`}
            {grade.niveau && ` · ${grade.niveau}`}
            {grade.semester && ` · ${grade.semester}. Semester`}
            {grade.schoolYear && ` · ${grade.schoolYear}`}
          </Text>
        ) : (
          <Text style={styles.metaText}>
            {grade.testVariant}
            {grade.testDate && ` · ${new Date(grade.testDate).toLocaleDateString('de-CH')}`}
          </Text>
        )}
      </View>

      {/* Grades content */}
      {isZeugnis ? (
        <ZeugnisContent grades={grade.grades as Record<string, number>} canton={grade.canton} />
      ) : (
        <MulticheckContent grades={grade.grades as MulticheckGrades} />
      )}

      {/* Verification badge */}
      {grade.isVerified && grade.verifiedAt && (
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
          <Text style={styles.verifiedText}>
            Sälber bestätigt am {new Date(grade.verifiedAt).toLocaleDateString('de-CH')}
          </Text>
        </View>
      )}
    </View>
  );
}

function ZeugnisContent({ grades, canton }: { grades: Record<string, number>; canton?: string }) {
  const subjects = getZeugnisSubjects(canton ?? 'DEFAULT');

  // Show subjects that have grades, plus any extra keys not in the template
  const displayEntries: { label: string; value: number }[] = [];
  const knownKeys = new Set(subjects.map((s) => s.key));

  for (const subject of subjects) {
    if (grades[subject.key] != null) {
      displayEntries.push({ label: subject.label, value: grades[subject.key] });
    }
  }
  for (const [key, value] of Object.entries(grades)) {
    if (!knownKeys.has(key) && value != null) {
      displayEntries.push({ label: key.replace(/_/g, ' '), value });
    }
  }

  return (
    <View style={styles.gradeTable}>
      {displayEntries.map((entry) => (
        <View key={entry.label} style={styles.gradeRow}>
          <Text style={styles.gradeLabel} numberOfLines={1}>{entry.label}</Text>
          <Text style={[styles.gradeValue, getGradeColor(entry.value)]}>{entry.value}</Text>
        </View>
      ))}
    </View>
  );
}

function MulticheckContent({ grades }: { grades: MulticheckGrades }) {
  const renderSection = (title: string, data: Record<string, number | undefined>) => {
    const entries = Object.entries(data).filter(([, v]) => v != null);
    if (entries.length === 0) return null;

    return (
      <View style={styles.multicheckSection}>
        <Text style={styles.multicheckSectionTitle}>{title}</Text>
        {entries.map(([key, value]) => (
          <View key={key} style={styles.gradeRow}>
            <Text style={styles.gradeLabel} numberOfLines={1}>
              {key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}
            </Text>
            <View style={styles.percentBar}>
              <View style={[styles.percentFill, { width: `${value}%` as any }]} />
            </View>
            <Text style={styles.percentValue}>{value}%</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View>
      {renderSection('Schulisches Wissen', grades.schulisches_wissen ?? {})}
      {renderSection('Potenzial', grades.potenzial ?? {})}
    </View>
  );
}

function getGradeColor(grade: number) {
  if (grade >= 5) return { color: colors.success };
  if (grade >= 4) return { color: colors.warning };
  return { color: colors.error };
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  badgeZeugnis: {
    backgroundColor: colors.primary + '15',
  },
  badgeMulticheck: {
    backgroundColor: colors.accent + '15',
  },
  badgeText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  meta: {
    marginBottom: spacing.sm,
  },
  metaText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  gradeTable: {
    gap: 2,
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 1,
  },
  gradeLabel: {
    flex: 1,
    fontSize: typography.bodySmall,
    color: colors.text,
  },
  gradeValue: {
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
    minWidth: 32,
    textAlign: 'right',
  },
  multicheckSection: {
    marginBottom: spacing.sm,
  },
  multicheckSectionTitle: {
    fontSize: typography.caption,
    fontWeight: fontWeights.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  percentBar: {
    width: 80,
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  percentFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  percentValue: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.bold,
    color: colors.text,
    minWidth: 36,
    textAlign: 'right',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  verifiedText: {
    fontSize: typography.caption,
    color: colors.success,
  },
});
