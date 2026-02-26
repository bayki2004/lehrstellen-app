import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator, Share, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { useBewerbungen, useDismissMatch } from '../../../../hooks/queries/useBewerbungen';
import BewerbungCard from '../../../../components/bewerbungen/BewerbungCard';
import CompatibilityBadge from '../../../../components/ui/CompatibilityBadge';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../../../constants/theme';
import type { BewerbungSegment, UnifiedBewerbungItem } from '../../../../types/bewerbung.types';

const SEGMENTS: { key: BewerbungSegment; label: string }[] = [
  { key: 'offen', label: 'Offen' },
  { key: 'gesendet', label: 'Gesendet' },
  { key: 'erledigt', label: 'Erledigt' },
];

const EMPTY_STATES: Record<BewerbungSegment, { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string }> = {
  offen: {
    icon: 'heart-outline',
    title: 'Noch keine Matches',
    subtitle: 'Swipe nach rechts, um Lehrstellen zu entdecken!',
  },
  gesendet: {
    icon: 'paper-plane-outline',
    title: 'Keine laufenden Bewerbungen',
    subtitle: 'Bewirb dich bei offenen Matches, um hier Bewerbungen zu sehen.',
  },
  erledigt: {
    icon: 'checkmark-done-outline',
    title: 'Noch keine abgeschlossenen Bewerbungen',
    subtitle: 'Abgeschlossene Bewerbungen erscheinen hier.',
  },
};

// Map API application status to the BewerbungCard's expected status format
function mapApplicationStatus(apiStatus?: string): string {
  if (!apiStatus) return 'sent';
  const mapping: Record<string, string> = {
    PENDING: 'sent',
    VIEWED: 'viewed',
    SHORTLISTED: 'viewed',
    INTERVIEW_SCHEDULED: 'interview_invited',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    WITHDRAWN: 'withdrawn',
  };
  return mapping[apiStatus] ?? 'sent';
}

