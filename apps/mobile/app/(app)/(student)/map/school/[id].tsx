import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CantonBadge from '../../../../../components/ui/CantonBadge';
import { useSchoolDetail } from '../../../../../hooks/queries/useSchoolDetail';
import {
  colors,
  typography,
  fontWeights,
  spacing,
  borderRadius,
  shadows,
} from '../../../../../constants/theme';

export default function MapSchoolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: school, isLoading } = useSchoolDetail(id);

  const handleOpenWebsite = () => {
    if (school?.website) {
      const url = school.website.startsWith('http')
        ? school.website
        : `https://${school.website}`;
      Linking.openURL(url).catch(() => {});
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.backRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!school) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.backRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Schule nicht gefunden</Text>
          <Text style={styles.emptyText}>
            Diese Berufsschule konnte nicht geladen werden.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header card */}
        <View style={styles.headerCard}>
          <LinearGradient
            colors={['#FF9500', '#FF6B00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarCircle}
          >
            <Ionicons name="school" size={32} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.schoolName}>{school.name}</Text>
          <View style={styles.cantonRow}>
            <CantonBadge code={school.canton} size={22} />
            <Text style={styles.cantonText}>
              {school.city}, {school.canton}
            </Text>
          </View>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Informationen</Text>

          {school.address && (
            <View style={styles.infoRow}>
              <Ionicons
                name="location-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={styles.infoText}>{school.address}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons
              name="map-outline"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={styles.infoText}>
              {school.city}, {school.canton}
            </Text>
          </View>

          {school.phone && (
            <View style={styles.infoRow}>
              <Ionicons
                name="call-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={styles.infoText}>{school.phone}</Text>
            </View>
          )}
        </View>

        {/* Specializations */}
        {school.specializations && school.specializations.length > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Fachrichtungen</Text>
            <View style={styles.specContainer}>
              {school.specializations.map((spec) => (
                <View key={spec} style={styles.specChip}>
                  <Text style={styles.specText}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Website button */}
        {school.website && (
          <TouchableOpacity
            style={styles.websiteButton}
            onPress={handleOpenWebsite}
            activeOpacity={0.8}
          >
            <Ionicons name="globe-outline" size={20} color={colors.white} />
            <Text style={styles.websiteButtonText}>Website besuchen</Text>
          </TouchableOpacity>
        )}
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
    padding: spacing.xxl,
  },
  backRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  headerCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    ...shadows.card,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  schoolName: {
    fontSize: typography.h2,
    fontWeight: fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  cantonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cantonText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    ...shadows.card,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: typography.body,
    color: colors.text,
    flex: 1,
  },
  specContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  specChip: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  specText: {
    fontSize: typography.bodySmall,
    color: colors.text,
    fontWeight: fontWeights.medium,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  websiteButtonText: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.white,
  },
  emptyTitle: {
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
