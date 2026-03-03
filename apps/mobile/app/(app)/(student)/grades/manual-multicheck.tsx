import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import {
  MULTICHECK_VARIANTS,
  MULTICHECK_SCHULISCHES_WISSEN,
  MULTICHECK_POTENZIAL,
} from '@lehrstellen/shared';
import type { SaveGradeRequest, MulticheckGrades } from '@lehrstellen/shared';
import api from '../../../../services/api';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../../../constants/theme';

export default function ManualMulticheckScreen() {
  const router = useRouter();
  const [variant, setVariant] = useState<string>(MULTICHECK_VARIANTS[0]);
  const [testDate, setTestDate] = useState('');
  const [schulischesWissen, setSchulischesWissen] = useState<Record<string, string>>({});
  const [potenzial, setPotenzial] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const updateScore = (
    setter: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    key: string,
    value: string,
  ) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (cleaned === '' || (Number(cleaned) >= 0 && Number(cleaned) <= 100)) {
      setter((prev) => ({ ...prev, [key]: cleaned }));
    }
  };

  const handleSave = async () => {
    const sw: Record<string, number | undefined> = {};
    const pot: Record<string, number | undefined> = {};
    let hasAny = false;

    for (const field of MULTICHECK_SCHULISCHES_WISSEN) {
      const raw = schulischesWissen[field.key];
      if (raw && raw !== '') {
        const num = parseInt(raw, 10);
        if (num < 0 || num > 100) {
          Alert.alert('Ungültige Wärt', `${field.label}: Muess zwüsche 0 und 100 si.`);
          return;
        }
        sw[field.key] = num;
        hasAny = true;
      }
    }

    for (const field of MULTICHECK_POTENZIAL) {
      const raw = potenzial[field.key];
      if (raw && raw !== '') {
        const num = parseInt(raw, 10);
        if (num < 0 || num > 100) {
          Alert.alert('Ungültige Wärt', `${field.label}: Muess zwüsche 0 und 100 si.`);
          return;
        }
        pot[field.key] = num;
        hasAny = true;
      }
    }

    if (!hasAny) {
      Alert.alert('Kei Wärt', 'Bitte trag mindestens ein Ergebnis ii.');
      return;
    }

    const grades: MulticheckGrades = {
      schulisches_wissen: sw as any,
      potenzial: pot as any,
    };

    const payload: SaveGradeRequest = {
      documentType: variant === 'Basic-Check' ? 'basic_check' : 'multicheck',
      entryMethod: 'manual',
      testVariant: variant,
      testDate: testDate || undefined,
      grades,
    };

    setIsSaving(true);
    try {
      await api.post('/grades', payload);
      Alert.alert('Gspeicheret!', 'Dis Testergebnis isch erfasst.', [
        { text: 'OK', onPress: () => router.dismiss(2) },
      ]);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Speichere hät nöd klappt.';
      Alert.alert('Fehler', msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Multicheck iiträge</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Metadata */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Angabe</Text>

            <View style={styles.pickerRow}>
              <Text style={styles.label}>Variante</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={variant}
                  onValueChange={setVariant}
                  style={styles.picker}
                >
                  {MULTICHECK_VARIANTS.map((v) => (
                    <Picker.Item key={v} label={v} value={v} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.pickerRow}>
              <Text style={styles.label}>Testdatum (optional)</Text>
              <TextInput
                style={styles.textInput}
                value={testDate}
                onChangeText={setTestDate}
                placeholder="z.B. 15.09.2025"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          {/* Schulisches Wissen */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schulisches Wissen</Text>
            <Text style={styles.sectionHint}>Wärt in Prozent (0-100%)</Text>

            {MULTICHECK_SCHULISCHES_WISSEN.map((field) => (
              <View key={field.key} style={styles.gradeRow}>
                <Text style={styles.gradeLabel}>{field.label}</Text>
                <View style={styles.percentInputWrapper}>
                  <TextInput
                    style={styles.gradeInput}
                    value={schulischesWissen[field.key] ?? ''}
                    onChangeText={(v) => updateScore(setSchulischesWissen, field.key, v)}
                    placeholder="–"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="number-pad"
                    maxLength={3}
                    returnKeyType="next"
                  />
                  <Text style={styles.percentSign}>%</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Potenzial */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Potenzial</Text>
            <Text style={styles.sectionHint}>Wärt in Prozent (0-100%)</Text>

            {MULTICHECK_POTENZIAL.map((field) => (
              <View key={field.key} style={styles.gradeRow}>
                <Text style={styles.gradeLabel}>{field.label}</Text>
                <View style={styles.percentInputWrapper}>
                  <TextInput
                    style={styles.gradeInput}
                    value={potenzial[field.key] ?? ''}
                    onChangeText={(v) => updateScore(setPotenzial, field.key, v)}
                    placeholder="–"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="number-pad"
                    maxLength={3}
                    returnKeyType="next"
                  />
                  <Text style={styles.percentSign}>%</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Save button */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Spichere</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  headerTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionHint: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  pickerRow: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  pickerWrapper: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  picker: {
    height: 44,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.body,
    color: colors.text,
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  gradeLabel: {
    flex: 1,
    fontSize: typography.bodySmall,
    color: colors.text,
  },
  percentInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  gradeInput: {
    width: 56,
    height: 40,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    textAlign: 'center',
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  percentSign: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
});
