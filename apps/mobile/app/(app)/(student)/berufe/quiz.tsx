import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  Pressable,
} from 'react-native';
import { useRouter, useNavigation, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QUIZ_QUESTIONS, QuizAnswer } from '@lehrstellen/shared';
import QuizProgress from '../../../../components/quiz/QuizProgress';
import LikertScale from '../../../../components/quiz/LikertScale';
import Button from '../../../../components/ui/Button';
import { useAuthStore } from '../../../../stores/auth.store';
import api from '../../../../services/api';
import * as Haptics from 'expo-haptics';
import { colors, typography, fontWeights, spacing, borderRadius, shadows } from '../../../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function QuizScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, setUser } = useAuthStore();

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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];
  const totalQuestions = QUIZ_QUESTIONS.length;
  const currentAnswer = answers[currentQuestion.id];
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const animateTransition = (direction: 'forward' | 'backward', callback: () => void) => {
    const toValue = direction === 'forward' ? -SCREEN_WIDTH : SCREEN_WIDTH;

    Animated.timing(slideAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      callback();
      slideAnim.setValue(direction === 'forward' ? SCREEN_WIDTH : -SCREEN_WIDTH);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    });
  };

  const handleSelectValue = (value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentAnswer === undefined) {
      Alert.alert('Hinweis', 'Bitte wähle eine Antwort aus.');
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
      return;
    }

    animateTransition('forward', () => {
      setCurrentIndex((prev) => prev + 1);
    });
  };

  const handleBack = () => {
    if (currentIndex === 0) return;

    animateTransition('backward', () => {
      setCurrentIndex((prev) => prev - 1);
    });
  };

  const handleSubmit = async () => {
    const quizAnswers: QuizAnswer[] = QUIZ_QUESTIONS.map((q) => ({
      questionId: q.id,
      value: answers[q.id] || 3,
    }));

    setIsSubmitting(true);
    try {
      await api.post('/quiz/submit', { answers: quizAnswers });

      if (user) {
        setUser({ ...user, hasCompletedQuiz: true });
      }

      router.replace('/(app)/(student)/berufe/');
    } catch (error: any) {
      Alert.alert(
        'Fehler',
        error.response?.data?.message || 'Quiz konnte nicht gesendet werden.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>Zurück</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Persönlichkeits-Quiz</Text>
        <QuizProgress current={currentIndex + 1} total={totalQuestions} />
      </View>

      <View style={styles.cardContainer}>
        <Animated.View
          style={[
            styles.questionCard,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>
              Frage {currentIndex + 1} / {totalQuestions}
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {currentQuestion.category}
              </Text>
            </View>
          </View>

          <Text style={styles.questionText}>{currentQuestion.textDe}</Text>

          <LikertScale
            value={currentAnswer}
            onSelect={handleSelectValue}
          />
        </Animated.View>
      </View>

      <View style={styles.navigation}>
        {currentIndex > 0 && (
          <Button
            title="Zurück"
            onPress={handleBack}
            variant="outline"
            style={styles.navButton}
          />
        )}
        <Button
          title={isLastQuestion ? 'Quiz abschließen' : 'Weiter'}
          onPress={handleNext}
          loading={isSubmitting}
          variant="primary"
          style={[styles.navButton, currentIndex === 0 && styles.navButtonFull]}
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
    paddingTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  backText: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
  header: {
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.h2,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.lg,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  questionNumber: {
    fontSize: typography.caption,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
  },
  categoryBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    fontSize: typography.tiny,
    fontWeight: fontWeights.semiBold,
    color: colors.primary,
  },
  questionText: {
    fontSize: typography.h4,
    fontWeight: fontWeights.medium,
    color: colors.text,
    lineHeight: 28,
    marginBottom: spacing.xl,
  },
  navigation: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  navButton: {
    flex: 1,
  },
  navButtonFull: {
    flex: 1,
  },
});
