import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSchoolDetail } from '../../../../../hooks/queries/useSchoolDetail';
import CantonBadge from '../../../../../components/ui/CantonBadge';
import {
  colors,
  typography,
  fontWeights,
  spacing,
  borderRadius,
  shadows,
} from '../../../../../constants/theme';

export default function SchoolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: school, isLoading } = useSchoolDetail(id);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered} edges={['top']}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Schulinformationen werden geladen...</Text>
      </SafeAreaView>
    );
  }

  if (!school) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyText}>Schule nicht gefunden</Text>
        </View>
      </SafeAreaView>
    );
  }

  const scraped = school.scraped;

  const handleOpenWebsite = () => {
    if (school.website) {
      const url = school.website.startsWith('http')
        ? school.website
        : `https://${school.website}`;
      Linking.openURL(url).catch(() => {});
    }
  };

  const handleCall = () => {
    const phone = school.phone || scraped?.contact?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone.replace(/\s/g, '')}`).catch(() => {});
    }
  };

  const handleEmail = () => {
    const email = school.email || scraped?.contact?.email;
    if (email) {
      Linking.openURL(`mailto:${email}`).catch(() => {});
    }
  };

  const phone = school.phone || scraped?.contact?.phone;
  const email = school.email || scraped?.contact?.email;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Back button */}
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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

          <View style={styles.badges}>
            <View style={styles.cantonRow}>
              <CantonBadge code={school.canton} size={22} />
              <Text style={styles.cantonText}>{school.canton}</Text>
            </View>
            {school.institutionalStatus && (
              <View style={[styles.badge, { backgroundColor: colors.success + '15' }]}>
                <Text style={[styles.badgeText, { color: colors.success }]}>{school.institutionalStatus}</Text>
              </View>
            )}
          </View>

          <Text style={styles.schoolName}>{school.name}</Text>
          <Text style={styles.schoolLocation}>{school.city}, {school.canton}</Text>
        </View>

        {/* About / Description */}
        {scraped?.about && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Über die Schule</Text>
            </View>
            <Text style={styles.bodyText}>{scraped.about}</Text>
          </View>
        )}

        {/* Contact info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Kontakt & Standort</Text>
          </View>

          {school.address && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                {school.address}{school.postalCode ? `, ${school.postalCode}` : ''} {school.city}
              </Text>
            </View>
          )}

          {phone && (
            <Pressable style={styles.infoRow} onPress={handleCall}>
              <Ionicons name="call-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoText, styles.linkText]}>{phone}</Text>
            </Pressable>
          )}

          {email && (
            <Pressable style={styles.infoRow} onPress={handleEmail}>
              <Ionicons name="mail-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoText, styles.linkText]}>{email}</Text>
            </Pressable>
          )}
        </View>

        {/* Programs / Bildungsangebote */}
        {scraped?.programs && scraped.programs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="book-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Bildungsangebote</Text>
            </View>
            {scraped.programs.map((prog, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bullet}>{'\u2022'}</Text>
                <Text style={styles.bulletText}>{prog}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Specializations (berufe taught at this school) */}
        {school.specializations && school.specializations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="briefcase-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Lehrberufe</Text>
            </View>
            <View style={styles.specContainer}>
              {school.specializations.map((spec, i) => (
                <View key={i} style={styles.specChip}>
                  <Text style={styles.specText}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Website button */}
        {school.website && (
          <Pressable style={styles.websiteButton} onPress={handleOpenWebsite}>
            <Ionicons name="globe-outline" size={20} color={colors.white} />
            <Text style={styles.websiteButtonText}>Website besuchen</Text>
          </Pressable>
        )}

        {/* Source attribution */}
        {scraped?.scrapedAt && (
          <Text style={styles.source}>
            Zusatzinfos von der Schulwebsite
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  loadingText: { fontSize: typography.bodySmall, color: colors.textSecondary },
  emptyText: { fontSize: typography.body, color: colors.textTertiary },

  nav: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },

  content: { paddingBottom: spacing.xxxl + 40 },

  headerCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.card,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  cantonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.warning + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  cantonText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semiBold,
    color: colors.warning,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: { fontSize: typography.caption, fontWeight: fontWeights.semiBold },
  schoolName: {
    fontSize: typography.h2,
    fontWeight: fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  schoolLocation: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },

  section: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },
  bodyText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.body,
    color: colors.text,
    flex: 1,
  },
  linkText: {
    color: colors.primary,
  },

  bulletRow: {
    flexDirection: 'row',
    paddingRight: spacing.md,
    marginBottom: spacing.xs,
  },
  bullet: {
    fontSize: typography.body,
    color: colors.primary,
    width: 20,
    lineHeight: 24,
  },
  bulletText: {
    flex: 1,
    fontSize: typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },

  specContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  specChip: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  specText: {
    fontSize: typography.caption,
    color: colors.text,
    fontWeight: fontWeights.medium,
  },

  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  websiteButtonText: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.white,
  },

  source: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
});
