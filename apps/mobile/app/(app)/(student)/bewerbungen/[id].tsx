import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useBewerbungen, useWithdrawBewerbung } from '../../../../hooks/queries/useBewerbungen';
import BewerbungStatusBadge from '../../../../components/bewerbungen/BewerbungStatusBadge';
import Button from '../../../../components/ui/Button';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../../../constants/theme';
import { BEWERBUNG_STATUS_CONFIG, type BewerbungStatus } from '../../../../types/bewerbung.types';

const PRISMA_TO_STATUS: Record<string, BewerbungStatus> = {
  PENDING: 'sent',
  VIEWED: 'viewed',
  SHORTLISTED: 'viewed',
  INTERVIEW_SCHEDULED: 'interview_invited',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

export default function BewerbungDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bewerbungen = [] } = useBewerbungen();
  const withdrawMutation = useWithdrawBewerbung();
  const bewerbung = useMemo(() => bewerbungen.find((b) => b.applicationId === id || b.matchId === id), [bewerbungen, id]);

  if (!bewerbung) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Bewerbung nicht gefunden</Text>
      </View>
    );
  }

  const listing = bewerbung.listing;
  const companyName = listing?.companyName ?? 'Unbekannt';
  const sentAt = bewerbung.createdAt;
  const viewedAt = bewerbung.timeline?.find((t) => t.status === 'VIEWED')?.timestamp;
  const respondedAt = bewerbung.timeline?.find((t) => ['ACCEPTED', 'REJECTED'].includes(t.status))?.timestamp;

  const mappedStatus = PRISMA_TO_STATUS[bewerbung.applicationStatus ?? ''] ?? 'sent';
  const statusConfig = BEWERBUNG_STATUS_CONFIG[mappedStatus];
  const isRejected = mappedStatus === 'rejected';
  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('de-CH', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

  const handleWithdraw = () => {
    Alert.alert('Bewerbung zurückziehen?', 'Diese Aktion kann nicht rückgängig gemacht werden.', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Zurückziehen', style: 'destructive', onPress: () => { withdrawMutation.mutate(bewerbung.applicationId ?? bewerbung.matchId); router.back(); } },
    ]);
  };

  const timeline = [
    { label: 'Gesendet', date: formatDate(sentAt), active: true },
    { label: 'Angesehen', date: formatDate(viewedAt), active: !!viewedAt },
    { label: 'Antwort', date: formatDate(respondedAt), active: !!respondedAt },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Company Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerInner}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{companyName[0]}</Text>
          </LinearGradient>
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.beruf}>{listing?.title ?? 'Lehrstelle'}</Text>
          {listing?.canton && (
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={14} color={colors.textTertiary} />
              <Text style={styles.location}>{listing.canton}{listing.city ? `, ${listing.city}` : ''}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Current Status */}
      <View style={styles.statusCard}>
        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.statusRow}>
          <BewerbungStatusBadge status={mappedStatus} />
        </View>
      </View>

      {/* Timeline Card */}
      <View style={styles.timelineCard}>
        <Text style={styles.sectionTitle}>Verlauf</Text>
        {timeline.map((item, i) => {
          const isLastItem = i === timeline.length - 1;
          const nextActive = !isLastItem && timeline[i + 1]?.active;
          const dotColor = item.active
            ? (isRejected && isLastItem ? colors.swipeLeft : colors.swipeRight)
            : (colors.textTertiary + '4D'); // 30% opacity

          return (
            <View key={i} style={styles.timelineItem}>
              {/* Dot + line column */}
              <View style={styles.timelineDotCol}>
                <View style={[styles.timelineDot, { backgroundColor: dotColor }]} />
                {!isLastItem && (
                  <View
                    style={[
                      styles.timelineLine,
                      {
                        backgroundColor: item.active && nextActive
                          ? colors.swipeRight + '4D'  // 30% opacity
                          : colors.textTertiary + '33', // 20% opacity
                      },
                    ]}
                  />
                )}
              </View>
              {/* Content */}
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineLabel, !item.active && styles.timelineLabelInactive]}>{item.label}</Text>
                {item.date ? <Text style={styles.timelineDate}>{item.date}</Text> : <Text style={styles.timelinePending}>Ausstehend</Text>}
              </View>
            </View>
          );
        })}
      </View>

      {/* Notes */}
      {bewerbung.notes && (
        <View style={styles.notesCard}>
          <Text style={styles.sectionTitle}>Notizen</Text>
          <Text style={styles.notesText}>{bewerbung.notes}</Text>
        </View>
      )}

      {/* Withdraw button */}
      {statusConfig.isActive && mappedStatus !== 'withdrawn' && (
        <View style={styles.actionSection}>
          <Button title="Bewerbung zurückziehen" onPress={handleWithdraw} variant="outline" />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textTertiary, fontSize: typography.body },

  // Header card
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    ...shadows.card,
  },
  headerInner: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { fontSize: typography.h1, fontWeight: fontWeights.bold, color: colors.white },
  companyName: { fontSize: typography.h3, fontWeight: fontWeights.bold, color: colors.text },
  beruf: { fontSize: typography.body, color: colors.textSecondary, marginTop: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  location: { fontSize: typography.bodySmall, color: colors.textTertiary },

  // Status card
  statusCard: { backgroundColor: colors.surface, marginTop: spacing.md, padding: spacing.md, marginHorizontal: spacing.md, borderRadius: borderRadius.xl, ...shadows.card },
  statusRow: { flexDirection: 'row', marginTop: spacing.sm },
  sectionTitle: { fontSize: typography.h4, fontWeight: fontWeights.semiBold, color: colors.text, marginBottom: spacing.sm },

  // Timeline card
  timelineCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    ...shadows.card,
  },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  timelineDotCol: { alignItems: 'center', width: 20, marginRight: spacing.md },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  timelineLine: { width: 2, height: 40, marginTop: 4 },
  timelineContent: { flex: 1 },
  timelineLabel: { fontSize: typography.body, fontWeight: fontWeights.medium, color: colors.text },
  timelineLabelInactive: { color: colors.textTertiary },
  timelineDate: { fontSize: typography.caption, color: colors.textSecondary, marginTop: 2 },
  timelinePending: { fontSize: typography.caption, color: colors.textTertiary, fontStyle: 'italic', marginTop: 2 },

  // Notes card
  notesCard: { backgroundColor: colors.surface, marginTop: spacing.md, padding: spacing.md, marginHorizontal: spacing.md, borderRadius: borderRadius.xl, ...shadows.card },
  notesText: { fontSize: typography.body, color: colors.textSecondary, lineHeight: 22 },
  actionSection: { marginTop: spacing.xl, paddingHorizontal: spacing.md },
});
