import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../constants/theme';
import { getCategoryColor } from '../../constants/mapCategories';
import type { ListingDTO } from '@lehrstellen/shared';

interface Props {
  listing: ListingDTO;
  onPress: () => void;
}

export default function LehrstelleRow({ listing, onPress }: Props) {
  const categoryColor = getCategoryColor(listing.field);
  // Create a lighter variant for the gradient
  const categoryColorLight = categoryColor + '99';
  const initial = (listing.companyName || '?')[0].toUpperCase();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <LinearGradient
        colors={[categoryColor, categoryColorLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatar}
      >
        <Text style={styles.avatarText}>{initial}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {listing.title}
        </Text>
        <Text style={styles.company} numberOfLines={1}>
          {listing.companyName}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.location} numberOfLines={1}>
            {listing.city}{listing.canton ? `, ${listing.canton}` : ''}
          </Text>
          {listing.field ? (
            <View style={[styles.fieldBadge, { backgroundColor: categoryColor + '18' }]}>
              <Text style={[styles.fieldBadgeText, { color: categoryColor }]}>
                {listing.field}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },
  company: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  location: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  fieldBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  fieldBadgeText: {
    fontSize: typography.tiny,
    fontWeight: fontWeights.medium,
  },
});
