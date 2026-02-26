import { create } from 'zustand';
import type {
  QuizPhase,
  ActivityTile,
  QuizAnswer,
  QuizGamificationState,
  QuizBadge,
  HollandCodes,
  WorkValues,
} from '../types/quiz.types';
import { GAMIFICATION_CONFIG } from '../types/quiz.types';
import { MORNING_TILES, AFTERNOON_TILES, SCENARIO_QUESTIONS } from '../constants/quizContent';
import { computeProfile } from '../utils/quizScoringEngine';
import api from '../services/api';

interface QuizState {
  currentPhase: QuizPhase;
  morningTiles: ActivityTile[];
  afternoonTiles: ActivityTile[];
  scenarioAnswers: QuizAnswer[];
  currentScenarioIndex: number;
  scenarioStartTime: number | null;
  gamification: QuizGamificationState;
  hollandCodes: HollandCodes | null;
  workValues: WorkValues | null;
  isSubmitting: boolean;
  error: string | null;
  isComplete: boolean;

  toggleTile: (tileId: string) => void;
  advancePhase: () => void;
  answerScenario: (optionIndex: number) => void;
  startScenarioTimer: () => void;
  computeAndSubmit: () => Promise<void>;
  resetQuiz: () => void;

  // Computed getters
  selectedMorningCount: () => number;
  selectedAfternoonCount: () => number;
  canAdvance: () => boolean;
  overallProgress: () => number;
}

function addXP(state: QuizGamificationState, amount: number): { gamification: QuizGamificationState; leveledUp: boolean } {
  const newXP = state.xp + amount;
  const thresholds = GAMIFICATION_CONFIG.levelThresholds;
  let newLevel = state.level;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (newXP >= thresholds[i]) {
      newLevel = i + 1;
      break;
    }
  }
  return {
    gamification: { ...state, xp: newXP, level: newLevel },
    leveledUp: newLevel > state.level,
  };
}

function earnBadge(state: QuizGamificationState, badge: QuizBadge): QuizGamificationState {
  if (state.earnedBadges.includes(badge)) return state;
  return { ...state, earnedBadges: [...state.earnedBadges, badge] };
}

