import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../../services/api';
import { colors, typography, fontWeights, spacing, borderRadius, shadows } from '../../../../constants/theme';

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalMatches: number;
  pendingApplications: number;
}

export default function CompanyDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    totalMatches: 0,
    pendingApplications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const [listingsRes, matchesRes] = await Promise.all([
        api.get('/listings/mine'),
        api.get('/matches'),
      ]);
      const listingsRaw = (listingsRes.data as any)?.data || listingsRes.data;
      const matchesRaw = (matchesRes.data as any)?.data || matchesRes.data;
      const listings = Array.isArray(listingsRaw) ? listingsRaw : [];
      const matches = Array.isArray(matchesRaw) ? matchesRaw : [];
      setStats({
        totalListings: listings.length,
        activeListings: listings.filter((l: any) => l.isActive).length,
        totalMatches: matches.length,
        pendingApplications: matches.filter((m: any) => m.status === 'PENDING').length,
      });
    } catch {
      // silent
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchStats();
            }}
            tintColor={colors.primary}
          />
        }
      >
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Übersicht Ihres Unternehmens</Text>

        <View style={styles.statsGrid}>
          <StatCard label="Alle Stellen" value={stats.totalListings} color={colors.primary} />
          <StatCard label="Aktive Stellen" value={stats.activeListings} color={colors.success} />
          <StatCard label="Matches" value={stats.totalMatches} color={colors.secondary} />
          <StatCard label="Bewerbungen" value={stats.pendingApplications} color={colors.accent} />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Tipps</Text>
          <Text style={styles.infoText}>
            • Erstellen Sie detaillierte Stellenbeschreibungen{'\n'}
            • Definieren Sie ideale Persönlichkeitsprofile{'\n'}
            • Antworten Sie zeitnah auf Matches
          </Text>
        </View>
      </ScrollView>
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
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: fontWeights.extraBold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderLeftWidth: 4,
    ...shadows.card,
  },
  statValue: {
    fontSize: typography.hero,
    fontWeight: fontWeights.extraBold,
  },
  statLabel: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontWeight: fontWeights.medium,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    ...shadows.card,
  },
  infoTitle: {
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 24,
  },
});
