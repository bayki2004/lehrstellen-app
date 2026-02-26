import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useBewerbungen } from '../../../../hooks/queries/useBewerbungen';
import { colors, typography, fontWeights, spacing, borderRadius, shadows } from '../../../../constants/theme';
import type { UnifiedBewerbungItem, BewerbungSegment } from '../../../../types/bewerbung.types';

const SEGMENTS: { key: BewerbungSegment; label: string }[] = [
  { key: 'gesendet', label: 'Eingegangen' },
  { key: 'erledigt', label: 'Erledigt' },
];

export default function ApplicantsScreen() {
  const router = useRouter();
  const { data: bewerbungen = [], isLoading, refetch } = useBewerbungen();
  const [activeSegment, setActiveSegment] = useState<BewerbungSegment>('gesendet');

  const data = useMemo(
    () => bewerbungen.filter((b) => b.segment === activeSegment),
    [bewerbungen, activeSegment],
  );

  const handleSegmentPress = useCallback((key: BewerbungSegment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveSegment(key);
  }, []);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'PENDING': return 'Neu';
      case 'VIEWED': return 'Angesehen';
      case 'SHORTLISTED': return 'Vorauswahl';
      case 'INTERVIEW_SCHEDULED': return 'Einladung';
      case 'ACCEPTED': return 'Angenommen';
      case 'REJECTED': return 'Abgesagt';
      case 'WITHDRAWN': return 'Zurückgezogen';
      default: return status ?? '';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'PENDING': return colors.primary;
      case 'VIEWED': return colors.warning;
      case 'SHORTLISTED': return colors.warning;
      case 'INTERVIEW_SCHEDULED': return colors.success;
      case 'ACCEPTED': return colors.success;
      case 'REJECTED': return colors.error;
      case 'WITHDRAWN': return colors.textTertiary;
      default: return colors.textSecondary;
    }
  };

  const renderItem = useCallback(({ item }: { item: UnifiedBewerbungItem }) => {
    const studentName = item.studentName ?? 'Bewerber';
    const initial = studentName[0].toUpperCase();
    const statusColor = getStatusColor(item.applicationStatus);

    return (
      <Pressable
        style={styles.card}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          if (item.applicationId) {
            router.push(`/(app)/(company)/applicants/${item.applicationId}`);
          }
        }}
      >
        <View style={styles.cardLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.studentName} numberOfLines={1}>
            {studentName}
          </Text>
          <Text style={styles.listingTitle} numberOfLines={1}>
            {item.listing?.title || 'Lehrstelle'}
          </Text>
          <View style={styles.cardMeta}>
            <Text style={styles.date}>
              {formatDate(item.updatedAt ?? item.createdAt)}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusLabel(item.applicationStatus)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreValue}>{Math.round(item.compatibilityScore)}%</Text>
          <Text style={styles.scoreLabel}>Match</Text>
        </View>
      </Pressable>
    );
  }, [router]);

  if (isLoading && data.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Bewerbungen</Text>
        <Text style={styles.count}>{bewerbungen.length} gesamt</Text>
      </View>

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

      {data.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name={activeSegment === 'gesendet' ? 'mail-outline' : 'checkmark-done-outline'}
            size={56}
            color={colors.textTertiary}
          />
          <Text style={styles.emptyTitle}>
            {activeSegment === 'gesendet' ? 'Keine neuen Bewerbungen' : 'Noch keine erledigten'}
          </Text>
          <Text style={styles.emptyText}>
            {activeSegment === 'gesendet'
              ? 'Sobald Lernende sich bewerben, erscheinen sie hier.'
              : 'Angenommene und abgesagte Bewerbungen erscheinen hier.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.applicationId ?? item.matchId}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} tintColor={colors.primary} />
          }
        />
      )}
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
    alignItems: 'baseline',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: fontWeights.extraBold,
    color: colors.text,
  },
  count: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
    fontWeight: fontWeights.medium,
  },
  segmentedControlWrapper: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
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
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  cardLeft: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
  },
  cardContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  studentName: {
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  listingTitle: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: spacing.sm,
  },
  date: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: typography.tiny,
    fontWeight: fontWeights.semiBold,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: typography.h4,
    fontWeight: fontWeights.extraBold,
    color: colors.primary,
  },
  scoreLabel: {
    fontSize: typography.tiny,
    color: colors.textTertiary,
    fontWeight: fontWeights.medium,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  emptyTitle: {
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
