import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAllBerufe, useBerufeFields } from '../../../../hooks/queries/useBerufe';
import { getFieldMeta } from '../../../../constants/mapCategories';
import { colors, typography, spacing, fontWeights, borderRadius, shadows } from '../../../../constants/theme';
import type { Beruf } from '../../../../types/beruf.types';

const TYPE_FILTERS = ['Alle', 'EFZ', 'EBA'] as const;

export default function BerufeDirectoryScreen() {
  const [search, setSearch] = useState('');
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<typeof TYPE_FILTERS[number]>('Alle');

  const filters = useMemo(() => {
    const f: Record<string, string> = {};
    if (search.length >= 2) f.q = search;
    if (selectedField) f.field = selectedField;
    if (selectedType !== 'Alle') f.type = selectedType;
    return f;
  }, [search, selectedField, selectedType]);

  const { data: berufe = [], isLoading } = useAllBerufe(
    Object.keys(filters).length > 0 ? filters : undefined,
  );
  const { data: fields = [] } = useBerufeFields();

  // Group by first letter for SectionList
  const sections = useMemo(() => {
    const grouped: Record<string, Beruf[]> = {};
    for (const b of berufe) {
      const letter = (b.nameDe || '?').charAt(0).toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(b);
    }
    return Object.keys(grouped)
      .sort()
      .map((letter) => ({ title: letter, data: grouped[letter] }));
  }, [berufe]);

  const handlePress = useCallback((code: string) => {
    router.push(`/berufe/${code}`);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch('');
    setSelectedField(null);
    setSelectedType('Alle');
  }, []);

  const hasFilters = search.length > 0 || selectedField || selectedType !== 'Alle';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Alle Berufe</Text>
        <Text style={styles.subtitle}>{berufe.length} Lehrberufe in der Schweiz</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Beruf suchen..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Type toggle */}
      <View style={styles.typeRow}>
        {TYPE_FILTERS.map((t) => (
          <Pressable
            key={t}
            style={[styles.typeChip, selectedType === t && styles.typeChipActive]}
            onPress={() => setSelectedType(t)}
          >
            <Text style={[styles.typeChipText, selectedType === t && styles.typeChipTextActive]}>
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Berufsfelder filter chips — horizontal scroll with icons */}
      <View style={styles.fieldSection}>
        <Text style={styles.fieldSectionTitle}>Berufsfelder</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.fieldChipContainer}
        >
          {fields.map((f) => {
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

      {/* Active filter indicator */}
      {hasFilters && (
        <Pressable style={styles.clearRow} onPress={clearFilters}>
          <Ionicons name="close-circle-outline" size={16} color={colors.primary} />
          <Text style={styles.clearText}>Filter zurücksetzen</Text>
        </Pressable>
      )}

      {/* List */}
      {isLoading && berufe.length === 0 ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} size="large" />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.code}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLetter}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => handlePress(item.code)}>
              <View style={styles.rowContent}>
                <Text style={styles.rowName} numberOfLines={1}>{item.nameDe}</Text>
                <View style={styles.rowMeta}>
                  {item.field && (
                    <View style={styles.fieldBadge}>
                      <Text style={styles.fieldBadgeText}>{item.field}</Text>
                    </View>
                  )}
                  {item.educationType && (
                    <Text style={styles.rowType}>{item.educationType}</Text>
                  )}
                  {item.durationYears && (
                    <Text style={styles.rowDuration}>{item.durationYears} J.</Text>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </Pressable>
          )}
          stickySectionHeadersEnabled
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>Keine Berufe gefunden</Text>
              <Text style={styles.emptyText}>Passe deine Suche oder Filter an.</Text>
            </View>
          }
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  title: { fontSize: typography.h2, fontWeight: fontWeights.bold, color: colors.text },
  subtitle: { fontSize: typography.bodySmall, color: colors.textSecondary, marginTop: 2 },

  searchRow: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  searchBox: {
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

  typeRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondaryBackground,
  },
  typeChipActive: { backgroundColor: colors.primary },
  typeChipText: { fontSize: typography.bodySmall, fontWeight: fontWeights.medium, color: colors.textSecondary },
  typeChipTextActive: { color: colors.white },

  // Berufsfelder section
  fieldSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  fieldSectionTitle: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  fieldChipContainer: {
    paddingRight: spacing.md,
  },
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

  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  clearText: { fontSize: typography.caption, color: colors.primary, fontWeight: fontWeights.medium },

  list: { paddingBottom: spacing.xxxl + 40 },
  loader: { flex: 1, justifyContent: 'center' },

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

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  rowContent: { flex: 1 },
  rowName: { fontSize: typography.body, fontWeight: fontWeights.medium, color: colors.text },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  fieldBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '12',
  },
  fieldBadgeText: { fontSize: typography.tiny, color: colors.primary, fontWeight: fontWeights.semiBold },
  rowType: { fontSize: typography.caption, color: colors.textSecondary },
  rowDuration: { fontSize: typography.caption, color: colors.textTertiary },

  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    gap: spacing.sm,
  },
  emptyTitle: { fontSize: typography.h4, fontWeight: fontWeights.semiBold, color: colors.text },
  emptyText: { fontSize: typography.body, color: colors.textTertiary },
});
