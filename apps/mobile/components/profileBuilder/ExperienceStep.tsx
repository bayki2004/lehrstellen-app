import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useProfileBuilderStore } from '../../stores/profileBuilder.store';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../constants/theme';

export default function ExperienceStep() {
  const {
    schnupperlehren,
    addSchnupperlehre,
    removeSchnupperlehre,
    updateSchnupperlehre,
  } = useProfileBuilderStore();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {schnupperlehren.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Noch keine Schnupperlehre</Text>
          <Text style={styles.emptySubtitle}>
            Hast du schon einmal geschnuppert? Fuge deine Erfahrungen hinzu.
          </Text>
        </View>
      )}

      {schnupperlehren.map((entry, index) => (
        <View key={entry.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardNumber}>Schnupperlehre {index + 1}</Text>
            <Pressable
              style={styles.removeButton}
              onPress={() => removeSchnupperlehre(index)}
              hitSlop={8}
            >
              <Text style={styles.removeButtonText}>X</Text>
            </Pressable>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Firma</Text>
            <TextInput
              style={styles.input}
              value={entry.companyName}
              onChangeText={(v) => updateSchnupperlehre(index, 'companyName', v)}
              placeholder="Firmenname"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Beruf</Text>
            <TextInput
              style={styles.input}
              value={entry.beruf}
              onChangeText={(v) => updateSchnupperlehre(index, 'beruf', v)}
              placeholder="z.B. Informatiker/in EFZ"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Datum</Text>
              <TextInput
                style={styles.input}
                value={entry.date}
                onChangeText={(v) => updateSchnupperlehre(index, 'date', v)}
                placeholder="MM.JJJJ"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                maxLength={7}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Kanton</Text>
              <TextInput
                style={styles.input}
                value={entry.canton}
                onChangeText={(v) => updateSchnupperlehre(index, 'canton', v)}
                placeholder="ZH"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="characters"
                maxLength={2}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Notizen (optional)</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={entry.notes || ''}
              onChangeText={(v) => updateSchnupperlehre(index, 'notes', v)}
              placeholder="Was hast du gelernt? Was hat dir gefallen?"
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>
      ))}

      <Pressable style={styles.addButton} onPress={addSchnupperlehre}>
        <Text style={styles.addButtonIcon}>+</Text>
        <Text style={styles.addButtonText}>Schnupperlehre hinzufugen</Text>
      </Pressable>
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
    paddingHorizontal: spacing.md,
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
    color: colors.secondary,
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
  multiline: {
    minHeight: 80,
    paddingTop: spacing.sm + 2,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  halfField: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  addButtonIcon: {
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
    color: colors.secondary,
  },
  addButtonText: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.secondary,
  },
});
