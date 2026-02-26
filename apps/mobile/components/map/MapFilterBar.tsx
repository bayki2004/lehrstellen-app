import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
} from '../../constants/theme';
import { MAP_CATEGORIES } from '../../constants/mapCategories';

const RADIUS_OPTIONS = [5, 10, 25, 50];

interface MapFilterBarProps {
  selectedCategories: string[];
  showSchools: boolean;
  radiusKm: number;
  onToggleCategory: (category: string) => void;
  onToggleSchools: () => void;
  onSetRadius: (km: number) => void;
  onClose?: () => void;
}

export default function MapFilterBar({
  selectedCategories,
  showSchools,
  radiusKm,
  onToggleCategory,
  onToggleSchools,
  onSetRadius,
  onClose,
}: MapFilterBarProps) {

  const [showRadiusDropdown, setShowRadiusDropdown] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Schools toggle */}
        <Pressable
          style={[styles.chip, showSchools && styles.chipActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggleSchools();
          }}
        >
          <Text style={styles.chipIcon}>🎓</Text>
          <Text
            style={[
              styles.chipLabel,
              showSchools && styles.chipLabelActive,
            ]}
          >
            Schulen
          </Text>
        </Pressable>

        {/* Radius dropdown */}
        <Pressable
          style={styles.chip}
          onPress={() => setShowRadiusDropdown(true)}
        >
          <Text style={styles.chipIcon}>📍</Text>
          <Text style={styles.chipLabel}>{radiusKm} km</Text>
        </Pressable>

        {/* Category chips */}
        {MAP_CATEGORIES.map((cat) => {
          const isSelected = selectedCategories.includes(cat.key);
          return (
            <Pressable
              key={cat.key}
              style={[
                styles.chip,
                isSelected && {
                  backgroundColor: cat.color + '20',
                  borderColor: cat.color,
                  borderWidth: 1.5,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onToggleCategory(cat.key);
              }}
            >
              <Text style={styles.chipIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.chipLabel,
                  isSelected && { color: cat.color, fontWeight: fontWeights.semiBold },
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Done button (shown inside filter modal) */}
      {onClose && (
        <Pressable style={styles.doneButton} onPress={onClose}>
          <Text style={styles.doneButtonText}>Fertig</Text>
        </Pressable>
      )}

      {/* Radius picker modal */}
      <Modal
        visible={showRadiusDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRadiusDropdown(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowRadiusDropdown(false)}
        >
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Umkreis</Text>
            {RADIUS_OPTIONS.map((km) => (
              <Pressable
                key={km}
                style={[
                  styles.dropdownItem,
                  km === radiusKm && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  onSetRadius(km);
                  setShowRadiusDropdown(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    km === radiusKm && styles.dropdownItemTextActive,
                  ]}
                >
                  {km} km
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Transparent — no background, border, or shadow
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 0,
    borderColor: 'transparent',
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  chipActive: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  chipIcon: {
    fontSize: typography.bodySmall,
  },
  chipLabel: {
    fontSize: typography.caption,
    color: colors.text,
    fontWeight: fontWeights.medium,
  },
  chipLabelActive: {
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },

  // Done button
  doneButton: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
  },
  doneButtonText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
  },

  // Radius dropdown modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  dropdownTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  dropdownItem: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  dropdownItemActive: {
    backgroundColor: colors.primary + '15',
  },
  dropdownItemText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: fontWeights.medium,
  },
  dropdownItemTextActive: {
    color: colors.primary,
    fontWeight: fontWeights.bold,
  },
});
