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
import { SWISS_CANTONS } from '@lehrstellen/shared';
import { colors, typography, spacing, borderRadius, fontWeights } from '../../constants/theme';

export default function PersonalInfoStep() {
  const {
    firstName,
    lastName,
    dateOfBirth,
    canton,
    city,
    school,
    nationality,
    updateField,
  } = useProfileBuilderStore();

  const [showCantonPicker, setShowCantonPicker] = useState(false);

  const selectedCantonName = SWISS_CANTONS.find((c) => c.code === canton)?.name || '';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Vorname *</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={(v) => updateField('firstName', v)}
            placeholder="Max"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="words"
          />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>Nachname *</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={(v) => updateField('lastName', v)}
            placeholder="Muster"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="words"
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Geburtsdatum</Text>
        <TextInput
          style={styles.input}
          value={dateOfBirth}
          onChangeText={(v) => updateField('dateOfBirth', v)}
          placeholder="TT.MM.JJJJ"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numeric"
          maxLength={10}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Kanton *</Text>
        <Pressable
          style={styles.pickerButton}
          onPress={() => setShowCantonPicker(true)}
        >
          <Text
            style={[
              styles.pickerButtonText,
              !canton && styles.pickerPlaceholder,
            ]}
          >
            {selectedCantonName || 'Kanton auswahlen'}
          </Text>
          <Text style={styles.chevron}>{'>'}</Text>
        </Pressable>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Ort</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={(v) => updateField('city', v)}
          placeholder="Zurich"
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Schule</Text>
        <TextInput
          style={styles.input}
          value={school}
          onChangeText={(v) => updateField('school', v)}
          placeholder="Sekundarschule Musterstadt"
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Nationalitat</Text>
        <TextInput
          style={styles.input}
          value={nationality}
          onChangeText={(v) => updateField('nationality', v)}
          placeholder="Schweiz"
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="words"
        />
      </View>

      {/* Canton Picker Modal */}
      <Modal
        visible={showCantonPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCantonPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kanton auswahlen</Text>
            <Pressable onPress={() => setShowCantonPicker(false)}>
              <Text style={styles.modalClose}>Fertig</Text>
            </Pressable>
          </View>
          <FlatList
            data={SWISS_CANTONS}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.cantonItem,
                  canton === item.code && styles.cantonItemSelected,
                ]}
                onPress={() => {
                  updateField('canton', item.code);
                  setShowCantonPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.cantonItemText,
                    canton === item.code && styles.cantonItemTextSelected,
                  ]}
                >
                  {item.name}
                </Text>
                <Text style={styles.cantonCode}>{item.code}</Text>
              </Pressable>
            )}
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
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfField: {
    flex: 1,
  },
  field: {},
  label: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.surface,
  },
  pickerButtonText: {
    fontSize: typography.body,
    color: colors.text,
  },
  pickerPlaceholder: {
    color: colors.textTertiary,
  },
  chevron: {
    fontSize: typography.body,
    color: colors.textTertiary,
  },

  // Modal styles
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
  cantonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  cantonItemSelected: {
    backgroundColor: colors.primaryLight + '20',
  },
  cantonItemText: {
    fontSize: typography.body,
    color: colors.text,
  },
  cantonItemTextSelected: {
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
  cantonCode: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
});
