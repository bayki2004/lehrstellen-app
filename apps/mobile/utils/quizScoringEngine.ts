import type {
  ActivityTile,
  QuizAnswer,
  HollandCodes,
  WorkValues,
  QuizDimension,
} from '../types/quiz.types';
import { QUIZ_PHASE_CONFIG, isRIASEC } from '../types/quiz.types';
import { SCENARIO_QUESTIONS } from '../constants/quizContent';

export interface ScoringResult {
  hollandCodes: HollandCodes;
  workValues: WorkValues;
}

export function computeProfile(
  morningPicks: ActivityTile[],
  afternoonPicks: ActivityTile[],
  scenarioAnswers: QuizAnswer[]
): ScoringResult {
  const rawRIASEC: Partial<Record<QuizDimension, number>> = {};
  const rawWorkValues: Partial<Record<QuizDimension, number>> = {};

  // Phase 1: Morning grid (weight 0.3)
  const morningWeight = QUIZ_PHASE_CONFIG.morning.weight;
  for (const tile of morningPicks) {
    for (const [dim, score] of Object.entries(tile.scores) as [QuizDimension, number][]) {
      if (isRIASEC(dim)) {
        rawRIASEC[dim] = (rawRIASEC[dim] ?? 0) + score * morningWeight;
      } else {
        rawWorkValues[dim] = (rawWorkValues[dim] ?? 0) + score * morningWeight;
      }
    }
  }

  // Phase 2: Afternoon grid (weight 0.3)
  const afternoonWeight = QUIZ_PHASE_CONFIG.afternoon.weight;
  for (const tile of afternoonPicks) {
    for (const [dim, score] of Object.entries(tile.scores) as [QuizDimension, number][]) {
      if (isRIASEC(dim)) {
        rawRIASEC[dim] = (rawRIASEC[dim] ?? 0) + score * afternoonWeight;
      } else {
        rawWorkValues[dim] = (rawWorkValues[dim] ?? 0) + score * afternoonWeight;
      }
    }
  }

  // Phase 3: Scenarios (weight 0.4)
  const scenarioWeight = QUIZ_PHASE_CONFIG.scenarios.weight;
  for (const answer of scenarioAnswers) {
    const question = SCENARIO_QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question || answer.selectedOptionIndex >= question.options.length) continue;
    const option = question.options[answer.selectedOptionIndex];
    for (const [dim, score] of Object.entries(option.scores) as [QuizDimension, number][]) {
      if (isRIASEC(dim)) {
        rawRIASEC[dim] = (rawRIASEC[dim] ?? 0) + score * scenarioWeight;
      } else {
        rawWorkValues[dim] = (rawWorkValues[dim] ?? 0) + score * scenarioWeight;
      }
    }
  }

  // Normalize RIASEC to [0, 1]
  const maxRIASEC = Math.max(...Object.values(rawRIASEC), 0.001);
  const maxWV = Math.max(...Object.values(rawWorkValues), 0.001);

  const hollandCodes: HollandCodes = {
    realistic: Math.min((rawRIASEC.realistic ?? 0) / maxRIASEC, 1.0),
    investigative: Math.min((rawRIASEC.investigative ?? 0) / maxRIASEC, 1.0),
    artistic: Math.min((rawRIASEC.artistic ?? 0) / maxRIASEC, 1.0),
    social: Math.min((rawRIASEC.social ?? 0) / maxRIASEC, 1.0),
    enterprising: Math.min((rawRIASEC.enterprising ?? 0) / maxRIASEC, 1.0),
    conventional: Math.min((rawRIASEC.conventional ?? 0) / maxRIASEC, 1.0),
  };

  const workValues: WorkValues = {
    teamwork: Math.min((rawWorkValues.teamwork ?? 0) / maxWV, 1.0),
    independence: Math.min((rawWorkValues.independence ?? 0) / maxWV, 1.0),
    creativity: Math.min((rawWorkValues.creativity ?? 0) / maxWV, 1.0),
    stability: Math.min((rawWorkValues.stability ?? 0) / maxWV, 1.0),
    variety: Math.min((rawWorkValues.variety ?? 0) / maxWV, 1.0),
    helpingOthers: Math.min((rawWorkValues.helpingOthers ?? 0) / maxWV, 1.0),
    physicalActivity: Math.min((rawWorkValues.physicalActivity ?? 0) / maxWV, 1.0),
    technology: Math.min((rawWorkValues.technology ?? 0) / maxWV, 1.0),
  };

  return { hollandCodes, workValues };
}
