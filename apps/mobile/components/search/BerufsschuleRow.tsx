import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../constants/theme';
import type { Berufsschule } from '../../types/beruf.types';

interface Props {
  school: Berufsschule;
  onPress: () => void;
}

export default function BerufsschuleRow({ school, onPress }: Props) {
  const programCount = school.specializations?.length ?? 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>S</Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.name} numberOfLines={1}>
            {school.name}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            {school.city}, {school.canton}
          </Text>
        </View>
        {programCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{programCount}</Text>
          </View>
        )}
      </View>

      {school.specializations && school.specializations.length > 0 && (
        <View style={styles.tagsRow}>
          {school.specializations.map((spec, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>
                {spec}
              </Text>
            </View>
          ))}
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.warning,
  },
  headerContent: {
    flex: 1,
  },
  name: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },
  location: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: colors.primary + '18',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  countText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: typography.tiny,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
});
