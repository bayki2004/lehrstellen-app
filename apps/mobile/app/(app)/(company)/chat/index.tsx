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

export default function CompanyChatListScreen() {
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

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) return 'Gestern';
    if (diffDays < 7) return `${diffDays}d`;
    return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' });
  };

  const getStudentName = (item: MatchDTO) => {
    if (item.student) {
      return `${item.student.firstName} ${item.student.lastName}`;
    }
    return 'Bewerber';
  };

  const renderItem = ({ item }: { item: MatchDTO }) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => router.push(`/(app)/(company)/chat/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(getStudentName(item))[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.name} numberOfLines={1}>
            {getStudentName(item)}
          </Text>
          <Text style={styles.time}>
            {formatTime(item.lastMessage?.createdAt || item.createdAt)}
          </Text>
        </View>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.listing?.title || 'Lehrstelle'}
        </Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage?.content || 'Noch keine Nachrichten'}
        </Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unreadCount}</Text>
        </View>
      )}
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
        <Text style={styles.title}>Chat</Text>
        <Text style={styles.count}>{matches.length} Chats</Text>
      </View>

      {matches.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>Noch keine Chats</Text>
          <Text style={styles.emptyText}>
            Sobald Sie eine Bewerbung annehmen, erscheinen hier die Konversationen.
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderItem}
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
    paddingBottom: spacing.lg,
  },
  chatCard: {
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
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.white,
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
  },
  chatInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
    color: colors.text,
    flex: 1,
  },
  time: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  subtitle: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 1,
  },
  lastMessage: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
    marginTop: 3,
  },
  badge: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: colors.white,
    fontSize: typography.caption,
    fontWeight: fontWeights.bold,
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
