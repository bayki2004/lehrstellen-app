import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useProfileBuilderStore } from '../../stores/profileBuilder.store';
import { colors, typography, spacing, borderRadius, fontWeights } from '../../constants/theme';

const MAX_LENGTH = 1000;

export default function MotivationLetterStep() {
  const { motivationLetter, updateField } = useProfileBuilderStore();

  const charCount = motivationLetter.length;
  const isNearLimit = charCount > MAX_LENGTH * 0.9;
  const isOverLimit = charCount >= MAX_LENGTH;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Dein Motivationsschreiben</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textArea}
          value={motivationLetter}
          onChangeText={(v) => {
            if (v.length <= MAX_LENGTH) {
              updateField('motivationLetter', v);
            }
          }}
          placeholder="Erzahle etwas uber dich und deine Motivation..."
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={MAX_LENGTH}
          textAlignVertical="top"
          scrollEnabled
        />

        <View style={styles.charCountRow}>
          <Text
            style={[
              styles.charCount,
              isNearLimit && styles.charCountWarning,
              isOverLimit && styles.charCountError,
            ]}
          >
            {charCount} / {MAX_LENGTH}
          </Text>
        </View>
      </View>

      <View style={styles.hintsCard}>
        <Text style={styles.hintsTitle}>Das kannst du schreiben</Text>
        <Text style={styles.hintItem}>{'\u2022  '}Warum interessiert dich diese Berufsrichtung?</Text>
        <Text style={styles.hintItem}>{'\u2022  '}Was sind deine Starken?</Text>
        <Text style={styles.hintItem}>{'\u2022  '}Was motiviert dich jeden Tag?</Text>
        <Text style={styles.hintItem}>{'\u2022  '}Was mochtest du in Zukunft erreichen?</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  label: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  textArea: {
    minHeight: 200,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  charCountRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  charCount: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  charCountWarning: {
    color: colors.warning,
  },
  charCountError: {
    color: colors.error,
  },
  hintsCard: {
    backgroundColor: colors.primaryLight + '15',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  hintsTitle: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  hintItem: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
