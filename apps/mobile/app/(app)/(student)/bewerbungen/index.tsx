import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api from '../../../../services/api';
import type { ApplicationDTO } from '@lehrstellen/shared';

type StatusFilter = 'ALLE' | 'PENDING' | 'VIEWED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'ACCEPTED' | 'REJECTED';

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'ALLE', label: 'Alle' },
  { key: 'PENDING', label: 'Gesendet' },
  { key: 'VIEWED', label: 'Angesehen' },
  { key: 'SHORTLISTED', label: 'Einladung' },
  { key: 'INTERVIEW_SCHEDULED', label: 'Interview' },
  { key: 'ACCEPTED', label: 'Angebot' },
  { key: 'REJECTED', label: 'Abgesagt' },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#9CA3AF',
  VIEWED: '#3B82F6',
  SHORTLISTED: '#8B5CF6',
  INTERVIEW_SCHEDULED: '#F59E0B',
  ACCEPTED: '#10B981',
  REJECTED: '#EF4444',
  WITHDRAWN: '#6B7280',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Gesendet',
  VIEWED: 'Angesehen',
  SHORTLISTED: 'Einladung',
  INTERVIEW_SCHEDULED: 'Interview',
  ACCEPTED: 'Angebot',
  REJECTED: 'Abgesagt',
  WITHDRAWN: 'Zurückgezogen',
};

export default function BewerbungenScreen() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('ALLE');

  const fetchApplications = useCallback(async () => {
    try {
      const res = await api.get<ApplicationDTO[]>('/applications');
      setApplications(res.data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const filtered =
    activeFilter === 'ALLE'
      ? applications
      : applications.filter((a) => a.status === activeFilter);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const renderItem = ({ item }: { item: ApplicationDTO }) => {
    const statusColor = STATUS_COLORS[item.status] ?? '#9CA3AF';
    const statusLabel = STATUS_LABELS[item.status] ?? item.status;
    const companyLetter = (item.listing?.companyName || '?')[0].toUpperCase();

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(app)/(student)/matches/${item.matchId}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardLeft}>
          <View style={styles.companyAvatar}>
            <Text style={styles.companyAvatarText}>{companyLetter}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.companyName} numberOfLines={1}>
            {item.listing?.companyName || 'Unternehmen'}
          </Text>
          <Text style={styles.berufTitle} numberOfLines={1}>
            {item.listing?.title || 'Lehrstelle'}
          </Text>
          <Text style={styles.cardMeta}>
            {item.listing?.canton} · {formatDate(item.createdAt)}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Bewerbungen</Text>
        <Text style={styles.count}>{filtered.length}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {STATUS_FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>Keine Bewerbungen</Text>
          <Text style={styles.emptyText}>
            {activeFilter === 'ALLE'
              ? 'Wische auf Inserate, um dich zu bewerben!'
              : `Keine Bewerbungen mit Status "${STATUS_LABELS[activeFilter] ?? activeFilter}".`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4A90E2" />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A2E' },
  count: { fontSize: 18, fontWeight: '700', color: '#9CA3AF' },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  filterChipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  filterChipTextActive: { color: '#FFFFFF' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLeft: { marginRight: 12 },
  companyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyAvatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  cardBody: { flex: 1, marginRight: 8 },
  companyName: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  berufTitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  cardMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  cardRight: { alignItems: 'flex-end' },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
});
