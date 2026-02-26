import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { SWISS_CANTONS } from '@lehrstellen/shared';
import { BERUFSFELD_META } from '../../constants/mapCategories';
import {
  colors,
  typography,
  fontWeights,
  spacing,
  borderRadius,
  shadows,
} from '../../constants/theme';
import CantonBadge from '../ui/CantonBadge';

const BERUFSFELD_KEYS = Object.keys(BERUFSFELD_META);

export interface FeedFilters {
  cantons: string[];
  fields: string[];
  educationType: string;
  minCompatibility: number;
}

export const DEFAULT_FILTERS: FeedFilters = {
  cantons: [],
  fields: [],
  educationType: 'Alle',
  minCompatibility: 0,
};

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FeedFilters) => void;
  initialFilters: FeedFilters;
}

const EDUCATION_TYPES = ['Alle', 'EFZ', 'EBA'];
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FilterSheet({
  visible,
  onClose,
  onApply,
  initialFilters,
}: FilterSheetProps) {
  const [cantons, setCantons] = useState<string[]>(initialFilters.cantons);
  const [fields, setFields] = useState<string[]>(initialFilters.fields);
  const [educationType, setEducationType] = useState(initialFilters.educationType);
  const [minCompatibility, setMinCompatibility] = useState(
    initialFilters.minCompatibility,
  );

  const toggleCanton = (code: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCantons((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const toggleField = (field: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    );
  };

  const handleApply = () => {
    onApply({ cantons, fields, educationType, minCompatibility });
  };

  const handleReset = () => {
    setCantons([]);
    setFields([]);
    setEducationType('Alle');
    setMinCompatibility(0);
  };

  const decrementCompatibility = () => {
    setMinCompatibility((prev) => Math.max(0, prev - 10));
  };

  const incrementCompatibility = () => {
    setMinCompatibility((prev) => Math.min(100, prev + 10));
  };

  const activeFilterCount =
    cantons.length +
    fields.length +
    (educationType !== 'Alle' ? 1 : 0) +
    (minCompatibility > 0 ? 1 : 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handleRow}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filter</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.closeButton}>Schließen</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {/* Canton section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Kanton {cantons.length > 0 && `(${cantons.length})`}
              </Text>
              <View style={styles.chipContainer}>
                {SWISS_CANTONS.map((canton) => {
                  const isSelected = cantons.includes(canton.code);
                  return (
                    <Pressable
                      key={canton.code}
                      style={[styles.cantonChip, isSelected && styles.chipSelected]}
                      onPress={() => toggleCanton(canton.code)}
                    >
                      <CantonBadge code={canton.code} size={20} />
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {canton.code}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Field section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Berufsfeld {fields.length > 0 && `(${fields.length})`}
              </Text>
              <View style={styles.chipContainer}>
                {BERUFSFELD_KEYS.map((field) => {
                  const isSelected = fields.includes(field);
                  const meta = BERUFSFELD_META[field];
                  return (
                    <Pressable
                      key={field}
                      style={[styles.fieldChip, isSelected && { backgroundColor: meta.color }]}
                      onPress={() => toggleField(field)}
                    >
                      <Ionicons
                        name={meta.icon as any}
                        size={14}
                        color={isSelected ? colors.white : meta.color}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {field}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Education type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ausbildungstyp</Text>
              <View style={styles.chipContainer}>
                {EDUCATION_TYPES.map((type) => {
                  const isSelected = educationType === type;
                  return (
                    <Pressable
                      key={type}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => setEducationType(type)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Min compatibility */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Mindest-Kompatibilität: {minCompatibility}%
              </Text>
              <View style={styles.compatibilityRow}>
                <Pressable
                  style={styles.compatibilityButton}
                  onPress={decrementCompatibility}
                >
                  <Text style={styles.compatibilityButtonText}>-</Text>
                </Pressable>
                <View style={styles.compatibilityBarTrack}>
                  <View
                    style={[
                      styles.compatibilityBarFill,
                      { width: `${minCompatibility}%` },
                    ]}
                  />
                </View>
                <Pressable
                  style={styles.compatibilityButton}
                  onPress={incrementCompatibility}
                >
                  <Text style={styles.compatibilityButtonText}>+</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>

          {/* Footer actions */}
          <View style={styles.footer}>
            <Pressable onPress={handleReset} style={styles.resetButton}>
              <Text style={styles.resetText}>Zurücksetzen</Text>
            </Pressable>
            <Pressable onPress={handleApply} style={styles.applyButton}>
              <Text style={styles.applyText}>
                Anwenden
                {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.h2,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  closeButton: {
    fontSize: typography.body,
    fontWeight: fontWeights.medium,
    color: colors.primary,
  },
  scrollContent: {
    flexGrow: 0,
  },
  scrollContentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondaryBackground,
  },
  fieldChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondaryBackground,
  },
  cantonChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondaryBackground,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.white,
  },
  compatibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  compatibilityButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  compatibilityButtonText: {
    fontSize: typography.h2,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },
  compatibilityBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  compatibilityBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resetButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  resetText: {
    fontSize: typography.body,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.md,
    minHeight: 52,
    justifyContent: 'center' as const,
  },
  applyText: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.white,
  },
});
