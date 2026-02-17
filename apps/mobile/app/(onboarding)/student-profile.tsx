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

export default function StudentProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [canton, setCanton] = useState('ZH');
  const [city, setCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !dateOfBirth.trim() || !city.trim()) {
      Alert.alert('Fehler', 'Bitte fuellen Sie alle Pflichtfelder aus.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/students/profile', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        canton,
        city: city.trim(),
      });

      if (user) {
        setUser({ ...user, hasProfile: true });
      }

      router.replace('/(onboarding)/quiz');
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
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.stepLabel}>Schritt 1 von 3</Text>
            <Text style={styles.title}>Erzaehl uns von dir</Text>
            <Text style={styles.subtitle}>
              Diese Infos helfen uns, die besten Lehrstellen fuer dich zu finden.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Vorname"
              placeholder="Max"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
            <Input
              label="Nachname"
              placeholder="Muster"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
            <Input
              label="Geburtsdatum"
              placeholder="2008-05-15"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              keyboardType="numbers-and-punctuation"
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Kanton</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
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
              label="Stadt / Ort"
              placeholder="Zuerich"
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
            />

            <Button
              title="Weiter zum Quiz"
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
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  stepLabel: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semiBold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
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
    paddingBottom: spacing.xl,
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
