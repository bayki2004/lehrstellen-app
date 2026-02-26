// RIASEC dimensions + Work Values
export type QuizDimension =
  | 'realistic' | 'investigative' | 'artistic' | 'social' | 'enterprising' | 'conventional'
  | 'teamwork' | 'independence' | 'creativity' | 'stability'
  | 'variety' | 'helpingOthers' | 'physicalActivity' | 'technology';

export const RIASEC_DIMENSIONS: QuizDimension[] = [
  'realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional',
];

export const WORK_VALUE_DIMENSIONS: QuizDimension[] = [
  'teamwork', 'independence', 'creativity', 'stability',
  'variety', 'helpingOthers', 'physicalActivity', 'technology',
];

export function isRIASEC(dim: QuizDimension): boolean {
  return RIASEC_DIMENSIONS.includes(dim);
}

export interface HollandCodes {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

export interface WorkValues {
  teamwork: number;
  independence: number;
  creativity: number;
  stability: number;
  variety: number;
  helpingOthers: number;
  physicalActivity: number;
  technology: number;
}

export interface PersonalityProfile {
  id: string;
  studentId: string;
  hollandCodes: HollandCodes;
  workValues: WorkValues;
  computedAt: string;
  version: number;
}

export interface ActivityTile {
  id: string;
  label: string;
  icon: string; // emoji
  scores: Partial<Record<QuizDimension, number>>;
  isSelected: boolean;
}

export type QuizPhase = 'morning' | 'afternoon' | 'scenarios';

export const QUIZ_PHASE_CONFIG: Record<QuizPhase, {
  title: string;
  subtitle: string;
  requiredPicks: number;
  weight: number;
}> = {
  morning: {
    title: 'Dein Morgen',
    subtitle: 'Am Morgen würdest du am liebsten...',
    requiredPicks: 8,
    weight: 0.3,
  },
  afternoon: {
    title: 'Dein Nachmittag',
    subtitle: 'Am Nachmittag wärst du am liebsten...',
    requiredPicks: 8,
    weight: 0.3,
  },
  scenarios: {
    title: 'Was zählt für dich?',
    subtitle: 'Ein paar Fragen zu deinen Werten',
    requiredPicks: 10,
    weight: 0.4,
  },
};

export interface QuizOption {
  text: string;
  icon: string; // emoji
  scores: Partial<Record<QuizDimension, number>>;
}

export interface PersonalityQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  dimension: QuizDimension;
}

export interface QuizAnswer {
  questionId: string;
  selectedOptionIndex: number;
  answeredAt: number; // timestamp
}

export type QuizBadge = 'morningComplete' | 'afternoonComplete' | 'quizComplete';

export const QUIZ_BADGE_CONFIG: Record<QuizBadge, { label: string; icon: string }> = {
  morningComplete: { label: 'Morgen geplant!', icon: '🌅' },
  afternoonComplete: { label: 'Tag komplett!', icon: '🌇' },
  quizComplete: { label: 'Typ erkannt!', icon: '✨' },
};

export interface QuizGamificationState {
  xp: number;
  level: number;
  earnedBadges: QuizBadge[];
  speedBonusCount: number;
}

export const GAMIFICATION_CONFIG = {
  xpPerGridPick: 10,
  xpPerScenarioAnswer: 15,
  xpSpeedBonus: 5,
  speedBonusThresholdMs: 5000,
  levelThresholds: [0, 120, 250],
  levelTitles: ['Entdecker/in', 'Profi', 'Persönlichkeits-Guru'],
  levelIcons: ['🔍', '⭐', '👑'],
};

export function hollandCodesToVector(codes: HollandCodes): number[] {
  return [codes.realistic, codes.investigative, codes.artistic, codes.social, codes.enterprising, codes.conventional];
}

export function topThreeCodes(codes: HollandCodes): string[] {
  const all: [string, number][] = [
    ['R', codes.realistic], ['I', codes.investigative], ['A', codes.artistic],
    ['S', codes.social], ['E', codes.enterprising], ['C', codes.conventional],
  ];
  return all.sort((a, b) => b[1] - a[1]).slice(0, 3).map(([code]) => code);
}
