import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { SWISS_CANTONS } from '@lehrstellen/shared';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../stores/auth.store';
import api from '../../services/api';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../constants/theme';

const COMPANY_SIZES = [
  { label: '1-10 Mitarbeiter', value: 'MICRO' },
  { label: '11-50 Mitarbeiter', value: 'SMALL' },
  { label: '51-250 Mitarbeiter', value: 'MEDIUM' },
  { label: '250+ Mitarbeiter', value: 'LARGE' },
];

const INDUSTRIES = [
  'Technologie',
  'Gesundheit',
  'Finanzen',
  'Bildung',
  'Handel',
  'Handwerk',
  'Industrie',
  'Gastronomie',
  'Bau',
  'Andere',
];

export default function CompanyProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('Technologie');
  const [companySize, setCompanySize] = useState('SMALL');
  const [canton, setCanton] = useState('ZH');
  const [city, setCity] = useState('');
  const [contactPersonName, setContactPersonName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (
      !companyName.trim() ||
      !description.trim() ||
      !city.trim() ||
      !contactPersonName.trim()
    ) {
      Alert.alert('Fehler', 'Bitte fuellen Sie alle Pflichtfelder aus.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/companies/me', {
        companyName: companyName.trim(),
        description: description.trim(),
        industry,
        companySize,
        canton,
        city: city.trim(),
        contactPersonName: contactPersonName.trim(),
      });

      if (user) {
        setUser({ ...user, hasProfile: true });
      }

      router.replace('/');
    } catch (error: any) {
      Alert.alert(
        'Fehler',
        error.response?.data?.message || 'Profil konnte nicht erstellt werden.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>Zurueck</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Unternehmensprofil</Text>
            <Text style={styles.subtitle}>
              Erstellen Sie Ihr Unternehmensprofil, um Lehrstellen zu publizieren.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Firmenname *"
              placeholder="Muster AG"
              value={companyName}
              onChangeText={setCompanyName}
              autoCapitalize="words"
              autoCorrect={false}
            />

            <Input
              label="Beschreibung *"
              placeholder="Beschreiben Sie Ihr Unternehmen..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Branche</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
                keyboardShouldPersistTaps="always"
                nestedScrollEnabled
              >
                {INDUSTRIES.map((ind) => (
                  <TouchableOpacity
                    key={ind}
                    style={[styles.chip, industry === ind && styles.chipSelected]}
                    onPress={() => setIndustry(ind)}
                  >
                    <Text style={[styles.chipText, industry === ind && styles.chipTextSelected]}>
                      {ind}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Unternehmensgroesse</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
                keyboardShouldPersistTaps="always"
                nestedScrollEnabled
              >
                {COMPANY_SIZES.map((size) => (
                  <TouchableOpacity
                    key={size.value}
                    style={[styles.chip, companySize === size.value && styles.chipSelected]}
                    onPress={() => setCompanySize(size.value)}
                  >
                    <Text style={[styles.chipText, companySize === size.value && styles.chipTextSelected]}>
                      {size.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Kanton</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
                keyboardShouldPersistTaps="always"
                nestedScrollEnabled
              >
                {SWISS_CANTONS.map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    style={[styles.chip, canton === c.code && styles.chipSelected]}
                    onPress={() => setCanton(c.code)}
                  >
                    <Text style={[styles.chipText, canton === c.code && styles.chipTextSelected]}>
                      {c.code}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Input
              label="Stadt / Ort *"
              placeholder="Zuerich"
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
              autoCorrect={false}
            />

            <Input
              label="Kontaktperson *"
              placeholder="Hans Muster"
              value={contactPersonName}
              onChangeText={setContactPersonName}
              autoCapitalize="words"
              autoCorrect={false}
            />

            <Button
              title="Profil erstellen"
              onPress={handleSubmit}
              loading={isSubmitting}
              variant="primary"
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  backText: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
  header: {
    marginBottom: spacing.xl,
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
  form: {
    gap: spacing.md,
  },
  pickerContainer: {
    gap: spacing.xs,
  },
  pickerLabel: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.medium,
    color: colors.text,
  },
  chipScroll: {
    flexGrow: 0,
  },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    marginTop: spacing.lg,
  },
});
