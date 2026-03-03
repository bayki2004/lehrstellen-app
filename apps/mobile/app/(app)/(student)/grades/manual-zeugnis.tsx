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
import { getZeugnisSubjects, NIVEAUS } from '@lehrstellen/shared';
import type { SaveGradeRequest, ZeugnisGrades } from '@lehrstellen/shared';
import { SWISS_CANTONS } from '@lehrstellen/shared';
import api from '../../../../services/api';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../../../constants/theme';

const CURRENT_YEAR = new Date().getFullYear();
const SCHOOL_YEARS = Array.from({ length: 5 }, (_, i) => {
  const y = CURRENT_YEAR - i;
  return `${y}/${y + 1}`;
});

export default function ManualZeugnisScreen() {
  const router = useRouter();
  const [canton, setCanton] = useState('ZH');
  const [niveau, setNiveau] = useState('Sek A');
  const [semester, setSemester] = useState(1);
  const [schoolYear, setSchoolYear] = useState(SCHOOL_YEARS[0]);
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const subjects = getZeugnisSubjects(canton);

  const updateGrade = (key: string, value: string) => {
    // Allow empty, digits, comma, period
    const cleaned = value.replace(',', '.');
    if (cleaned === '' || /^\d\.?\d?$/.test(cleaned)) {
      setGrades((prev) => ({ ...prev, [key]: cleaned }));
    }
  };

  const handleSave = async () => {
    // Build grades object
    const gradeValues: ZeugnisGrades = {};
    let hasAnyGrade = false;

    for (const subject of subjects) {
      const raw = grades[subject.key];
      if (raw && raw !== '') {
        const num = parseFloat(raw);
        if (isNaN(num) || num < 1 || num > 6) {
          Alert.alert('Ungültigi Note', `${subject.label}: Note muess zwüsche 1 und 6 si.`);
          return;
        }
        // Round to nearest 0.5
        gradeValues[subject.key] = Math.round(num * 2) / 2;
        hasAnyGrade = true;
      }
    }

    if (!hasAnyGrade) {
      Alert.alert('Kei Noote', 'Bitte trag mindestens eini Note ii.');
      return;
    }

    const payload: SaveGradeRequest = {
      documentType: 'zeugnis',
      entryMethod: 'manual',
      canton,
      niveau,
      semester,
      schoolYear,
      grades: gradeValues,
    };

    setIsSaving(true);
    try {
      await api.post('/grades', payload);
      Alert.alert('Gspeicheret!', 'Dini Noote sind erfasst.', [
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
          <Text style={styles.headerTitle}>Zeugnis iiträge</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Metadata section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Angabe</Text>

            <View style={styles.pickerRow}>
              <Text style={styles.label}>Kanton</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={canton}
                  onValueChange={setCanton}
                  style={styles.picker}
                >
                  {SWISS_CANTONS.map((c) => (
                    <Picker.Item key={c.code} label={`${c.code} – ${c.name}`} value={c.code} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.pickerRow}>
              <Text style={styles.label}>Niveau</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={niveau}
                  onValueChange={setNiveau}
                  style={styles.picker}
                >
                  {NIVEAUS.map((n) => (
                    <Picker.Item key={n} label={n} value={n} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.pickerRow}>
              <Text style={styles.label}>Semester</Text>
              <View style={styles.segmentRow}>
                {[1, 2].map((s) => (
                  <Pressable
                    key={s}
                    style={[styles.segment, semester === s && styles.segmentActive]}
                    onPress={() => setSemester(s)}
                  >
                    <Text style={[styles.segmentText, semester === s && styles.segmentTextActive]}>
                      {s}. Semester
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.pickerRow}>
              <Text style={styles.label}>Schueljahr</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={schoolYear}
                  onValueChange={setSchoolYear}
                  style={styles.picker}
                >
                  {SCHOOL_YEARS.map((y) => (
                    <Picker.Item key={y} label={y} value={y} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Grades section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Noote (1-6)</Text>
            <Text style={styles.sectionHint}>
              Lass Fächer leer, wo du kei Note hesch.
            </Text>

            {subjects.map((subject) => (
              <View key={subject.key} style={styles.gradeRow}>
                <Text style={styles.gradeLabel} numberOfLines={1}>
                  {subject.label}
                </Text>
                <TextInput
                  style={styles.gradeInput}
                  value={grades[subject.key] ?? ''}
                  onChangeText={(v) => updateGrade(subject.key, v)}
                  placeholder="–"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  maxLength={3}
                  returnKeyType="next"
                />
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
    marginBottom: spacing.sm,
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
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.white,
    fontWeight: fontWeights.bold,
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
