import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  SectionList,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SWISS_CANTONS } from '@lehrstellen/shared';
import type { ListingDTO } from '@lehrstellen/shared';
import { useLehrstellenSearch, useBerufeSearch } from '../../../../hooks/queries/useSearch';
import { useAllSchulen } from '../../../../hooks/queries/useSchoolDetail';
import { useBerufeFields } from '../../../../hooks/queries/useBerufe';
import { getFieldMeta } from '../../../../constants/mapCategories';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../../../constants/theme';
import type { Beruf, Berufsschule } from '../../../../types/beruf.types';
import LehrstelleRow from '../../../../components/search/LehrstelleRow';
import BerufRow from '../../../../components/search/BerufRow';
import CantonBadge from '../../../../components/ui/CantonBadge';

type SearchTab = 'lehrstellen' | 'berufe' | 'berufsschulen';

const TABS: { key: SearchTab; label: string }[] = [
  { key: 'lehrstellen', label: 'Lehrstellen' },
  { key: 'berufe', label: 'Berufe' },
  { key: 'berufsschulen', label: 'Schulen' },
];

export default function SearchScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SearchTab>('lehrstellen');
  const [query, setQuery] = useState('');
  const [selectedCantons, setSelectedCantons] = useState<string[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const { data: rawLehrstellen = [], isLoading: lehrstellenLoading } = useLehrstellenSearch();
  const { data: rawBerufe = [], isLoading: berufeLoading } = useBerufeSearch();
  const { data: berufeFields = [] } = useBerufeFields();

  // For Schulen tab — use server-side search
  const schulenFilters = useMemo(() => {
    const f: Record<string, string> = {};
    if (query.length >= 2) f.q = query;
    return f;
  }, [query]);

  const { data: schulen = [], isLoading: schulenLoading } = useAllSchulen(
    activeTab === 'berufsschulen' && Object.keys(schulenFilters).length > 0 ? schulenFilters : undefined,
  );

  // Client-side filtering for Lehrstellen & Berufe tabs
  const lehrstellen = useMemo(() => {
    let result = rawLehrstellen;
    if (selectedCantons.length > 0) {
      result = result.filter((l) => selectedCantons.includes(l.canton));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q) ||
          l.companyName?.toLowerCase().includes(q) ||
          l.field?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [rawLehrstellen, selectedCantons, query]);

  const berufe = useMemo(() => {
    let result = rawBerufe;
    if (selectedField) {
      result = result.filter((b) => b.field === selectedField);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (b) =>
          b.nameDe.toLowerCase().includes(q) ||
          b.field?.toLowerCase().includes(q) ||
          b.descriptionDe?.toLowerCase().includes(q) ||
          b.educationType?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [rawBerufe, query, selectedField]);

  // Group schools by first letter for SectionList
  const schulenSections = useMemo(() => {
    const grouped: Record<string, Berufsschule[]> = {};
    for (const s of schulen) {
      const letter = (s.name || '?').charAt(0).toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(s);
    }
    return Object.keys(grouped)
      .sort()
      .map((letter) => ({ title: letter, data: grouped[letter] }));
  }, [schulen]);

  const toggleCanton = useCallback((code: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCantons((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  }, []);

  const isLoading =
    activeTab === 'lehrstellen'
      ? lehrstellenLoading
      : activeTab === 'berufe'
        ? berufeLoading
        : schulenLoading;

  const resultCount =
    activeTab === 'lehrstellen'
      ? lehrstellen.length
      : activeTab === 'berufe'
        ? berufe.length
        : schulen.length;

  const renderLehrstelleRow = useCallback(
    ({ item }: { item: ListingDTO }) => (
      <LehrstelleRow
        listing={item}
        onPress={() => {
          router.push(`/(app)/(student)/search/listing/${item.id}`);
        }}
      />
    ),
    [router],
  );

  const renderBerufRow = useCallback(
    ({ item }: { item: Beruf }) => (
      <BerufRow
        beruf={item}
        onPress={() => {
          router.push(`/(app)/(student)/berufe/${item.code}`);
        }}
      />
    ),
    [router],
  );

  const hasFilters =
    activeTab === 'berufe'
      ? query.length > 0 || selectedField !== null
      : query.length > 0 || selectedCantons.length > 0;

  const clearAllFilters = useCallback(() => {
    setQuery('');
    setSelectedCantons([]);
    setSelectedField(null);
  }, []);

  const renderList = () => {
    if (isLoading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (resultCount === 0) {
      return (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>Keine Ergebnisse</Text>
          <Text style={styles.emptyText}>
            Versuche andere Filter oder Suchbegriffe.
          </Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'lehrstellen':
        return (
          <FlatList
            data={lehrstellen}
            renderItem={renderLehrstelleRow}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'berufe':
        return (
          <FlatList
            data={berufe}
            renderItem={renderBerufRow}
            keyExtractor={(item) => item.code}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'berufsschulen':
        return (
          <SectionList
            sections={schulenSections}
            keyExtractor={(item) => item.id}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLetter}>{section.title}</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <Pressable
                style={styles.schulRow}
                onPress={() => router.push(`/(app)/(student)/search/school/${item.id}`)}
              >
                <View style={styles.schulIconCircle}>
                  <Ionicons name="school" size={18} color={colors.warning} />
                </View>
                <View style={styles.schulContent}>
                  <Text style={styles.schulName} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.schulMeta}>
                    <CantonBadge code={item.canton} size={16} />
                    <Text style={styles.schulLocation}>{item.city}, {item.canton}</Text>
                    {item.institutionalStatus && (
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{item.institutionalStatus}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </Pressable>
            )}
            stickySectionHeadersEnabled
            ListEmptyComponent={
              <View style={styles.center}>
                <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyTitle}>Keine Schulen gefunden</Text>
                <Text style={styles.emptyText}>Passe deine Suche oder Filter an.</Text>
              </View>
            }
            contentContainerStyle={styles.list}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Suche</Text>
        {activeTab === 'berufsschulen' && (
          <Text style={styles.headerSubtitle}>{schulen.length} Berufsschulen in der Schweiz</Text>
        )}
        {activeTab === 'berufe' && (
          <Text style={styles.headerSubtitle}>{berufe.length} Lehrberufe in der Schweiz</Text>
        )}
        {activeTab === 'lehrstellen' && (
          <Text style={styles.headerSubtitle}>{lehrstellen.length} Lehrstellen verfügbar</Text>
        )}
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={
              activeTab === 'lehrstellen'
                ? 'Lehrstelle suchen...'
                : activeTab === 'berufe'
                  ? 'Beruf suchen...'
                  : 'Schule oder Ort suchen...'
            }
            placeholderTextColor={colors.textTertiary}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Segment control */}
      <View style={styles.segmentContainer}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.segmentTab, isActive && styles.segmentTabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.segmentText,
                  isActive && styles.segmentTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Canton chips — for Lehrstellen tab only */}
      {activeTab === 'lehrstellen' && (
        <View style={styles.cantonSection}>
          <Text style={styles.cantonLabel}>Kanton</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cantonChipContainer}
          >
            {SWISS_CANTONS.map((c) => {
              const isSelected = selectedCantons.includes(c.code);
              return (
                <TouchableOpacity
                  key={c.code}
                  style={[styles.cantonChip, isSelected && styles.cantonChipSelected]}
                  onPress={() => toggleCanton(c.code)}
                  activeOpacity={0.7}
                >
                  <CantonBadge code={c.code} size={20} />
                  <Text
                    style={[
                      styles.cantonChipText,
                      isSelected && styles.cantonChipTextSelected,
                    ]}
                  >
                    {c.code}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Berufsfelder chips — horizontal scroll for Berufe tab */}
      {activeTab === 'berufe' && berufeFields.length > 0 && (
        <View style={styles.cantonSection}>
          <Text style={styles.cantonLabel}>Berufsfelder</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cantonChipContainer}
          >
            {berufeFields.map((f) => {
              const meta = getFieldMeta(f.field);
              const isActive = selectedField === f.field;
              return (
                <Pressable
                  key={f.field}
                  style={[styles.fieldChip, isActive && styles.fieldChipActive]}
                  onPress={() => setSelectedField(isActive ? null : f.field)}
                >
                  <Ionicons
                    name={meta.icon as any}
                    size={14}
                    color={isActive ? colors.white : meta.color}
                  />
                  <Text
                    style={[styles.fieldChipText, isActive && styles.fieldChipTextActive]}
                    numberOfLines={1}
                  >
                    {f.field}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Active filter indicator + count */}
      {!isLoading && (
        <View style={styles.resultCountRow}>
          <Text style={styles.resultCountText}>
            {resultCount} {resultCount === 1 ? 'Ergebnis' : 'Ergebnisse'}
          </Text>
          {hasFilters && (
            <Pressable onPress={clearAllFilters} style={styles.clearRow}>
              <Ionicons name="close-circle-outline" size={14} color={colors.primary} />
              <Text style={styles.resetFilterText}>Filter zurücksetzen</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Results */}
      {renderList()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: fontWeights.extraBold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Search bar
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
    padding: 0,
  },

  // Segment control
  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.md,
    padding: 3,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md - 2,
  },
  segmentTabActive: {
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  segmentText: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.medium,
    color: colors.textTertiary,
  },
  segmentTextActive: {
    fontWeight: fontWeights.bold,
    color: colors.text,
  },

  // Canton chips (Lehrstellen/Berufe)
  cantonSection: {
    paddingLeft: spacing.md,
    marginBottom: spacing.sm,
  },
  cantonLabel: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  cantonChipContainer: {
    paddingRight: spacing.md,
  },
  cantonChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    backgroundColor: colors.secondaryBackground,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    marginRight: spacing.sm,
  },
  cantonChipSelected: {
    backgroundColor: colors.primary,
  },
  cantonChipText: {
    fontSize: typography.caption,
    color: colors.text,
    fontWeight: fontWeights.medium,
  },
  cantonChipTextSelected: {
    color: colors.white,
  },

  // Berufsfelder chips (Berufe tab)
  fieldChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondaryBackground,
    marginRight: spacing.sm,
  },
  fieldChipActive: {
    backgroundColor: colors.primary,
  },
  fieldChipText: {
    fontSize: typography.caption,
    color: colors.text,
    fontWeight: fontWeights.medium,
  },
  fieldChipTextActive: {
    color: colors.white,
  },

  // Result count
  resultCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  resultCountText: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  resetFilterText: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },

  // Schulen SectionList
  sectionHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  sectionLetter: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
  schulRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  schulIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.warning + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  schulContent: { flex: 1 },
  schulName: {
    fontSize: typography.body,
    fontWeight: fontWeights.medium,
    color: colors.text,
  },
  schulMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 3,
  },
  schulLocation: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '12',
  },
  statusText: {
    fontSize: typography.tiny,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },

  // List
  list: {
    paddingBottom: spacing.xxxl + 40,
  },

  // Empty state
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  emptyText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