export default function BewerbungenListScreen() {
  const { data: bewerbungen = [], isLoading, error, refetch } = useBewerbungen();
  const dismissMutation = useDismissMatch();
  const [activeSegment, setActiveSegment] = useState<BewerbungSegment>('offen');

  const data = useMemo(
    () => bewerbungen.filter((b) => b.segment === activeSegment),
    [bewerbungen, activeSegment],
  );
  const emptyState = EMPTY_STATES[activeSegment];

  const handleSegmentPress = useCallback((key: BewerbungSegment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveSegment(key);
  }, []);

  const handlePrepareBewerbung = useCallback((matchId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/(app)/(student)/bewerbungen/prepare/${matchId}`);
  }, []);

  const handleDismiss = useCallback((matchId: string) => {
    Alert.alert(
      'Match löschen?',
      'Dieses Match wird unwiderruflich entfernt.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            dismissMutation.mutate(matchId);
          },
        },
      ],
    );
  }, [dismissMutation]);

  const handleShare = useCallback(async (item: UnifiedBewerbungItem) => {
    const title = item.listing?.title ?? 'Lehrstelle';
    const company = item.listing?.companyName ?? '';
    const city = item.listing?.city ?? '';
    const message = `Schau dir diese Lehrstelle an: ${title}${company ? ` bei ${company}` : ''}${city ? ` in ${city}` : ''}`;
    try {
      await Share.share({ message });
    } catch {
      // User cancelled share
    }
  }, []);

  const renderItem = useCallback(({ item }: { item: UnifiedBewerbungItem }) => {
    if (item.segment === 'offen') {
      return (
        <OffenCard
          item={item}
          onPrepare={handlePrepareBewerbung}
          onDismiss={handleDismiss}
          onShare={handleShare}
        />
      );
    }

    // For gesendet/erledigt, render the existing BewerbungCard
    const bewerbung = {
      id: item.applicationId ?? item.matchId,
      studentId: item.studentId,
      listingId: item.listingId,
      status: mapApplicationStatus(item.applicationStatus) as any,
      sentAt: item.updatedAt ?? item.createdAt,
      companyName: item.listing.companyName,
      berufTitle: item.listing.title,
      companyLogoUrl: item.listing.companyLogo,
      canton: item.listing.canton,
      city: item.listing.city,
    };

    return (
      <BewerbungCard
        bewerbung={bewerbung}
        onPress={() => {
          if (item.applicationId) {
            router.push(`/bewerbungen/${item.applicationId}`);
          }
        }}
      />
    );
  }, [handlePrepareBewerbung, handleDismiss, handleShare]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Segment Picker */}
      <View style={styles.segmentedControlWrapper}>
        <View style={styles.segmentedControl}>
          {SEGMENTS.map((seg) => (
            <Pressable
              key={seg.key}
              style={[styles.segment, activeSegment === seg.key && styles.segmentActive]}
              onPress={() => handleSegmentPress(seg.key)}
            >
              <Text style={[styles.segmentText, activeSegment === seg.key && styles.segmentTextActive]}>
                {seg.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {isLoading && data.length === 0 ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} size="large" />
      ) : error && data.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{error?.message ?? 'Bewerbungen konnten nicht geladen werden'}</Text>
        </View>
      ) : data.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name={emptyState.icon} size={60} color={colors.textTertiary} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>{emptyState.title}</Text>
          <Text style={styles.emptySubtitle}>{emptyState.subtitle}</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.applicationId ?? item.matchId}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} tintColor={colors.primary} />
          }
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

// ============================================
// Offen Match Card (with swipe-to-delete & swipe-to-share)
// ============================================

const SWIPE_ACTION_WIDTH = 80;

function OffenCard({
  item,
  onPrepare,
  onDismiss,
  onShare,
}: {
  item: UnifiedBewerbungItem;
  onPrepare: (matchId: string) => void;
  onDismiss: (matchId: string) => void;
  onShare: (item: UnifiedBewerbungItem) => void;
}) {
  const swipeableRef = useRef<Swipeable>(null);
  const initial = (item.listing?.companyName || '?').charAt(0).toUpperCase();

  // Swipe RIGHT → share action (renderLeftActions)
  const renderLeftActions = useCallback(
    (_progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
      const scale = dragX.interpolate({
        inputRange: [0, SWIPE_ACTION_WIDTH],
        outputRange: [0.5, 1],
        extrapolate: 'clamp',
      });
      return (
        <RectButton
          style={styles.swipeActionShare}
          onPress={() => {
            swipeableRef.current?.close();
            onShare(item);
          }}
        >
          <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
            <Ionicons name="share-outline" size={24} color={colors.white} />
            <Text style={styles.swipeActionText}>Teilen</Text>
          </Animated.View>
        </RectButton>
      );
    },
    [item, onShare],
  );

  // Swipe LEFT → delete action (renderRightActions)
  const renderRightActions = useCallback(
    (_progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
      const scale = dragX.interpolate({
        inputRange: [-SWIPE_ACTION_WIDTH, 0],
        outputRange: [1, 0.5],
        extrapolate: 'clamp',
      });
      return (
        <RectButton
          style={styles.swipeActionDelete}
          onPress={() => {
            swipeableRef.current?.close();
            onDismiss(item.matchId);
          }}
        >
          <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
            <Ionicons name="trash-outline" size={24} color={colors.white} />
            <Text style={styles.swipeActionText}>Löschen</Text>
          </Animated.View>
        </RectButton>
      );
    },
    [item.matchId, onDismiss],
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      leftThreshold={SWIPE_ACTION_WIDTH}
      rightThreshold={SWIPE_ACTION_WIDTH}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
    >
      <Pressable style={styles.offenCard} onPress={() => onPrepare(item.matchId)}>
        <View style={styles.offenCardTop}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </LinearGradient>
          <View style={styles.offenInfo}>
            <Text style={styles.offenCompany} numberOfLines={1}>{item.listing?.companyName ?? 'Unbekannt'}</Text>
            <Text style={styles.offenTitle} numberOfLines={1}>{item.listing?.title ?? 'Lehrstelle'}</Text>
            <Text style={styles.offenMeta} numberOfLines={1}>
              {item.listing?.canton ?? ''}{item.listing?.city ? ` · ${item.listing.city}` : ''}
            </Text>
          </View>
          <CompatibilityBadge score={item.compatibilityScore ?? 0} size="sm" />
        </View>

        {/* Primary action button */}
        <View style={styles.actionRow}>
          <Pressable
            style={styles.applyButton}
            onPress={() => onPrepare(item.matchId)}
            hitSlop={4}
          >
            <Ionicons name="create-outline" size={16} color={colors.white} />
            <Text style={styles.applyButtonText}>Bewerbung vorbereiten</Text>
          </Pressable>
        </View>
      </Pressable>
    </Swipeable>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  segmentedControlWrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.secondaryBackground,
    borderRadius: borderRadius.sm,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm - 1,
  },
  segmentActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  segmentText: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.text,
    fontWeight: fontWeights.semiBold,
  },
  list: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },

  // Offen Card styles
  offenCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadows.card,
  },
  offenCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
  offenInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  offenCompany: {
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  offenTitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  offenMeta: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm + 2,
    gap: spacing.xs,
  },
  applyButtonText: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.semiBold,
    color: colors.white,
  },

  // Swipe action panels
  swipeActionShare: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: SWIPE_ACTION_WIDTH,
    borderTopLeftRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
    marginBottom: spacing.sm,
  },
  swipeActionDelete: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: SWIPE_ACTION_WIDTH,
    borderTopRightRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    marginBottom: spacing.sm,
  },
  swipeActionText: {
    color: colors.white,
    fontSize: typography.caption,
    fontWeight: fontWeights.semiBold,
    marginTop: 4,
  },
});
