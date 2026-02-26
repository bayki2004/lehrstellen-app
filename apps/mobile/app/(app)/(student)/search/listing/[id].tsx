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
import CommuteCard from '../../../../../components/feed/CommuteCard';
import InfoCardSection from '../../../../../components/feed/InfoCardSection';
import MatchCelebration from '../../../../../components/feed/MatchCelebration';
import { useListingDetail } from '../../../../../hooks/queries/useListingDetail';
import { useSwipe } from '../../../../../hooks/queries/useFeed';
import { useCommuteCalculation } from '../../../../../hooks/queries/useCommute';
import { useProfileBuilderStore } from '../../../../../stores/profileBuilder.store';
import {
  colors,
  typography,
  fontWeights,
  spacing,
  borderRadius,
  shadows,
} from '../../../../../constants/theme';

export default function SearchListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: listing, isLoading } = useListingDetail(id);
  const swipeMutation = useSwipe();

  const [matchInfo, setMatchInfo] = useState<{
    companyName: string;
    title: string;
    matchId?: string;
  } | null>(null);

  const studentCity = useProfileBuilderStore((s) => s.city);
  const studentCanton = useProfileBuilderStore((s) => s.canton);

  const studentOrigin =
    studentCity || studentCanton
      ? { city: studentCity, canton: studentCanton }
      : null;

  const workplaceDest = listing
    ? { city: listing.city, canton: listing.canton }
    : null;

  const schoolDest = listing ? { canton: listing.canton } : null;

  const { data: workplaceCommute, isLoading: isLoadingWorkplace } =
    useCommuteCalculation(studentOrigin, workplaceDest);

  const { data: schoolCommute, isLoading: isLoadingSchool } =
    useCommuteCalculation(studentOrigin, schoolDest);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.navBar}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.navBackText}>Zurück</Text>
          </Pressable>
          <Text style={styles.navTitle}>Details</Text>
          <View style={styles.navSpacer} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
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
      const result = await swipeMutation.mutateAsync({
        listingId: listing.id,
        direction: 'RIGHT',
      });
      if (result?.isMatch) {
        setMatchInfo({
          companyName: listing.companyName,
          title: listing.title,
          matchId: result.matchId,
        });
      } else {
        router.back();
      }
    } catch {
      Alert.alert('Fehler', 'Bewerbung konnte nicht gesendet werden.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        {/* Header Gradient */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.headerGradient}
        >
          <Text style={styles.watermarkInitial}>
            {(listing.companyName ?? '?').charAt(0)}
          </Text>
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
          </View>
        </View>

        {/* Position */}
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
                  Start:{' '}
                  {new Date(listing.startDate).toLocaleDateString('de-CH')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Beschreibung</Text>
          <Text style={styles.descriptionText}>{listing.description}</Text>
        </View>

        {/* Info Cards */}
        <InfoCardSection cards={listing.cards} />

        {/* Requirements */}
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

        {/* Commute Card */}
        <CommuteCard
          workplaceName={`${listing.companyName}, ${listing.city}`}
          schoolName={`Berufsschule ${listing.canton}`}
          workplaceCommute={workplaceCommute}
          schoolCommute={schoolCommute}
          isLoading={isLoadingWorkplace || isLoadingSchool}
        />

        {/* Action */}
        <View style={styles.actionSection}>
          <Pressable onPress={handleApply} style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Bewerben</Text>
          </Pressable>
        </View>
      </ScrollView>

      <MatchCelebration
        visible={!!matchInfo}
        companyName={matchInfo?.companyName ?? ''}
        listingTitle={matchInfo?.title ?? ''}
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
  center: {
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
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  watermarkInitial: {
    fontSize: 100,
    fontWeight: fontWeights.bold,
    color: 'rgba(255, 255, 255, 0.15)',
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
});
