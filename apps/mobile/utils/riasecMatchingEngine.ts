import type { HollandCodes } from '../types/quiz.types';
import { hollandCodesToVector } from '../types/quiz.types';
import type { Beruf, BerufMatch, SharedDimension } from '../types/beruf.types';

const DIMENSION_KEYS = ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'];

const DIMENSION_LABELS: Record<string, string> = {
  realistic: 'Realistisch',
  investigative: 'Forschend',
  artistic: 'Künstlerisch',
  social: 'Sozial',
  enterprising: 'Unternehmerisch',
  conventional: 'Konventionell',
};

const DIMENSION_EXPLANATIONS: Record<string, string> = {
  realistic: 'Du packsch gern aa und schaffsch mit de Händ — das isch genau, was me i dem Bruef bruucht.',
  investigative: 'Du bisch neugiirig und denksch gern nooche — ideal fürs Berufsfeld.',
  artistic: 'Dini kreativ Ader passt perfekt zu dem Bruef.',
  social: 'Du bisch gern mit Mensche zame und hilfsch andere — das steckt i dem Bruef drin.',
  enterprising: 'Du bisch initiatiivrych und chasch guet überzeuge — top fürs Berufsfeld.',
  conventional: 'Du bisch gnau, organisiert und zueverlaessig — das bruucht me gnau da.',
};

export function matchBerufe(
  userProfile: HollandCodes,
  berufe: Beruf[],
  limit = 15
): BerufMatch[] {
  return berufe
    .map((beruf) => {
      if (!beruf.personalityFit || Object.keys(beruf.personalityFit).length === 0) return null;
      const score = calculateMatchScore(userProfile, beruf.personalityFit);
      const shared = findSharedDimensions(userProfile, beruf.personalityFit);
      return { beruf, matchPercentage: score, sharedDimensions: shared };
    })
    .filter((m): m is BerufMatch => m !== null)
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, limit);
}

export function calculateMatchScore(
  user: HollandCodes,
  berufFit: Record<string, number>
): number {
  const userVec = hollandCodesToVector(user);
  const berufVec = DIMENSION_KEYS.map((k) => berufFit[k] ?? 0);

  const dot = userVec.reduce((sum, v, i) => sum + v * berufVec[i], 0);
  const magA = Math.sqrt(userVec.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(berufVec.reduce((sum, v) => sum + v * v, 0));

  if (magA === 0 || magB === 0) return 0;
  return Math.round(Math.max(0, dot / (magA * magB)) * 100);
}

export function findSharedDimensions(
  user: HollandCodes,
  berufFit: Record<string, number>,
  threshold = 0.4
): SharedDimension[] {
  const userVec = hollandCodesToVector(user);
  return DIMENSION_KEYS
    .map((key, index) => ({
      key,
      label: DIMENSION_LABELS[key] ?? key,
      userScore: userVec[index],
      berufScore: berufFit[key] ?? 0,
    }))
    .filter((d) => d.userScore >= threshold && d.berufScore >= threshold)
    .sort((a, b) => (b.userScore + b.berufScore) - (a.userScore + a.berufScore));
}

export function generateExplanations(sharedDimensions: SharedDimension[]): string[] {
  return sharedDimensions
    .slice(0, 3)
    .map((dim) => DIMENSION_EXPLANATIONS[dim.key])
    .filter((e): e is string => !!e);
}
