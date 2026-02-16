import type { StudentProfile, Listing } from '@lehrstellen/database';
import type { ScoreBreakdown } from '@lehrstellen/shared';
import { FIELD_RIASEC_MAP } from '@lehrstellen/shared';

export interface CompatibilityResult {
  totalScore: number;
  breakdown: ScoreBreakdown[];
}

const WEIGHTS = {
  PERSONALITY: 0.35,
  INTEREST: 0.35,
  FIELD: 0.20,
  LOCATION: 0.10,
};

/**
 * Cosine similarity between two vectors. Returns 0-1.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  if (magA === 0 || magB === 0) return 0.5; // neutral if no data
  return dot / (magA * magB);
}

/**
 * Compute compatibility between a student and a listing.
 * @param desiredFields - student's desired apprenticeship fields
 */
export function computeCompatibility(
  student: StudentProfile,
  listing: Listing,
  desiredFields: string[],
): CompatibilityResult {
  // 1. OCEAN Personality Score
  const studentOcean = [
    student.oceanOpenness,
    student.oceanConscientiousness,
    student.oceanExtraversion,
    student.oceanAgreeableness,
    student.oceanNeuroticism,
  ];
  const listingOcean = [
    listing.idealOceanOpenness ?? 0.5,
    listing.idealOceanConscientiousness ?? 0.5,
    listing.idealOceanExtraversion ?? 0.5,
    listing.idealOceanAgreeableness ?? 0.5,
    listing.idealOceanNeuroticism ?? 0.5,
  ];
  const personalityScore = cosineSimilarity(studentOcean, listingOcean) * 100;

  // 2. RIASEC Interest Score
  const studentRiasec = [
    student.riasecRealistic,
    student.riasecInvestigative,
    student.riasecArtistic,
    student.riasecSocial,
    student.riasecEnterprising,
    student.riasecConventional,
  ];
  const listingRiasec = [
    listing.idealRiasecRealistic ?? 0,
    listing.idealRiasecInvestigative ?? 0,
    listing.idealRiasecArtistic ?? 0,
    listing.idealRiasecSocial ?? 0,
    listing.idealRiasecEnterprising ?? 0,
    listing.idealRiasecConventional ?? 0,
  ];

  const hasListingRiasec = listingRiasec.some((v) => v > 0);
  const interestScore = hasListingRiasec
    ? cosineSimilarity(studentRiasec, listingRiasec) * 100
    : getFieldBasedRiasecScore(student, listing.field);

  // 3. Field Match Score
  const fieldScore = desiredFields.some(
    (f) => f.toLowerCase() === listing.field.toLowerCase(),
  )
    ? 100
    : desiredFields.length === 0
      ? 50 // "I don't know yet" mode
      : 0;

  // 4. Location Score
  const locationScore = student.canton === listing.canton ? 100 : 30;

  const totalScore =
    personalityScore * WEIGHTS.PERSONALITY +
    interestScore * WEIGHTS.INTEREST +
    fieldScore * WEIGHTS.FIELD +
    locationScore * WEIGHTS.LOCATION;

  return {
    totalScore: Math.round(totalScore),
    breakdown: [
      { label: 'Persoenlichkeit', score: Math.round(personalityScore), weight: WEIGHTS.PERSONALITY },
      { label: 'Interessen', score: Math.round(interestScore), weight: WEIGHTS.INTEREST },
      { label: 'Berufsfeld', score: fieldScore, weight: WEIGHTS.FIELD },
      { label: 'Region', score: locationScore, weight: WEIGHTS.LOCATION },
    ],
  };
}

function getFieldBasedRiasecScore(student: StudentProfile, field: string): number {
  const dominantTypes = FIELD_RIASEC_MAP[field] ?? [];
  if (dominantTypes.length === 0) return 50;

  const riasecMap: Record<string, number> = {
    realistic: student.riasecRealistic,
    investigative: student.riasecInvestigative,
    artistic: student.riasecArtistic,
    social: student.riasecSocial,
    enterprising: student.riasecEnterprising,
    conventional: student.riasecConventional,
  };

  const scores = dominantTypes.map((type) => riasecMap[type] ?? 0);
  return (scores.reduce((a, b) => a + b, 0) / scores.length) * 100;
}
