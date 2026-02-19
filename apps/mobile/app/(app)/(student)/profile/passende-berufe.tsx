import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api from '../../../../services/api';
import type { PassendeBerufDTO } from '@lehrstellen/shared';

export default function PassendeBerufeScreen() {
  const router = useRouter();
  const [berufe, setBerufe] = useState<PassendeBerufDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasRiasec, setHasRiasec] = useState(true);

  const load = async () => {
    try {
      const res = await api.get<PassendeBerufDTO[]>('/students/me/passende-berufe');
      setBerufe(res.data);
      setHasRiasec(true);
    } catch (err: any) {
      if (err?.response?.status === 404) setHasRiasec(false);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}><ActivityIndicator size="large" color="#4A90E2" /></View>
      </SafeAreaView>
    );
  }

  if (!hasRiasec) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.back} onPress={() => router.back()}>‹ Zurück</Text>
          <Text style={styles.title}>Passende Berufe</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🧭</Text>
          <Text style={styles.emptyTitle}>Kein RIASEC-Profil</Text>
          <Text style={styles.emptyText}>
            Schliess zuerst das Persönlichkeitsquiz ab, um passende Berufe zu sehen.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item, index }: { item: PassendeBerufDTO; index: number }) => {
    const matchColor =
      item.matchPercent >= 80 ? '#10B981' :
      item.matchPercent >= 60 ? '#F59E0B' :
      '#6B7280';

    return (
      <View style={styles.card}>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.berufName}>{item.name}</Text>
          <Text style={styles.berufMeta}>{item.field} · {item.educationType}</Text>
          {item.description && (
            <Text style={styles.berufDesc} numberOfLines={2}>{item.description}</Text>
          )}
        </View>
        <View style={styles.matchContainer}>
          <Text style={[styles.matchPercent, { color: matchColor }]}>{item.matchPercent}%</Text>
          <Text style={styles.matchLabel}>Match</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.back} onPress={() => router.back()}>‹ Zurück</Text>
        <Text style={styles.title}>Passende Berufe</Text>
        <Text style={styles.subtitle}>Basierend auf deinem RIASEC-Profil</Text>
      </View>

      {berufe.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={styles.emptyTitle}>Keine Berufe gefunden</Text>
          <Text style={styles.emptyText}>Es sind noch keine Berufe in der Datenbank.</Text>
        </View>
      ) : (
        <FlatList
          data={berufe}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  back: { fontSize: 16, color: '#4A90E2', fontWeight: '500', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A2E' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
  cardBody: { flex: 1, marginRight: 8 },
  berufName: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  berufMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  berufDesc: { fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 16 },
  matchContainer: { alignItems: 'center', minWidth: 52 },
  matchPercent: { fontSize: 20, fontWeight: '800' },
  matchLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
});
