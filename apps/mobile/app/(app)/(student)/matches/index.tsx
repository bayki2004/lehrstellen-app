import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api from '../../../../services/api';
import type { MatchDTO } from '@lehrstellen/shared';
import ScoreRing from '../../../../components/ui/ScoreRing';

export default function MatchesScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatches = useCallback(async () => {
    try {
      const response = await api.get<MatchDTO[]>('/matches');
      setMatches(response.data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const renderMatch = ({ item }: { item: MatchDTO }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => router.push(`/(app)/(student)/matches/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(item.listing?.companyName || '?')[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.matchInfo}>
        <Text style={styles.companyName} numberOfLines={1}>
          {item.listing?.companyName || 'Unternehmen'}
        </Text>
        <Text style={styles.listingTitle} numberOfLines={1}>
          {item.listing?.title || 'Lehrstelle'}
        </Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          Tippe um zu chatten
        </Text>
      </View>
      <ScoreRing score={item.compatibilityScore} size={44} />
    </TouchableOpacity>
  );

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
        <Text style={styles.title}>Matches</Text>
        <Text style={styles.count}>{matches.length} Matches</Text>
      </View>

      {matches.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>💼</Text>
          <Text style={styles.emptyTitle}>Noch keine Matches</Text>
          <Text style={styles.emptyText}>
            Swipe nach rechts auf Lehrstellen, die dich interessieren!
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatch}
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
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  count: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  matchCard: {
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  matchInfo: {
    flex: 1,
    marginRight: 10,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  listingTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 1,
  },
  lastMessage: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 3,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});
