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
import { colors, typography, fontWeights, spacing, borderRadius, shadows } from '../../../../constants/theme';
import type { MatchDTO } from '@lehrstellen/shared';
import ScoreRing from '../../../../components/ui/ScoreRing';

export default function MatchesScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatches = useCallback(async () => {
    try {
      const response = await api.get<{ data: MatchDTO[] }>('/matches');
      const list = Array.isArray(response.data) ? response.data : response.data.data ?? [];
      setMatches(list);
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
          <ActivityIndicator size="large" color={colors.primary} />
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
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
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: 64,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.white,
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
  },
  matchInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  companyName: {
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  listingTitle: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 1,
  },
  lastMessage: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
    marginTop: 3,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.h2,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
