import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CULTURE_DIMENSIONS } from '@lehrstellen/shared';
import type { CultureScores, CultureDealbreakers, CompanyCulturePresetDTO } from '@lehrstellen/shared';
import CultureSlider from '../../components/ui/CultureSlider';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { colors, typography, fontWeights, spacing } from '../../constants/theme';

export default function CompanyCultureScreen() {
  const router = useRouter();
  const [presets, setPresets] = useState<CompanyCulturePresetDTO[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cultureScores, setCultureScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const dim of CULTURE_DIMENSIONS) {
      initial[dim.key] = 50;
    }
    return initial;
  });

  const [dealbreakers, setDealbreakers] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const dim of CULTURE_DIMENSIONS) {
      initial[dim.key] = false;
    }
    return initial;
  });

  useEffect(() => {
    api.get<CompanyCulturePresetDTO[]>('/companies/culture-presets').then((res) => {
      setPresets(res.data);
    }).catch(() => {});
  }, []);

  const handlePresetSelect = (preset: CompanyCulturePresetDTO) => {
    setSelectedPresetId(preset.id);
    const scores: Record<string, number> = {};
    for (const dim of CULTURE_DIMENSIONS) {
      scores[dim.key] = preset.cultureScores[dim.key] ?? 50;
    }
    setCultureScores(scores);
  };

  const handleSliderChange = (key: string, value: number) => {
    setCultureScores((prev) => ({ ...prev, [key]: Math.round(value) }));
    if (selectedPresetId) setSelectedPresetId(null);
  };

  const handleDealbreakerToggle = (key: string, value: boolean) => {
    setDealbreakers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.put('/companies/me', {
        cultureScores: cultureScores as Partial<CultureScores>,
        cultureDealbreakers: dealbreakers as Partial<CultureDealbreakers>,
        ...(selectedPresetId && { culturePresetId: selectedPresetId }),
      });
      router.replace('/');
    } catch (error: any) {
      Alert.alert(
        'Fehler',
        error.response?.data?.message || 'Kultur konnte nicht gespeichert werden.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Zrugg</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Unternehmenskultur</Text>
          <Text style={styles.subtitle}>
            Waehl zuerscht e Branche us, denn chasch d'Wert aapasse. So findemer di richtige Lernende fuer euch.
          </Text>
        </View>

        {/* Preset chips */}
        <View style={styles.presetsSection}>
          <Text style={styles.presetsLabel}>Branchenvorlage</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled
          >
            {presets.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.chip,
                  selectedPresetId === preset.id && styles.chipSelected,
                ]}
                onPress={() => handlePresetSelect(preset)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedPresetId === preset.id && styles.chipTextSelected,
                  ]}
                >
                  {preset.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Culture sliders */}
        <View style={styles.slidersSection}>
          {CULTURE_DIMENSIONS.map((dim) => (
            <CultureSlider
              key={dim.key}
              value={cultureScores[dim.key] ?? 50}
              onValueChange={(v) => handleSliderChange(dim.key, v)}
              labelLow={dim.labelLow}
              labelHigh={dim.labelHigh}
              icon={dim.icon}
              isDealbreaker={dealbreakers[dim.key] ?? false}
              onDealbreakerToggle={(v) => handleDealbreakerToggle(dim.key, v)}
            />
          ))}
        </View>

        <Button
          title={isSubmitting ? 'Wird gspeicheret...' : 'Profil fertigstelle'}
          onPress={handleSubmit}
          loading={isSubmitting}
          variant="primary"
          style={styles.submitButton}
        />

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Ueberspringge</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    marginBottom: spacing.lg,
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
  presetsSection: {
    marginBottom: spacing.lg,
  },
  presetsLabel: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.sm,
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
  slidersSection: {
    marginBottom: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  skipButton: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  skipText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
});
