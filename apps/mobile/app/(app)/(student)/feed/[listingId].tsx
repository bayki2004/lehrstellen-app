import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import ScoreRing from '../../../../components/ui/ScoreRing';
import CompatibilityBadge from '../../../../components/ui/CompatibilityBadge';
import MatchCelebration from '../../../../components/feed/MatchCelebration';
import CommuteCard from '../../../../components/feed/CommuteCard';
import InfoCardSection from '../../../../components/feed/InfoCardSection';
import { useSwipeFeed, useSwipe } from '../../../../hooks/queries/useFeed';
import { useListingDetail } from '../../../../hooks/queries/useListingDetail';
import { useCommuteCalculation } from '../../../../hooks/queries/useCommute';
import { useProfileBuilderStore } from '../../../../stores/profileBuilder.store';
import {
  colors,
  typography,
  fontWeights,
  spacing,
  borderRadius,
  shadows,
} from '../../../../constants/theme';

export default function ListingDetailScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const router = useRouter();
  const { data: cards = [] } = useSwipeFeed();
  const feedListing = cards.find((c) => c.id === listingId);
  const { data: apiListing, isLoading: isLoadingDetail } = useListingDetail(
    feedListing ? undefined : listingId,
  );
  const listing = feedListing ?? apiListing as any;
  const swipeMutation = useSwipe();

  const [matchInfo, setMatchInfo] = useState<{companyName: string; title: string; compatibilityScore?: number; matchId?: string} | null>(null);

  const studentCity = useProfileBuilderStore((s) => s.city);
  const studentCanton = useProfileBuilderStore((s) => s.canton);

  const studentOrigin = (studentCity || studentCanton)
    ? { city: studentCity, canton: studentCanton }
    : null;

  const workplaceDest = listing
    ? { city: listing.city, canton: listing.canton }
    : null;

  const schoolDest = listing
    ? { canton: listing.canton }
    : null;

  const { data: workplaceCommute, isLoading: isLoadingWorkplace } = useCommuteCalculation(
    studentOrigin,
    workplaceDest,
  );

  const { data: schoolCommute, isLoading: isLoadingSchool } = useCommuteCalculation(
    studentOrigin,
    schoolDest,
  );

  if (!listing) {
    if (isLoadingDetail) {
      return (
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.navBar}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text style={styles.navBackText}>Zurück</Text>
            </Pressable>
            <Text style={styles.navTitle}>Details</Text>
            <View style={styles.navSpacer} />
          </View>
          <View style={styles.notFound}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Lehrstelle nicht gefunden.</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Zurück</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleApply = async () => {
    try {
      const result = await swipeMutation.mutateAsync({ listingId: listing.id, direction: 'RIGHT' });
      if (result?.isMatch) {
        setMatchInfo({
          companyName: listing.companyName,
          title: listing.title,
          compatibilityScore: listing.compatibilityScore,
          matchId: result.matchId,
        });
      } else {
        router.back();
      }
    } catch {
      Alert.alert('Fehler', 'Bewerbung konnte nicht gesendet werden.');
    }
  };

  const handleReject = async () => {
    try {
      await swipeMutation.mutateAsync({ listingId: listing.id, direction: 'LEFT' });
      router.back();
    } catch {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Navigation bar */}
      <View style={styles.navBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.navBackText}>Zurück</Text>
        </Pressable>
        <Text style={styles.navTitle}>Details</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Header Gradient */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.headerGradient}
        >
          {/* Watermark initial */}
          <Text style={styles.watermarkInitial}>{(listing.companyName ?? '?').charAt(0)}</Text>
          {/* CompatibilityBadge at bottom-left */}
          <View style={styles.compatBadgePosition}>
            <CompatibilityBadge score={listing.compatibilityScore} size="md" />
          </View>
        </LinearGradient>

        {/* Company info card */}
        <View style={[styles.card, styles.headerCard]}>
          <View style={styles.headerRow}>
            <View style={styles.companyInfo}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.logoPlaceholder}
              >
                <Text style={styles.logoText}>
                  {(listing.companyName ?? '?').charAt(0)}
                </Text>
              </LinearGradient>
              <View style={styles.companyTextBlock}>
                <View style={styles.companyNameRow}>
                  <Text style={styles.companyName}>{listing.companyName}</Text>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedIcon}>{'✓'}</Text>
                  </View>
                </View>
                <Text style={styles.location}>
                  {listing.city}, {listing.canton}
                </Text>
              </View>
            </View>
            <ScoreRing score={listing.compatibilityScore} size={68} />
          </View>
        </View>

        {/* Section 2: Position */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Position</Text>
          <Text style={styles.positionTitle}>{listing.title}</Text>
          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{listing.field}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{listing.durationYears} Jahre</Text>
            </View>
            {listing.spotsAvailable > 0 && (
              <View style={[styles.tag, styles.tagHighlight]}>
                <Text style={[styles.tagText, styles.tagHighlightText]}>
                  {listing.spotsAvailable}{' '}
                  {listing.spotsAvailable === 1 ? 'Platz' : 'Plätze'}
                </Text>
              </View>
            )}
            {listing.startDate && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>
                  Start: {new Date(listing.startDate).toLocaleDateString('de-CH')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Section 3: Description */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Beschreibung</Text>
          <Text style={styles.descriptionText}>{listing.description}</Text>
        </View>

        {/* Info Cards */}
        <InfoCardSection cards={listing.cards} />

        {/* Section 4: Requirements */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Anforderungen</Text>
          {listing.requiredSchoolLevel && (
            <View style={styles.requirementRow}>
              <Text style={styles.requirementLabel}>Schulniveau</Text>
              <Text style={styles.requirementValue}>
                {listing.requiredSchoolLevel}
              </Text>
            </View>
          )}
          {listing.requiredLanguages && listing.requiredLanguages.length > 0 && (
            <View style={styles.requirementRow}>
              <Text style={styles.requirementLabel}>Sprachen</Text>
              <Text style={styles.requirementValue}>
                {listing.requiredLanguages.join(', ')}
              </Text>
            </View>
          )}
          {!listing.requiredSchoolLevel &&
            (!listing.requiredLanguages ||
              listing.requiredLanguages.length === 0) && (
              <Text style={styles.noDataText}>
                Keine spezifischen Anforderungen angegeben.
              </Text>
            )}
        </View>

        {/* Section 5: Score Breakdown */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Kompatibilität</Text>
          {(listing.scoreBreakdown ?? []).map((item: { label: string; score: number }) => (
            <View key={item.label} style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>{item.label}</Text>
              <View style={styles.breakdownBar}>
                <View
                  style={[styles.breakdownFill, { width: `${item.score}%` }]}
                />
              </View>
              <Text style={styles.breakdownScore}>{item.score}%</Text>
            </View>
          ))}
        </View>

        {/* Section 6: Commute Card */}
        <CommuteCard
          workplaceName={listing ? `${listing.companyName}, ${listing.city}` : 'Arbeitsort'}
          schoolName={listing ? `Berufsschule ${listing.canton}` : 'Berufsschule'}
          workplaceCommute={workplaceCommute}
          schoolCommute={schoolCommute}
          isLoading={isLoadingWorkplace || isLoadingSchool}
        />

        {/* Section 7: Actions */}
        <View style={styles.actionSection}>
          <Pressable onPress={handleApply} style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Bewerben</Text>
          </Pressable>
          <Pressable onPress={handleReject} style={styles.rejectButton}>
            <Text style={styles.rejectButtonText}>Nicht interessiert</Text>
          </Pressable>
        </View>
      </ScrollView>

      <MatchCelebration
        visible={!!matchInfo}
        companyName={matchInfo?.companyName ?? ''}
        listingTitle={matchInfo?.title ?? ''}
        compatibilityScore={matchInfo?.compatibilityScore}
        onPrepareBewerbung={() => {
          if (matchInfo?.matchId) {
            const id = matchInfo.matchId;
            setMatchInfo(null);
            router.push(`/(app)/(student)/bewerbungen/prepare/${id}` as any);
          }
        }}
        onDismiss={() => {
          setMatchInfo(null);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  notFoundText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  backLink: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  backLinkText: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.primary,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  navBackText: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.primary,
  },
  navTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  navSpacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerGradient: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkInitial: {
    fontSize: 100,
    fontWeight: fontWeights.bold,
    color: 'rgba(255, 255, 255, 0.15)',
  },
  compatBadgePosition: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    ...shadows.card,
  },
  headerCard: {
    paddingBottom: spacing.lg,
    marginTop: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  logoPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  logoText: {
    fontSize: typography.h2,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
  companyTextBlock: {
    flex: 1,
  },
  companyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  companyName: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.text,
    flexShrink: 1,
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.superLike,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedIcon: {
    fontSize: 12,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
  location: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  positionTitle: {
    fontSize: typography.h2,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.borderLight,
  },
  tagText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
  },
  tagHighlight: {
    backgroundColor: `${colors.success}20`,
  },
  tagHighlightText: {
    color: colors.success,
  },
  descriptionText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  requirementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  requirementLabel: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
  },
  requirementValue: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },
  noDataText: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  breakdownLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    width: 100,
  },
  breakdownBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  breakdownScore: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semiBold,
    color: colors.textSecondary,
    width: 38,
    textAlign: 'right',
  },
  actionSection: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginHorizontal: spacing.md,
  },
  applyButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    minHeight: 52,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  applyButtonText: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
  rejectButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    minHeight: 52,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  rejectButtonText: {
    fontSize: typography.h4,
    fontWeight: fontWeights.semiBold,
    color: colors.textSecondary,
  },
});
