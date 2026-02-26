import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { CommuteData } from '../../hooks/queries/useCommute';
import { colors, typography, fontWeights, spacing, borderRadius, shadows } from '../../constants/theme';

interface CommuteCardProps {
  workplaceName: string;
  schoolName: string;
  workplaceCommute: CommuteData | null | undefined;
  schoolCommute: CommuteData | null | undefined;
  isLoading?: boolean;
}

function CommuteMetrics({ commute }: { commute: CommuteData }) {
  const transfersLabel =
    commute.transfers != null && commute.transfers > 0
      ? ` · ${commute.transfers} ${commute.transfers === 1 ? 'Umstieg' : 'Umstiege'}`
      : '';

  return (
    <View style={styles.metricsContainer}>
      <View style={styles.metricRow}>
        <Text style={styles.metricText}>
          🚆 {commute.transitMinutes} min (ÖV){transfersLabel}
        </Text>
      </View>
      <View style={styles.metricRow}>
        <Text style={styles.metricText}>
          🚲 {commute.bikeMinutes} min (Velo) · 📍 {commute.distanceKm} km
        </Text>
      </View>
    </View>
  );
}

export default function CommuteCard({
  workplaceName,
  schoolName,
  workplaceCommute,
  schoolCommute,
  isLoading = false,
}: CommuteCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>🏠 Dein Weg</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Berechne Route...</Text>
        </View>
      ) : (
        <View style={styles.routesContainer}>
          {/* Workplace Route */}
          <View style={styles.routeSection}>
            <Text style={styles.destinationTitle}>🏢 Arbeitsort: {workplaceName}</Text>
            {workplaceCommute ? (
              <CommuteMetrics commute={workplaceCommute} />
            ) : (
              <Text style={styles.noDataText}>Keine Routendaten verfügbar</Text>
            )}
          </View>

          <View style={styles.divider} />

          {/* School Route */}
          <View style={styles.routeSection}>
            <Text style={styles.destinationTitle}>🎓 Berufsschule: {schoolName}</Text>
            {schoolCommute ? (
              <CommuteMetrics commute={schoolCommute} />
            ) : (
              <Text style={styles.noDataText}>Keine Routendaten verfügbar</Text>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoText}>ℹ️ Berufsschule: 1-2 Tage/Woche</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    ...shadows.card,
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  routesContainer: {
    gap: spacing.md,
  },
  routeSection: {
    gap: spacing.xs,
  },
  destinationTitle: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  metricsContainer: {
    paddingLeft: spacing.xl,
    gap: 4,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  infoRow: {
    marginTop: spacing.xs,
    paddingLeft: spacing.xl,
  },
  infoText: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  loadingContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textTertiary,
  },
  noDataText: {
    paddingLeft: spacing.xl,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
});