export const useQuizStore = create<QuizState>((set, get) => ({
  currentPhase: 'morning',
  morningTiles: MORNING_TILES.map((t) => ({ ...t, isSelected: false })),
  afternoonTiles: AFTERNOON_TILES.map((t) => ({ ...t, isSelected: false })),
  scenarioAnswers: [],
  currentScenarioIndex: 0,
  scenarioStartTime: null,
  gamification: { xp: 0, level: 1, earnedBadges: [], speedBonusCount: 0 },
  hollandCodes: null,
  workValues: null,
  isSubmitting: false,
  error: null,
  isComplete: false,

  toggleTile: (tileId: string) => {
    const { currentPhase, gamification } = get();
    const tilesKey = currentPhase === 'morning' ? 'morningTiles' : 'afternoonTiles';
    const tiles = get()[tilesKey];
    const tile = tiles.find((t) => t.id === tileId);
    if (!tile) return;

    const selectedCount = tiles.filter((t) => t.isSelected).length;
    // If already selected, deselect
    if (tile.isSelected) {
      set({
        [tilesKey]: tiles.map((t) => t.id === tileId ? { ...t, isSelected: false } : t),
      } as any);
      return;
    }
    // If max reached, don't allow more
    if (selectedCount >= 8) return;

    // Select and award XP
    const { gamification: newGam } = addXP(gamification, GAMIFICATION_CONFIG.xpPerGridPick);
    set({
      [tilesKey]: tiles.map((t) => t.id === tileId ? { ...t, isSelected: true } : t),
      gamification: newGam,
    } as any);
  },

  advancePhase: () => {
    const { currentPhase, gamification } = get();
    if (currentPhase === 'morning') {
      const newGam = earnBadge(gamification, 'morningComplete');
      set({ currentPhase: 'afternoon', gamification: newGam });
    } else if (currentPhase === 'afternoon') {
      const newGam = earnBadge(gamification, 'afternoonComplete');
      set({ currentPhase: 'scenarios', gamification: newGam, scenarioStartTime: Date.now() });
    }
  },

  startScenarioTimer: () => {
    set({ scenarioStartTime: Date.now() });
  },

  answerScenario: (optionIndex: number) => {
    const { currentScenarioIndex, scenarioAnswers, scenarioStartTime, gamification } = get();
    const question = SCENARIO_QUESTIONS[currentScenarioIndex];
    if (!question) return;

    const answer: QuizAnswer = {
      questionId: question.id,
      selectedOptionIndex: optionIndex,
      answeredAt: Date.now(),
    };

    // Check speed bonus
    let newGam = gamification;
    let xpToAdd = GAMIFICATION_CONFIG.xpPerScenarioAnswer;
    if (scenarioStartTime && (Date.now() - scenarioStartTime) < GAMIFICATION_CONFIG.speedBonusThresholdMs) {
      xpToAdd += GAMIFICATION_CONFIG.xpSpeedBonus;
      newGam = { ...newGam, speedBonusCount: newGam.speedBonusCount + 1 };
    }
    const { gamification: updatedGam } = addXP(newGam, xpToAdd);

    const newAnswers = [...scenarioAnswers, answer];
    const isLast = currentScenarioIndex >= SCENARIO_QUESTIONS.length - 1;

    if (isLast) {
      const finalGam = earnBadge(updatedGam, 'quizComplete');
      set({
        scenarioAnswers: newAnswers,
        gamification: finalGam,
      });
    } else {
      set({
        scenarioAnswers: newAnswers,
        currentScenarioIndex: currentScenarioIndex + 1,
        gamification: updatedGam,
        scenarioStartTime: Date.now(),
      });
    }
  },

  computeAndSubmit: async () => {
    const { morningTiles, afternoonTiles, scenarioAnswers } = get();
    set({ isSubmitting: true, error: null });

    const morningPicks = morningTiles.filter((t) => t.isSelected);
    const afternoonPicks = afternoonTiles.filter((t) => t.isSelected);
    const result = computeProfile(morningPicks, afternoonPicks, scenarioAnswers);

    set({ hollandCodes: result.hollandCodes, workValues: result.workValues });

    try {
      await api.post('/quiz/submit', {
        hollandCodes: result.hollandCodes,
        workValues: result.workValues,
        quizType: 'buildYourDay',
      });
      set({ isSubmitting: false, isComplete: true });
    } catch (error: any) {
      // Still mark complete locally even if API fails
      set({ isSubmitting: false, isComplete: true, error: error.response?.data?.message || 'Profil konnte nicht gespeichert werden' });
    }
  },

  resetQuiz: () => {
    set({
      currentPhase: 'morning',
      morningTiles: MORNING_TILES.map((t) => ({ ...t, isSelected: false })),
      afternoonTiles: AFTERNOON_TILES.map((t) => ({ ...t, isSelected: false })),
      scenarioAnswers: [],
      currentScenarioIndex: 0,
      scenarioStartTime: null,
      gamification: { xp: 0, level: 1, earnedBadges: [], speedBonusCount: 0 },
      hollandCodes: null,
      workValues: null,
      isSubmitting: false,
      error: null,
      isComplete: false,
    });
  },

  selectedMorningCount: () => get().morningTiles.filter((t) => t.isSelected).length,
  selectedAfternoonCount: () => get().afternoonTiles.filter((t) => t.isSelected).length,
  canAdvance: () => {
    const { currentPhase } = get();
    if (currentPhase === 'morning') return get().selectedMorningCount() >= 8;
    if (currentPhase === 'afternoon') return get().selectedAfternoonCount() >= 8;
    if (currentPhase === 'scenarios') return get().scenarioAnswers.length >= SCENARIO_QUESTIONS.length;
    return false;
  },
  overallProgress: () => {
    const { currentPhase, scenarioAnswers } = get();
    const morningDone = get().selectedMorningCount();
    const afternoonDone = get().selectedAfternoonCount();
    if (currentPhase === 'morning') return morningDone / 26;
    if (currentPhase === 'afternoon') return (8 + afternoonDone) / 26;
    return (16 + scenarioAnswers.length) / 26;
  },
}));
