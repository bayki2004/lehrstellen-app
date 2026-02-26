import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { SWISS_CANTONS } from '@lehrstellen/shared';
import { MAP_CATEGORIES } from '../../constants/mapCategories';
import CantonBadge from '../ui/CantonBadge';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
} from '../../constants/theme';

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];
const DURATION_OPTIONS = [2, 3, 4];
const SCHOOL_LEVEL_OPTIONS = ['Sek A', 'Sek B', 'Sek C'];

export interface MapFilters {
  selectedCategories: string[];
  showSchools: boolean;
  radiusKm: number;
  selectedCantons: string[];
  selectedDurations: number[];
  selectedSchoolLevels: string[];
}

interface MapFilterScreenProps {
  filters: MapFilters;
  onUpdateFilters: (filters: Partial<MapFilters>) => void;
  onReset: () => void;
  onClose: () => void;
  activeFilterCount: number;
}

export default function MapFilterScreen({
  filters,
  onUpdateFilters,
  onReset,
  onClose,
  activeFilterCount,
}: MapFilterScreenProps) {
  const insets = useSafeAreaInsets();

  const toggleCategory = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = filters.selectedCategories;
    const updated = current.includes(key)
      ? current.filter((c) => c !== key)
      : [...current, key];
    onUpdateFilters({ selectedCategories: updated });
  };

  const toggleCanton = (code: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = filters.selectedCantons;
    const updated = current.includes(code)
      ? current.filter((c) => c !== code)
      : [...current, code];
    onUpdateFilters({ selectedCantons: updated });
  };

  const toggleDuration = (years: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = filters.selectedDurations;
    const updated = current.includes(years)
      ? current.filter((d) => d !== years)
      : [...current, years];
    onUpdateFilters({ selectedDurations: updated });
  };

  const toggleSchoolLevel = (level: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = filters.selectedSchoolLevels;
    const updated = current.includes(level)
      ? current.filter((l) => l !== level)
      : [...current, level];
    onUpdateFilters({ selectedSchoolLevels: updated });
  };

  const selectAllCategories = () => {
    onUpdateFilters({ selectedCategories: MAP_CATEGORIES.map((c) => c.key) });
  };

  const deselectAllCategories = () => {
    onUpdateFilters({ selectedCategories: [] });
  };

  const allCategoriesSelected =
    filters.selectedCategories.length === MAP_CATEGORIES.length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.closeText}>Abbrechen</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Filter</Text>
        <Pressable onPress={onReset} hitSlop={12}>
          <Text style={styles.resetText}>Zurücksetzen</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Berufsfeld ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Berufsfeld</Text>
            <Pressable
              onPress={allCategoriesSelected ? deselectAllCategories : selectAllCategories}
            >
              <Text style={styles.sectionAction}>
                {allCategoriesSelected ? 'Keine' : 'Alle'}
              </Text>
            </Pressable>
          </View>
          <View style={styles.chipGrid}>
            {MAP_CATEGORIES.map((cat) => {
              const isSelected = filters.selectedCategories.includes(cat.key);
              return (
                <Pressable
                  key={cat.key}
                  style={[
                    styles.categoryChip,
                    isSelected && {
                      backgroundColor: cat.color + '18',
                      borderColor: cat.color,
                    },
                  ]}
                  onPress={() => toggleCategory(cat.key)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      isSelected && { color: cat.color, fontWeight: fontWeights.semiBold },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Entfernung ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entfernung</Text>
          <Text style={styles.sectionSubtitle}>
            Maximaler Umkreis von deinem Standort
          </Text>
          <View style={styles.chipRow}>
            {RADIUS_OPTIONS.map((km) => {
              const isSelected = filters.radiusKm === km;
              return (
                <Pressable
                  key={km}
                  style={[styles.optionChip, isSelected && styles.optionChipActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onUpdateFilters({ radiusKm: km });
                  }}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      isSelected && styles.optionChipTextActive,
                    ]}
                  >
                    {km} km
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Kanton ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kanton</Text>
            {filters.selectedCantons.length > 0 && (
              <Pressable onPress={() => onUpdateFilters({ selectedCantons: [] })}>
                <Text style={styles.sectionAction}>Alle löschen</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.chipGrid}>
            {SWISS_CANTONS.map((c) => {
              const isSelected = filters.selectedCantons.includes(c.code);
              return (
                <Pressable
                  key={c.code}
                  style={[styles.cantonChip, isSelected && styles.cantonChipActive]}
                  onPress={() => toggleCanton(c.code)}
                >
                  <CantonBadge code={c.code} size={18} />
                  <Text
                    style={[
                      styles.cantonChipText,
                      isSelected && styles.cantonChipTextActive,
                    ]}
                  >
                    {c.code}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Lehrdauer ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lehrdauer</Text>
          <View style={styles.chipRow}>
            {DURATION_OPTIONS.map((years) => {
              const isSelected = filters.selectedDurations.includes(years);
              return (
                <Pressable
                  key={years}
                  style={[styles.optionChip, isSelected && styles.optionChipActive]}
                  onPress={() => toggleDuration(years)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      isSelected && styles.optionChipTextActive,
                    ]}
                  >
                    {years} Jahre
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Schulniveau ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schulniveau</Text>
          <Text style={styles.sectionSubtitle}>
            Zeigt nur Lehrstellen, die dein Niveau akzeptieren
          </Text>
          <View style={styles.chipRow}>
            {SCHOOL_LEVEL_OPTIONS.map((level) => {
              const isSelected = filters.selectedSchoolLevels.includes(level);
              return (
                <Pressable
                  key={level}
                  style={[styles.optionChip, isSelected && styles.optionChipActive]}
                  onPress={() => toggleSchoolLevel(level)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      isSelected && styles.optionChipTextActive,
                    ]}
                  >
                    {level}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Berufsschulen ── */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.sectionTitle}>Berufsschulen anzeigen</Text>
              <Text style={styles.sectionSubtitle}>
                Zeigt Berufsschulen auf der Karte
              </Text>
            </View>
            <Switch
              value={filters.showSchools}
              onValueChange={(val) => onUpdateFilters({ showSchools: val })}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={filters.showSchools ? colors.primary : colors.textTertiary}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Pressable style={styles.applyButton} onPress={onClose}>
          <Text style={styles.applyButtonText}>
            {activeFilterCount > 0
              ? `Filter anwenden (${activeFilterCount})`
              : 'Filter anwenden'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  closeText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
  headerTitle: {
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  resetText: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.md,
  },

  // Section
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  sectionAction: {
    fontSize: typography.bodySmall,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },

  // Category chips (wrap grid)
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondaryBackground,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  categoryIcon: {
    fontSize: typography.bodySmall,
  },
  categoryLabel: {
    fontSize: typography.caption,
    color: colors.text,
    fontWeight: fontWeights.medium,
  },

  // Option chips (single-row)
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondaryBackground,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionChipActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  optionChipText: {
    fontSize: typography.bodySmall,
    color: colors.text,
    fontWeight: fontWeights.medium,
  },
  optionChipTextActive: {
    color: colors.primary,
    fontWeight: fontWeights.bold,
  },

  // Canton chips
  cantonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondaryBackground,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cantonChipActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  cantonChipText: {
    fontSize: typography.caption,
    color: colors.text,
    fontWeight: fontWeights.medium,
  },
  cantonChipTextActive: {
    color: colors.primary,
    fontWeight: fontWeights.bold,
  },

  // Toggle row
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
});
