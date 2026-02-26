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
import {
  LANGUAGE_PROFICIENCY_CONFIG,
  type LanguageProficiency,
} from '../../types/profile.types';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../constants/theme';

const PROFICIENCY_KEYS = Object.keys(LANGUAGE_PROFICIENCY_CONFIG) as LanguageProficiency[];

export default function SkillsLanguagesStep() {
  const {
    languages,
    skills,
    hobbies,
    addLanguage,
    removeLanguage,
    updateLanguage,
    addSkill,
    removeSkill,
    addHobby,
    removeHobby,
  } = useProfileBuilderStore();

  const [profPickerIndex, setProfPickerIndex] = useState<number | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [newHobby, setNewHobby] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      addSkill(newSkill);
      setNewSkill('');
    }
  };

  const handleAddHobby = () => {
    if (newHobby.trim()) {
      addHobby(newHobby);
      setNewHobby('');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Languages Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sprachen</Text>

        {languages.map((lang, index) => (
          <View key={lang.id} style={styles.languageCard}>
            <View style={styles.languageRow}>
              <View style={styles.languageNameField}>
                <TextInput
                  style={styles.input}
                  value={lang.name}
                  onChangeText={(v) => updateLanguage(index, 'name', v)}
                  placeholder="z.B. Deutsch"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="words"
                />
              </View>
              <Pressable
                style={styles.removeButton}
                onPress={() => removeLanguage(index)}
                hitSlop={8}
              >
                <Text style={styles.removeButtonText}>X</Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.proficiencyButton}
              onPress={() => setProfPickerIndex(index)}
            >
              <Text style={styles.proficiencyButtonText}>
                {LANGUAGE_PROFICIENCY_CONFIG[lang.proficiency]}
              </Text>
              <Text style={styles.chevron}>{'>'}</Text>
            </Pressable>
          </View>
        ))}

        <Pressable style={styles.addButton} onPress={addLanguage}>
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Sprache hinzufugen</Text>
        </Pressable>
      </View>

      {/* Skills Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fahigkeiten</Text>

        <View style={styles.tagInputRow}>
          <TextInput
            style={[styles.input, styles.tagInput]}
            value={newSkill}
            onChangeText={setNewSkill}
            placeholder="z.B. Microsoft Office"
            placeholderTextColor={colors.textTertiary}
            onSubmitEditing={handleAddSkill}
            returnKeyType="done"
          />
          <Pressable
            style={[styles.addTagButton, !newSkill.trim() && styles.addTagButtonDisabled]}
            onPress={handleAddSkill}
            disabled={!newSkill.trim()}
          >
            <Text style={styles.addTagButtonText}>+</Text>
          </Pressable>
        </View>

        {skills.length > 0 && (
          <View style={styles.tagsContainer}>
            {skills.map((skill) => (
              <View key={skill} style={styles.tag}>
                <Text style={styles.tagText}>{skill}</Text>
                <Pressable
                  onPress={() => removeSkill(skill)}
                  hitSlop={4}
                  style={styles.tagRemove}
                >
                  <Text style={styles.tagRemoveText}>x</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Hobbies Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hobbys</Text>

        <View style={styles.tagInputRow}>
          <TextInput
            style={[styles.input, styles.tagInput]}
            value={newHobby}
            onChangeText={setNewHobby}
            placeholder="z.B. Fussball, Lesen"
            placeholderTextColor={colors.textTertiary}
            onSubmitEditing={handleAddHobby}
            returnKeyType="done"
          />
          <Pressable
            style={[styles.addTagButton, !newHobby.trim() && styles.addTagButtonDisabled]}
            onPress={handleAddHobby}
            disabled={!newHobby.trim()}
          >
            <Text style={styles.addTagButtonText}>+</Text>
          </Pressable>
        </View>

        {hobbies.length > 0 && (
          <View style={styles.tagsContainer}>
            {hobbies.map((hobby) => (
              <View key={hobby} style={[styles.tag, styles.hobbyTag]}>
                <Text style={[styles.tagText, styles.hobbyTagText]}>{hobby}</Text>
                <Pressable
                  onPress={() => removeHobby(hobby)}
                  hitSlop={4}
                  style={styles.tagRemove}
                >
                  <Text style={[styles.tagRemoveText, styles.hobbyTagRemoveText]}>x</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Proficiency Picker Modal */}
      <Modal
        visible={profPickerIndex !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setProfPickerIndex(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sprachniveau wahlen</Text>
            <Pressable onPress={() => setProfPickerIndex(null)}>
              <Text style={styles.modalClose}>Fertig</Text>
            </Pressable>
          </View>
          <FlatList
            data={PROFICIENCY_KEYS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSelected =
                profPickerIndex !== null &&
                languages[profPickerIndex]?.proficiency === item;
              return (
                <Pressable
                  style={[styles.profItem, isSelected && styles.profItemSelected]}
                  onPress={() => {
                    if (profPickerIndex !== null) {
                      updateLanguage(profPickerIndex, 'proficiency', item);
                      setProfPickerIndex(null);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.profItemText,
                      isSelected && styles.profItemTextSelected,
                    ]}
                  >
                    {LANGUAGE_PROFICIENCY_CONFIG[item]}
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
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  // Language card
  languageCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 4,
    ...shadows.sm,
    gap: spacing.sm,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  languageNameField: {
    flex: 1,
  },
  proficiencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  proficiencyButtonText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: typography.body,
    color: colors.textTertiary,
  },

  // Inputs
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

  // Remove button
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

  // Add button
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

  // Tag input
  tagInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
  },
  addTagButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTagButtonDisabled: {
    opacity: 0.4,
  },
  addTagButtonText: {
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },

  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight + '25',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  tagText: {
    fontSize: typography.bodySmall,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  tagRemove: {
    marginLeft: spacing.xs,
  },
  tagRemoveText: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
  hobbyTag: {
    backgroundColor: colors.secondaryLight + '25',
  },
  hobbyTagText: {
    color: colors.secondary,
  },
  hobbyTagRemoveText: {
    color: colors.secondary,
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
  profItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  profItemSelected: {
    backgroundColor: colors.primaryLight + '20',
  },
  profItemText: {
    fontSize: typography.body,
    color: colors.text,
  },
  profItemTextSelected: {
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
});
