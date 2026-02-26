import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBerufDetail, useLehrstellenForBeruf } from '../../../../hooks/queries/useBerufe';
import { useFavoriteBerufe, useToggleFavoriteBeruf } from '../../../../hooks/queries/useFavoriteBerufe';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../../../constants/theme';

const LEVEL_LABELS = ['Einfach', 'Mittel', 'Hoch', 'Sehr hoch'];
const LEVEL_COLORS = ['#34C759', '#007AFF', '#FF9500', '#AF52DE'];

function formatCHF(value: number): string {
  return new Intl.NumberFormat('de-CH', { style: 'decimal' }).format(value);
}

export default function BerufDetailScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { data: beruf, isLoading } = useBerufDetail(code ?? '');
  const { data: lehrstellenData } = useLehrstellenForBeruf(code ?? '');
  const { data: favorites = [] } = useFavoriteBerufe();
  const toggleFavorite = useToggleFavoriteBeruf();
  const [lehrstellenExpanded, setLehrstellenExpanded] = useState(false);

  const isFavorite = code ? favorites.includes(code) : false;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered} edges={['top']}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Berufsinformationen werden geladen...</Text>
      </SafeAreaView>
    );
  }

  if (!beruf) {
    return (
      <SafeAreaView style={styles.centered} edges={['top']}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textTertiary} />
        <Text style={styles.emptyText}>Beruf nicht gefunden</Text>
      </SafeAreaView>
    );
  }

  const scraped = beruf.scraped;
  const description = scraped?.description || beruf.descriptionDe;
  const lehrstellenCount = lehrstellenData?.count ?? 0;

  const hasAnforderungen =
    beruf.anforderungMathematik != null ||
    beruf.anforderungSchulsprache != null ||
    beruf.anforderungNaturwissenschaften != null ||
    beruf.anforderungFremdsprachen != null;

  const anforderungen = hasAnforderungen
    ? [
        { label: 'Mathematik', icon: 'calculator-outline' as const, level: beruf.anforderungMathematik },
        { label: 'Schulsprache', icon: 'chatbubble-outline' as const, level: beruf.anforderungSchulsprache },
        { label: 'Naturwissenschaften', icon: 'flask-outline' as const, level: beruf.anforderungNaturwissenschaften },
        { label: 'Fremdsprachen', icon: 'globe-outline' as const, level: beruf.anforderungFremdsprachen },
      ].filter((a) => a.level != null)
    : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Nav bar with back + heart */}
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Pressable
          onPress={() => code && toggleFavorite.mutate(code)}
          hitSlop={8}
          style={styles.heartBtn}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#FF3B5C' : colors.textSecondary}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header card */}
        <View style={styles.headerCard}>
          <View style={styles.badges}>
            {beruf.field && (
              <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>{beruf.field}</Text>
              </View>
            )}
            {beruf.educationType && (
              <View style={[styles.badge, { backgroundColor: colors.success + '15' }]}>
                <Text style={[styles.badgeText, { color: colors.success }]}>{beruf.educationType}</Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>{beruf.nameDe}</Text>
          <View style={styles.metaRow}>
            {beruf.durationYears && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.metaText}>{beruf.durationYears} Jahre</Text>
              </View>
            )}
            {scraped?.duration && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.metaText}>{scraped.duration}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Lehrstellen button */}
        <Pressable
          style={styles.lehrstellenButton}
          onPress={() => setLehrstellenExpanded((prev) => !prev)}
        >
          <View style={styles.lehrstellenRow}>
            <Ionicons name="briefcase-outline" size={22} color={colors.primary} />
            <Text style={styles.lehrstellenText}>
              {lehrstellenCount} offene Lehrstellen
            </Text>
            <View style={styles.lehrstellenCountBadge}>
              <Text style={styles.lehrstellenCountText}>{lehrstellenCount}</Text>
            </View>
            <Ionicons
              name={lehrstellenExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textSecondary}
            />
          </View>
        </Pressable>

        {/* Expanded lehrstellen list */}
        {lehrstellenExpanded && lehrstellenData && lehrstellenData.lehrstellen.length > 0 && (
          <View style={styles.lehrstellenList}>
            {lehrstellenData.lehrstellen.map((ls: any) => (
              <Pressable
                key={ls.id}
                style={styles.lehrstelleItem}
                onPress={() => router.push(`/feed/${ls.id}` as any)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.lehrstelleCompany}>
                    {ls.company_name || ls.companyName || 'Unternehmen'}
                  </Text>
                  <Text style={styles.lehrstelleLocation}>
                    {ls.city}, {ls.canton}
                  </Text>
                </View>
                {(ls.positions_available ?? ls.positionsAvailable ?? 1) > 1 && (
                  <View style={styles.positionsBadge}>
                    <Text style={styles.positionsText}>
                      {ls.positions_available ?? ls.positionsAvailable} Plätze
                    </Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </Pressable>
            ))}
          </View>
        )}

        {/* Description */}
        {description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Beschreibung</Text>
            </View>
            <Text style={styles.bodyText}>{description}</Text>
          </View>
        )}

        {/* Requirements (scraped) */}
        {scraped?.requirements && scraped.requirements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Voraussetzungen</Text>
            </View>
            {scraped.requirements.map((req, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bullet}>{'\u2022'}</Text>
                <Text style={styles.bulletText}>{req}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Schulische Anforderungen */}
        {anforderungen.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="school-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Schulische Anforderungen</Text>
            </View>
            {anforderungen.map((a) => (
              <View key={a.label} style={styles.anforderungRow}>
                <View style={styles.anforderungLabel}>
                  <Ionicons name={a.icon} size={16} color={colors.textSecondary} />
                  <Text style={styles.anforderungText}>{a.label}</Text>
                </View>
                <View style={styles.anforderungBar}>
                  {[1, 2, 3, 4].map((lvl) => (
                    <View
                      key={lvl}
                      style={[
                        styles.barSegment,
                        {
                          backgroundColor:
                            lvl <= (a.level ?? 0)
                              ? LEVEL_COLORS[(a.level ?? 1) - 1]
                              : colors.secondaryBackground,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.levelLabel, { color: LEVEL_COLORS[(a.level ?? 1) - 1] }]}>
                  {LEVEL_LABELS[(a.level ?? 1) - 1]}
                </Text>
              </View>
            ))}
            <Text style={styles.anforderungSource}>Quelle: Anforderungsprofile.ch</Text>
          </View>
        )}

        {/* Lohn Lehre */}
        {beruf.lohnLehrjahre && beruf.lohnLehrjahre.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cash-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Lohn während der Lehre</Text>
            </View>
            {beruf.lohnLehrjahre.map((lohn, i) => (
              <View key={i} style={styles.lohnRow}>
                <Text style={styles.lohnLabel}>{i + 1}. Lehrjahr</Text>
                <Text style={styles.lohnValue}>CHF {formatCHF(lohn)}</Text>
              </View>
            ))}
            <Text style={styles.lohnNote}>Durchschnittliche Richtwerte</Text>
          </View>
        )}

        {/* Career Paths */}
        {scraped?.careerPaths && scraped.careerPaths.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trending-up-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Weiterbildung & Karriere</Text>
            </View>
            {scraped.careerPaths.map((path, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bullet}>{'\u2022'}</Text>
                <Text style={styles.bulletText}>{path}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Related Professions */}
        {scraped?.relatedProfessions && scraped.relatedProfessions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="git-compare-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Verwandte Berufe</Text>
            </View>
            {scraped.relatedProfessions.map((rel, i) => (
              <View key={i} style={styles.relatedRow}>
                <Ionicons name="arrow-forward-outline" size={14} color={colors.textTertiary} />
                <Text style={styles.relatedText}>{rel}</Text>
              </View>
            ))}
          </View>
        )}

        {/* No scraped data fallback */}
        {!scraped && !beruf.descriptionDe && (
          <View style={styles.section}>
            <Text style={styles.emptySection}>
              Detailinformationen werden geladen. Bitte versuche es später erneut.
            </Text>
          </View>
        )}

        {/* Source attribution */}
        {scraped?.scrapedAt && (
          <Text style={styles.source}>
            Quelle: berufsberatung.ch
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

  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  heartBtn: {
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
  badges: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: { fontSize: typography.caption, fontWeight: fontWeights.semiBold },
  name: {
    fontSize: typography.h2,
    fontWeight: fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  metaRow: { flexDirection: 'row', gap: spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { fontSize: typography.bodySmall, color: colors.textSecondary },

  // Lehrstellen button
  lehrstellenButton: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  lehrstellenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  lehrstellenText: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },
  lehrstellenCountBadge: {
    backgroundColor: colors.primary,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  lehrstellenCountText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
  lehrstellenList: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    ...shadows.sm,
  },
  lehrstelleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  lehrstelleCompany: {
    fontSize: typography.body,
    fontWeight: fontWeights.medium,
    color: colors.text,
  },
  lehrstelleLocation: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
  },
  positionsBadge: {
    backgroundColor: colors.success + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  positionsText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semiBold,
    color: colors.success,
  },

  // Sections
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

  // Schulische Anforderungen
  anforderungRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  anforderungLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    width: 140,
  },
  anforderungText: {
    fontSize: typography.bodySmall,
    color: colors.text,
  },
  anforderungBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 3,
    marginRight: spacing.sm,
  },
  barSegment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  levelLabel: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semiBold,
    width: 64,
    textAlign: 'right',
  },
  anforderungSource: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },

  // Lohn
  lohnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  lohnLabel: {
    fontSize: typography.body,
    color: colors.text,
  },
  lohnValue: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.primary,
  },
  lohnNote: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },

  relatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  relatedText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },

  emptySection: {
    fontSize: typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  source: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
});
