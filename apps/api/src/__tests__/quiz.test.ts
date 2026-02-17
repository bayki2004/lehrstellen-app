import { describe, it, expect } from 'vitest';
import { QUIZ_QUESTIONS } from '@lehrstellen/shared';

// Extract the pure computation functions for testing
// We test the scoring logic directly since submitQuiz depends on Prisma

function computeOceanScores(answers: { questionId: string; value: number }[]) {
  const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const;
  const scores: Record<string, number> = {
    openness: 0.5,
    conscientiousness: 0.5,
    extraversion: 0.5,
    agreeableness: 0.5,
    neuroticism: 0.5,
  };

  for (const trait of traits) {
    const questions = QUIZ_QUESTIONS.filter(
      (q) => q.category === 'OCEAN' && q.trait === trait,
    );
    let total = 0;
    let count = 0;

    for (const q of questions) {
      const answer = answers.find((a) => a.questionId === q.id);
      if (!answer) continue;
      let value = (answer.value - 1) / 4;
      if (q.reversed) value = 1 - value;
      total += value;
      count++;
    }

    if (count > 0) {
      scores[trait] = Math.round((total / count) * 100) / 100;
    }
  }

  return scores;
}

function computeRiasecScores(answers: { questionId: string; value: number }[]) {
  const types = ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'] as const;
  const scores: Record<string, number> = {
    realistic: 0,
    investigative: 0,
    artistic: 0,
    social: 0,
    enterprising: 0,
    conventional: 0,
  };

  for (const type of types) {
    const questions = QUIZ_QUESTIONS.filter(
      (q) => q.category === 'RIASEC' && q.trait === type,
    );
    let total = 0;
    let count = 0;

    for (const q of questions) {
      const answer = answers.find((a) => a.questionId === q.id);
      if (!answer) continue;
      let value = (answer.value - 1) / 4;
      if (q.reversed) value = 1 - value;
      total += value;
      count++;
    }

    if (count > 0) {
      scores[type] = Math.round((total / count) * 100) / 100;
    }
  }

  return scores;
}

describe('Quiz Score Computation', () => {
  it('quiz has the expected number of questions', () => {
    expect(QUIZ_QUESTIONS.length).toBe(22);
    const ocean = QUIZ_QUESTIONS.filter((q) => q.category === 'OCEAN');
    const riasec = QUIZ_QUESTIONS.filter((q) => q.category === 'RIASEC');
    expect(ocean.length).toBe(10);
    expect(riasec.length).toBe(12);
  });

  it('all answers at 5 produce high OCEAN scores', () => {
    const answers = QUIZ_QUESTIONS.map((q) => ({ questionId: q.id, value: 5 }));
    const scores = computeOceanScores(answers);

    // Non-reversed items at value 5 → normalized to 1.0
    // Reversed items at value 5 → normalized to 0.0
    // So traits with only non-reversed questions should be 1.0
    for (const trait of Object.keys(scores)) {
      const traitQuestions = QUIZ_QUESTIONS.filter(
        (q) => q.category === 'OCEAN' && q.trait === trait,
      );
      const hasReversed = traitQuestions.some((q) => q.reversed);
      if (!hasReversed) {
        expect(scores[trait]).toBe(1);
      }
    }
  });

  it('all answers at 1 produce low scores for non-reversed traits', () => {
    const answers = QUIZ_QUESTIONS.map((q) => ({ questionId: q.id, value: 1 }));
    const scores = computeOceanScores(answers);

    for (const trait of Object.keys(scores)) {
      const traitQuestions = QUIZ_QUESTIONS.filter(
        (q) => q.category === 'OCEAN' && q.trait === trait,
      );
      const hasReversed = traitQuestions.some((q) => q.reversed);
      if (!hasReversed) {
        expect(scores[trait]).toBe(0);
      }
    }
  });

  it('neutral answers (3) produce mid-range scores', () => {
    const answers = QUIZ_QUESTIONS.map((q) => ({ questionId: q.id, value: 3 }));
    const scores = computeOceanScores(answers);

    for (const value of Object.values(scores)) {
      expect(value).toBe(0.5);
    }
  });

  it('RIASEC scores are normalized 0-1', () => {
    const answers = QUIZ_QUESTIONS.map((q) => ({
      questionId: q.id,
      value: Math.ceil(Math.random() * 5),
    }));
    const scores = computeRiasecScores(answers);

    for (const value of Object.values(scores)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it('each RIASEC type has at least one question', () => {
    const types = ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'];
    for (const type of types) {
      const questions = QUIZ_QUESTIONS.filter(
        (q) => q.category === 'RIASEC' && q.trait === type,
      );
      expect(questions.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('reversed items are correctly handled', () => {
    const reversedQuestions = QUIZ_QUESTIONS.filter((q) => q.reversed);
    expect(reversedQuestions.length).toBeGreaterThan(0);

    // For a reversed question, answering 5 should give 0.0 and answering 1 should give 1.0
    for (const q of reversedQuestions) {
      const highAnswer = [{ questionId: q.id, value: 5 }];
      const lowAnswer = [{ questionId: q.id, value: 1 }];

      // Create full answer sets with neutral for other questions
      const allHighAnswers = QUIZ_QUESTIONS.map((qq) =>
        qq.id === q.id ? highAnswer[0] : { questionId: qq.id, value: 3 },
      );
      const allLowAnswers = QUIZ_QUESTIONS.map((qq) =>
        qq.id === q.id ? lowAnswer[0] : { questionId: qq.id, value: 3 },
      );

      const scoresHigh = q.category === 'OCEAN'
        ? computeOceanScores(allHighAnswers)
        : computeRiasecScores(allHighAnswers);
      const scoresLow = q.category === 'OCEAN'
        ? computeOceanScores(allLowAnswers)
        : computeRiasecScores(allLowAnswers);

      // Reversed: high answer should produce lower/equal score than low answer
      expect(scoresHigh[q.trait]).toBeLessThanOrEqual(scoresLow[q.trait]);
    }
  });
});
