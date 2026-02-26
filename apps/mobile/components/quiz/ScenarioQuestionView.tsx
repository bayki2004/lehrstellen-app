import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../constants/theme';
import type { PersonalityQuestion } from '../../types/quiz.types';

interface Props {
  question: PersonalityQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (optionIndex: number) => void;
}

export default function ScenarioQuestionView({ question, questionNumber, totalQuestions, onAnswer }: Props) {
  return (
    <Animated.View entering={FadeInRight.duration(300)} exiting={FadeOutLeft.duration(200)} style={styles.container}>
      <Text style={styles.counter}>Frage {questionNumber} / {totalQuestions}</Text>
      <Text style={styles.question}>{question.text}</Text>
      <View style={styles.options}>
        {question.options.map((option, index) => (
          <Pressable key={index} style={styles.option} onPress={() => onAnswer(index)}>
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text style={styles.optionText}>{option.text}</Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  counter: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  question: {
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 28,
  },
  options: {
    gap: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  optionText: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 22,
  },
});
