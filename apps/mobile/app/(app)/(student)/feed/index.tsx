import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import SwipeDeck from '../../../../components/swipe/SwipeDeck';
import FilterSheet, {
  DEFAULT_FILTERS,
  type FeedFilters,
} from '../../../../components/feed/FilterSheet';
import { useSwipeFeed } from '../../../../hooks/queries/useFeed';
import { useFavoriteBerufe } from '../../../../hooks/queries/useFavoriteBerufe';
import {
  colors,
  typography,
  fontWeights,
  spacing,
  borderRadius,
  shadows,
} from '../../../../constants/theme';

export default function FeedScreen() {
  const router = useRouter();
  const { data: cards = [], isLoading, error, refetch } = useSwipeFeed();
  const { data: favoriteBerufe = [] } = useFavoriteBerufe();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedMode, setFeedMode] = useState<'matching' | 'explore'>('matching');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState<FeedFilters>(DEFAULT_FILTERS);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.cantons.length > 0) count += filters.cantons.length;
    if (filters.fields.length > 0) count += filters.fields.length;
    if (filters.educationType !== 'Alle') count += 1;
    if (filters.minCompatibility > 0) count += 1;
    return count;
  }, [filters]);

  // Detect whether the quiz has been completed by checking if any card has a
  // non-zero compatibility score.  When the quiz is not completed the API
  // returns 0 for every card.
  const quizCompleted = useMemo(
    () => cards.some((c) => c.compatibilityScore > 0),
    [cards],
  );

  const visibleCards = useMemo(() => {
    let filtered = cards.slice(currentIndex);

    // Apply feed-mode filter (matching vs explore)
    if (quizCompleted) {
      if (feedMode === 'matching') {
        filtered = filtered.filter((c) => c.compatibilityScore >= 80);
      } else {
        filtered = filtered.filter((c) => c.compatibilityScore < 80);
      }
    }
    // When quiz is not completed: "matching" tab will show a message (handled
    // in JSX), while "explore" tab shows all cards — no filtering needed here.

    if (filters.cantons.length > 0) {
      filtered = filtered.filter((c) => filters.cantons.includes(c.canton));
    }
    if (filters.fields.length > 0) {
      filtered = filtered.filter((c) => filters.fields.includes(c.field));
    }
    if (filters.educationType !== 'Alle') {
      filtered = filtered.filter((c) =>
        c.requiredSchoolLevel
          ? c.requiredSchoolLevel
              .toLowerCase()
              .includes(filters.educationType.toLowerCase())
          : true,
      );
    }
    if (filters.minCompatibility > 0) {
      filtered = filtered.filter(
        (c) => c.compatibilityScore >= filters.minCompatibility,
      );
    }

    return filtered;
  }, [cards, currentIndex, filters, feedMode, quizCompleted]);

  const handleApplyFilters = useCallback((newFilters: FeedFilters) => {
    setFilters(newFilters);
    setFilterVisible(false);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header: matches SwiftUI DiscoveryFeedView navigation bar */}
      <View style={styles.header}>
        <Pressable
          style={styles.headerButton}
          onPress={() => router.push('/(app)/(student)/map/')}
        >
          <Ionicons name="map-outline" size={18} color={colors.textSecondary} />
        </Pressable>

        <Text style={styles.headerTitle}>Entdecken</Text>

        <Pressable
          style={styles.headerButton}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="options-outline" size={18} color={colors.textSecondary} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Feed mode toggle */}
      <View style={styles.toggleContainer}>
        <Pressable
          style={[
            styles.toggleSegment,
            feedMode === 'matching' && styles.toggleSegmentActive,
          ]}
          onPress={() => setFeedMode('matching')}
        >
          <Text
            style={[
              styles.toggleText,
              feedMode === 'matching' && styles.toggleTextActive,
            ]}
          >
            Matching
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.toggleSegment,
            feedMode === 'explore' && styles.toggleSegmentActive,
          ]}
          onPress={() => setFeedMode('explore')}
        >
          <Text
            style={[
              styles.toggleText,
              feedMode === 'explore' && styles.toggleTextActive,
            ]}
          >
            Entdecken
          </Text>
        </Pressable>
      </View>

      <View style={styles.deckContainer}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Lehrstellen werden geladen...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.errorText}>{error?.message ?? 'Feed konnte nicht geladen werden'}</Text>
            <Text style={styles.retryText} onPress={() => refetch()}>
              Erneut versuchen
            </Text>
          </View>
        ) : !quizCompleted && feedMode === 'matching' ? (
          <View style={styles.center}>
            <Ionicons name="sparkles-outline" size={48} color={colors.primary} />
            <Text style={styles.quizPromptText}>
              Absolviere den Persönlichkeitstest für personalisierte Matches
            </Text>
          </View>
        ) : (
          <SwipeDeck
            cards={visibleCards}
            onCardSwiped={() => setCurrentIndex((i) => i + 1)}
            favoriteBerufe={favoriteBerufe}
          />
        )}
      </View>

      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterBadgeText: {
    fontSize: 9,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.secondaryBackground,
    borderRadius: borderRadius.full,
    padding: 2,
  },
  toggleSegment: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  toggleSegmentActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.white,
    fontWeight: fontWeights.semiBold,
  },
  deckContainer: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl + spacing.sm,
  },
  loadingText: {
    marginTop: spacing.sm + 4,
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  retryText: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.primary,
  },
  quizPromptText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    lineHeight: 22,
  },
});
