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
        api.get('/listings/my'),
        api.get('/matches'),
      ]);
      const listings = listingsRes.data as any[];
      const matches = matchesRes.data as any[];
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
          <ActivityIndicator size="large" color="#4A90E2" />
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
            tintColor="#4A90E2"
          />
        }
      >
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Übersicht Ihres Unternehmens</Text>

        <View style={styles.statsGrid}>
          <StatCard label="Alle Stellen" value={stats.totalListings} color="#4A90E2" />
          <StatCard label="Aktive Stellen" value={stats.activeListings} color="#4CAF50" />
          <StatCard label="Matches" value={stats.totalMatches} color="#FF6B35" />
          <StatCard label="Bewerbungen" value={stats.pendingApplications} color="#FFC107" />
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
    backgroundColor: '#F8F9FA',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 24,
  },
});
