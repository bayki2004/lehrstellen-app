import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APPRENTICESHIP_FIELDS } from '@lehrstellen/shared';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../constants/theme';

export default function FieldsScreen() {
  const router = useRouter();
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field],
    );
  };

  const handleSubmit = async () => {
    if (selectedFields.length === 0) {
      Alert.alert('Hinweis', 'Bitte waehle mindestens ein Berufsfeld aus.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put('/students/me', {
        desiredFields: selectedFields,
      });

      router.replace('/');
    } catch (error: any) {
      Alert.alert(
        'Fehler',
        error.response?.data?.message || 'Felder konnten nicht gespeichert werden.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>Zurueck</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.stepLabel}>Schritt 3 von 3</Text>
        <Text style={styles.title}>Was interessiert dich?</Text>
        <Text style={styles.subtitle}>
          Waehle die Berufsfelder aus, die dich interessieren. Du kannst mehrere auswaehlen.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.fieldsGrid}
        showsVerticalScrollIndicator={false}
      >
        {APPRENTICESHIP_FIELDS.map((field) => {
          const isSelected = selectedFields.includes(field);
          return (
            <TouchableOpacity
              key={field}
              style={[styles.fieldChip, isSelected && styles.fieldChipSelected]}
              onPress={() => toggleField(field)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.fieldChipText,
                  isSelected && styles.fieldChipTextSelected,
                ]}
              >
                {field}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.selectionCount}>
          {selectedFields.length} ausgewaehlt
        </Text>
        <Button
          title="Weiter"
          onPress={handleSubmit}
          loading={isSubmitting}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    paddingTop: spacing.md,
    marginBottom: spacing.sm,
  },
  backText: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
  header: {
    paddingTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  stepLabel: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semiBold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  fieldsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  fieldChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  fieldChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  fieldChipText: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
  },
  fieldChipTextSelected: {
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
  footer: {
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  selectionCount: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
