import React, { useCallback } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useQuizStore } from '../../stores/quiz.store';
import ActivityGridView from '../../components/quiz/ActivityGridView';
import ScenarioQuestionView from '../../components/quiz/ScenarioQuestionView';
import QuizGamificationBar from '../../components/quiz/QuizGamificationBar';
import PersonalityRevealView from '../../components/quiz/PersonalityRevealView';
import Button from '../../components/ui/Button';
import { QUIZ_PHASE_CONFIG } from '../../types/quiz.types';
import { SCENARIO_QUESTIONS } from '../../constants/quizContent';
import { colors, spacing } from '../../constants/theme';

export default function BuildYourDayScreen() {
  const {
    currentPhase,
    morningTiles,
    afternoonTiles,
    currentScenarioIndex,
    gamification,
    hollandCodes,
    isSubmitting,
    isComplete,
    toggleTile,
    advancePhase,
    answerScenario,
    computeAndSubmit,
    canAdvance,
    selectedMorningCount,
    selectedAfternoonCount,
  } = useQuizStore();

  const config = QUIZ_PHASE_CONFIG[currentPhase];

  const handleToggleTile = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTile(id);
  }, [toggleTile]);

  const handleAnswerScenario = useCallback((optionIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    answerScenario(optionIndex);
  }, [answerScenario]);

  // After quiz is complete and profile computed, show reveal
  if (isComplete && hollandCodes) {
    return (
      <SafeAreaView style={styles.container}>
        <PersonalityRevealView hollandCodes={hollandCodes} gamification={gamification} />
        <View style={styles.footer}>
          <Button
            title="Weiter"
            onPress={() => router.replace('/(onboarding)/fields')}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  // After all scenarios answered but not yet submitted
  if (currentPhase === 'scenarios' && canAdvance() && !isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <QuizGamificationBar gamification={gamification} />
        <View style={styles.content}>
          <Button
            title="Profil berechnen"
            onPress={computeAndSubmit}
            loading={isSubmitting}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <QuizGamificationBar gamification={gamification} />

      {currentPhase === 'morning' && (
        <>
          <ActivityGridView
            tiles={morningTiles}
            onToggle={handleToggleTile}
            requiredPicks={config.requiredPicks}
            selectedCount={selectedMorningCount()}
            title={config.title}
            subtitle={config.subtitle}
          />
          <View style={styles.footer}>
            <Button
              title="Weiter"
              onPress={advancePhase}
              disabled={!canAdvance()}
              variant="primary"
            />
          </View>
        </>
      )}

      {currentPhase === 'afternoon' && (
        <>
          <ActivityGridView
            tiles={afternoonTiles}
            onToggle={handleToggleTile}
            requiredPicks={config.requiredPicks}
            selectedCount={selectedAfternoonCount()}
            title={config.title}
            subtitle={config.subtitle}
          />
          <View style={styles.footer}>
            <Button
              title="Weiter"
              onPress={advancePhase}
              disabled={!canAdvance()}
              variant="primary"
            />
          </View>
        </>
      )}

      {currentPhase === 'scenarios' && !canAdvance() && (
        <ScenarioQuestionView
          question={SCENARIO_QUESTIONS[currentScenarioIndex]}
          questionNumber={currentScenarioIndex + 1}
          totalQuestions={SCENARIO_QUESTIONS.length}
          onAnswer={handleAnswerScenario}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
});
