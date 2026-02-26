import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  FlatList,
} from 'react-native';
import { useProfileBuilderStore } from '../../stores/profileBuilder.store';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../constants/theme';

const SCHOOL_LEVELS = [
  'Sekundarschule',
  'Realschule',
  'Gymnasium',
  'Andere',
];

export default function EducationStep() {
  const { schools, addSchool, removeSchool, updateSchool } = useProfileBuilderStore();
  const [levelPickerIndex, setLevelPickerIndex] = useState<number | null>(null);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {schools.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Noch keine Schule hinzugefugt</Text>
          <Text style={styles.emptySubtitle}>
            Fuge deine aktuelle oder bisherige Schulen hinzu.
          </Text>
        </View>
      )}

      {schools.map((school, index) => (
        <View key={school.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardNumber}>Schule {index + 1}</Text>
            <Pressable
              style={styles.removeButton}
              onPress={() => removeSchool(index)}
              hitSlop={8}
            >
              <Text style={styles.removeButtonText}>X</Text>
            </Pressable>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Schulname</Text>
            <TextInput
              style={styles.input}
              value={school.name}
              onChangeText={(v) => updateSchool(index, 'name', v)}
              placeholder="Sekundarschule Muster"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Stufe</Text>
            <Pressable
              style={styles.pickerButton}
              onPress={() => setLevelPickerIndex(index)}
            >
              <Text style={styles.pickerButtonText}>
                {school.level || 'Stufe wahlen'}
              </Text>
              <Text style={styles.chevron}>{'>'}</Text>
            </Pressable>
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Startjahr</Text>
              <TextInput
                style={styles.input}
                value={school.startYear ? String(school.startYear) : ''}
                onChangeText={(v) => updateSchool(index, 'startYear', parseInt(v, 10) || 0)}
                placeholder="2020"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Endjahr</Text>
              <TextInput
                style={styles.input}
                value={school.endYear ? String(school.endYear) : ''}
                onChangeText={(v) => updateSchool(index, 'endYear', parseInt(v, 10) || 0)}
                placeholder="2023"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>
        </View>
      ))}

      <Pressable style={styles.addButton} onPress={addSchool}>
        <Text style={styles.addButtonIcon}>+</Text>
        <Text style={styles.addButtonText}>Schule hinzufugen</Text>
      </Pressable>

      {/* Level Picker Modal */}
      <Modal
        visible={levelPickerIndex !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setLevelPickerIndex(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Stufe wahlen</Text>
            <Pressable onPress={() => setLevelPickerIndex(null)}>
              <Text style={styles.modalClose}>Fertig</Text>
            </Pressable>
          </View>
          <FlatList
            data={SCHOOL_LEVELS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSelected =
                levelPickerIndex !== null && schools[levelPickerIndex]?.level === item;
              return (
                <Pressable
                  style={[styles.levelItem, isSelected && styles.levelItemSelected]}
                  onPress={() => {
                    if (levelPickerIndex !== null) {
                      updateSchool(levelPickerIndex, 'level', item);
                      setLevelPickerIndex(null);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.levelItemText,
                      isSelected && styles.levelItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardNumber: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.bold,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.errorLight + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.bold,
    color: colors.error,
  },
  field: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.body,
    color: colors.text,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfField: {
    flex: 1,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.background,
  },
  pickerButtonText: {
    fontSize: typography.body,
    color: colors.text,
  },
  chevron: {
    fontSize: typography.body,
    color: colors.textTertiary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  addButtonIcon: {
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
  addButtonText: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.primary,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  modalClose: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.primary,
  },
  levelItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  levelItemSelected: {
    backgroundColor: colors.primaryLight + '20',
  },
  levelItemText: {
    fontSize: typography.body,
    color: colors.text,
  },
  levelItemTextSelected: {
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
});
