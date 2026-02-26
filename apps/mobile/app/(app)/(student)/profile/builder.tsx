import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation, useFocusEffect } from 'expo-router';
import { useProfileBuilderStore } from '../../../../stores/profileBuilder.store';
import { PROFILE_BUILDER_STEPS } from '../../../../types/profile.types';
import PersonalInfoStep from '../../../../components/profileBuilder/PersonalInfoStep';
import MotivationVideoStep from '../../../../components/profileBuilder/MotivationVideoStep';
import MotivationLetterStep from '../../../../components/profileBuilder/MotivationLetterStep';
import EducationStep from '../../../../components/profileBuilder/EducationStep';
import ExperienceStep from '../../../../components/profileBuilder/ExperienceStep';
import SkillsLanguagesStep from '../../../../components/profileBuilder/SkillsLanguagesStep';
import DocumentsStep from '../../../../components/profileBuilder/DocumentsStep';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../../../constants/theme';

const TOTAL_STEPS = PROFILE_BUILDER_STEPS.length;

function StepContent({ step }: { step: number }) {
  switch (step) {
    case 0:
      return <PersonalInfoStep />;
    case 1:
      return <MotivationVideoStep />;
    case 2:
      return <MotivationLetterStep />;
    case 3:
      return <EducationStep />;
    case 4:
      return <ExperienceStep />;
    case 5:
      return <SkillsLanguagesStep />;
    case 6:
      return <DocumentsStep />;
    default:
      return null;
  }
}

export default function ProfileBuilderScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    saveProfile,
    loadExisting,
    isSaving,
    isLoading,
  } = useProfileBuilderStore();

  const progressAnim = useRef(new Animated.Value(0)).current;

  // Hide parent tab bar when this screen is focused
  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({ tabBarStyle: { display: 'none' } });
      return () => {
        parent?.setOptions({ tabBarStyle: undefined });
      };
    }, [navigation])
  );

  useEffect(() => {
    loadExisting();
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / TOTAL_STEPS,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const stepInfo = PROFILE_BUILDER_STEPS[currentStep];
  const isLastStep = currentStep === TOTAL_STEPS - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleSave();
    } else {
      nextStep();
    }
  };

  const handleSave = async () => {
    try {
      await saveProfile();
      Alert.alert('Gespeichert', 'Dein Profil wurde erfolgreich gespeichert.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Fehler', 'Profil konnte nicht gespeichert werden. Bitte versuche es erneut.');
    }
  };

  const handleClose = () => {
    Alert.alert(
      'Builder schließen?',
      'Nicht gespeicherte Änderungen gehen verloren.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Schließen', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Profil wird geladen...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} hitSlop={8}>
            <Text style={styles.closeButton}>{'< Zurück'}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Profil Builder</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} / {TOTAL_STEPS}
          </Text>
        </View>

        {/* Step indicators */}
        <View style={styles.stepIndicators}>
          {PROFILE_BUILDER_STEPS.map((_, index) => (
            <Pressable key={index} onPress={() => goToStep(index)}>
              <View
                style={[
                  styles.stepDot,
                  index === currentStep && styles.stepDotActive,
                  index < currentStep && styles.stepDotCompleted,
                ]}
              >
                <Text
                  style={[
                    styles.stepDotText,
                    (index === currentStep || index < currentStep) &&
                      styles.stepDotTextActive,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Step title */}
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>{stepInfo.title}</Text>
          <Text style={styles.stepSubtitle}>{stepInfo.subtitle}</Text>
        </View>

        {/* Step content */}
        <View style={styles.stepContent}>
          <StepContent step={currentStep} />
        </View>

        {/* Bottom navigation */}
        <View style={styles.bottomNav}>
          <Pressable
            style={[styles.navButton, styles.navButtonBack, isFirstStep && styles.navButtonHidden]}
            onPress={prevStep}
            disabled={isFirstStep}
          >
            <Text style={[styles.navButtonBackText, isFirstStep && styles.navButtonHiddenText]}>
              Zurück
            </Text>
          </Pressable>

          <Pressable
            style={[styles.navButton, styles.navButtonNext, isSaving && styles.navButtonDisabled]}
            onPress={handleNext}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.navButtonNextText}>
                {isLastStep ? 'Speichern' : 'Weiter'}
              </Text>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeButton: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
  headerTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  headerSpacer: {
    width: 70,
  },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semiBold,
    color: colors.textSecondary,
    minWidth: 30,
    textAlign: 'right',
  },

  // Step indicators
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  stepDotCompleted: {
    backgroundColor: colors.success,
  },
  stepDotText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.bold,
    color: colors.textTertiary,
  },
  stepDotTextActive: {
    color: colors.white,
  },

  // Step header
  stepHeader: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  stepTitle: {
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  stepSubtitle: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Step content
  stepContent: {
    flex: 1,
  },

  // Bottom navigation
  bottomNav: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  navButton: {
    flex: 1,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  navButtonBack: {
    backgroundColor: colors.borderLight,
  },
  navButtonNext: {
    backgroundColor: colors.primary,
  },
  navButtonDisabled: {
    opacity: 0.6,
  },
  navButtonHidden: {
    opacity: 0,
  },
  navButtonBackText: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.textSecondary,
  },
  navButtonHiddenText: {
    color: 'transparent',
  },
  navButtonNextText: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.white,
  },
});
