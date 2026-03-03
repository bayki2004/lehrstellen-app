import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../../services/api';
import { colors, typography, fontWeights, spacing, borderRadius, shadows } from '../../../../constants/theme';
import type { ListingDTO } from '@lehrstellen/shared';

export default function ListingsScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<ListingDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchListings = useCallback(async () => {
    try {
      const res = await api.get('/listings/mine');
      const data = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
      setListings(data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchListings();
    }, [fetchListings]),
  );

  const renderListing = ({ item }: { item: ListingDTO & { isActive?: boolean } }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/(app)/(company)/listings/${item.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.cardHeaderRight}>
          <View style={[styles.badge, item.isActive !== false ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={[styles.badgeText, item.isActive !== false ? styles.activeText : styles.inactiveText]}>
              {item.isActive !== false ? 'Aktiv' : 'Inaktiv'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </View>
      </View>
      <Text style={styles.field}>{item.field}</Text>
      <Text style={styles.location}>{item.canton}, {item.city}</Text>
      {item.description && (
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      )}
      <View style={styles.cardFooter}>
        <Text style={styles.spots}>
          {item.spotsAvailable} {item.spotsAvailable === 1 ? 'Platz' : 'Plätze'} verfügbar
        </Text>
      </View>
    </TouchableOpacity>
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
      <View style={styles.header}>
        <Text style={styles.title}>Stellen</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/(app)/(company)/listings/create')}
        >
          <Text style={styles.createButtonText}>+ Neue Stelle</Text>
        </TouchableOpacity>
      </View>

      {listings.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>Keine Lehrstellen</Text>
          <Text style={styles.emptyText}>
            Erstellen Sie Ihre erste Lehrstelle, um Bewerbungen zu erhalten.
          </Text>
          <TouchableOpacity
            style={styles.emptyCreateButton}
            onPress={() => router.push('/(app)/(company)/listings/create')}
          >
            <Text style={styles.emptyCreateButtonText}>Lehrstelle erstellen</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listings}
          renderItem={renderListing}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => {
              setRefreshing(true);
              fetchListings();
            }} tintColor={colors.primary} />
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: fontWeights.extraBold,
    color: colors.text,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  createButtonText: {
    color: colors.white,
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.bold,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  activeBadge: {
    backgroundColor: colors.success + '20',
  },
  inactiveBadge: {
    backgroundColor: colors.warning + '20',
  },
  badgeText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semiBold,
  },
  activeText: {
    color: colors.success,
  },
  inactiveText: {
    color: colors.warning,
  },
  field: {
    fontSize: typography.bodySmall,
    color: colors.primary,
    fontWeight: fontWeights.medium,
    marginBottom: 2,
  },
  location: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
    marginBottom: 6,
  },
  description: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  spots: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
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
    marginBottom: spacing.lg,
  },
  emptyCreateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xxl,
  },
  emptyCreateButtonText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
  },
});
