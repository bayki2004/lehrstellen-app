import React from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ListingWithScoreDTO } from '@lehrstellen/shared';
import CompatibilityBadge from '../ui/CompatibilityBadge';
import { getCategoryColor } from '../../constants/mapCategories';
import { useCommuteCalculation } from '../../hooks/queries/useCommute';
import { useProfileBuilderStore } from '../../stores/profileBuilder.store';
import {
  colors,
  fontWeights,
  borderRadius,
  shadows,
  cardDimensions,
  spacing,
} from '../../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SwipeCardProps {
  listing: ListingWithScoreDTO;
  onPress?: () => void;
  favoriteBerufe?: string[];
}

export default function SwipeCard({ listing, onPress, favoriteBerufe }: SwipeCardProps) {
  const isFavoriteBeruf =
    !!(listing as any).berufCode &&
    !!favoriteBerufe &&
    favoriteBerufe.includes((listing as any).berufCode);
  const categoryColor = getCategoryColor(listing.field) || colors.primary;
  const companyInitial = (listing.companyName || '?').charAt(0).toUpperCase();

  const studentCity = useProfileBuilderStore((s) => s.city);
  const studentCanton = useProfileBuilderStore((s) => s.canton);
  const studentOrigin = (studentCity || studentCanton)
    ? { city: studentCity, canton: studentCanton }
    : null;
  const { data: commute } = useCommuteCalculation(
    studentOrigin,
    { city: listing.city, canton: listing.canton },
  );

  return (
    <Pressable onPress={onPress} style={styles.cardContainer}>
      <View style={styles.card}>
      {/* Placeholder gradient background (matches SwiftUI placeholderGradient) */}
      <LinearGradient
        colors={[categoryColor + '99', categoryColor + 'E6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Large company initial watermark */}
      <View style={styles.initialContainer}>
        <Text style={styles.initialText}>{companyInitial}</Text>
      </View>

      {/* 4-stop gradient overlay for text readability (matches SwiftUI) */}
      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
        locations={[0, 0.35, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Favorite heart overlay */}
      {isFavoriteBeruf && (
        <View style={styles.favoriteHeart}>
          <Ionicons name="heart" size={20} color="#FF3B5C" />
        </View>
      )}

      {/* Content — bottom aligned (matches SwiftUI cardContent) */}
      <View style={styles.content}>
        {/* Badge row: compatibility left, premium/verified right */}
        <View style={styles.badgeRow}>
          <CompatibilityBadge score={listing.compatibilityScore} size="md" />
          <View style={styles.statusIcons}>
            {listing.spotsAvailable > 2 && (
              <Ionicons name="star" size={14} color="#FFD700" />
            )}
          </View>
        </View>

        <Text style={styles.companyName}>{listing.companyName}</Text>
        <Text style={styles.title}>{listing.title}</Text>

        {/* Location row with icons (matches SwiftUI HStack) */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.8)" />
          <Text style={styles.locationText}>
            {listing.city}, {listing.canton}
          </Text>
          {commute && (
            <>
              <Ionicons name="train-outline" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.locationText}>{commute.transitMinutes} min</Text>
            </>
          )}
          <Ionicons name="school-outline" size={13} color="rgba(255,255,255,0.8)" />
          <Text style={styles.locationText}>{listing.field}</Text>
        </View>

        {/* Culture tags (matches SwiftUI capsule tags) */}
        <View style={styles.tags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{listing.field}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{listing.durationYears} Jahre</Text>
          </View>
          {listing.spotsAvailable > 1 && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {listing.spotsAvailable} Plätze
              </Text>
            </View>
          )}
        </View>
      </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: SCREEN_WIDTH - 32,
    height: Math.min(cardDimensions.height, SCREEN_HEIGHT * 0.55),
    ...shadows.elevated,
  },
  card: {
    flex: 1,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  initialContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    fontSize: 120,
    fontWeight: fontWeights.bold,
    color: 'rgba(255,255,255,0.2)',
  },
  favoriteHeart: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...shadows.sm,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  premiumIcon: {
    fontSize: 16,
  },
  companyName: {
    fontSize: 20,
    fontWeight: fontWeights.bold,
    color: colors.white,
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: fontWeights.medium,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm + 4,
  },
  locationIcon: {
    fontSize: 12,
  },
  locationText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginRight: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tagText: {
    fontSize: 12,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
});
