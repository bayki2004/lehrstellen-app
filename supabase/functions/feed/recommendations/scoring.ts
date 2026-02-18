/**
 * LehrMatch scoring engine.
 * Computes a composite compatibility score between a student and a Lehrstelle.
 */

import {
  combinedProximityScore,
  BERUFSFELD_WORK_VALUES,
} from "./canton-data.ts";

// --- Types ---

export interface StudentData {
  canton: string;
  preferredLanguage: string;
  interests: string[];
  skills: string[];
  multicheckScore: number | null;
  hollandCodes: number[] | null; // [R, I, A, S, E, C] or null if no quiz
  workValues: number[] | null;   // 8-dim or null if no quiz
}

export interface LehrstelleCandidate {
  id: string;
  canton: string;
  berufsschuleCanton: string | null;
  educationType: string; // "EFZ" or "EBA"
  berufField: string;
  personalityFit: Record<string, number>; // RIASEC from berufe table
  cultureTags: string[];
  verified: boolean;
  premium: boolean;
}

// --- Weights ---

const WEIGHTS = {
  riasec: 0.35,
  proximity: 0.25,
  interests: 0.15,
  workValues: 0.10,
  education: 0.10,
  premium: 0.05,
} as const;

const COLD_START_WEIGHTS = {
  proximity: 0.45,
  interests: 0.35,
  education: 0.20,
} as const;

// --- Scoring Functions ---

/**
 * Cosine similarity between two vectors. Returns 0-1 for non-negative vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * RIASEC personality fit score.
 * Cosine similarity between student's Holland codes and the Beruf's ideal profile.
 */
export function riasecScore(
  studentCodes: number[],
  berufFit: Record<string, number>,
): number {
  const berufVector = [
    berufFit.realistic ?? 0,
    berufFit.investigative ?? 0,
    berufFit.artistic ?? 0,
    berufFit.social ?? 0,
    berufFit.enterprising ?? 0,
    berufFit.conventional ?? 0,
  ];
  return cosineSimilarity(studentCodes, berufVector);
}

/**
 * Interests alignment score.
 * 60% Berufsfeld match + 40% culture tag overlap.
 */
export function interestsScore(
  studentInterests: string[],
  studentSkills: string[],
  berufField: string,
  cultureTags: string[],
): number {
  // Sub-signal 1: Berufsfeld match
  const normalizedField = berufField.toLowerCase();
  const fieldMatch = studentInterests.some(
    (i) => normalizedField.includes(i.toLowerCase()) ||
      i.toLowerCase().includes(normalizedField),
  )
    ? 1.0
    : 0.0;

  // Sub-signal 2: Culture tag overlap
  const studentTerms = [...studentInterests, ...studentSkills].map((s) =>
    s.toLowerCase()
  );
  const matchingTags = cultureTags.filter((tag) =>
    studentTerms.some(
      (t) => tag.toLowerCase().includes(t) || t.includes(tag.toLowerCase()),
    )
  );
  const tagScore = cultureTags.length > 0
    ? Math.min(matchingTags.length / cultureTags.length, 1.0)
    : 0.0;

  return fieldMatch * 0.6 + tagScore * 0.4;
}

/**
 * Work values alignment score.
 * Cosine similarity between student work values and Berufsfeld-implied values.
 */
export function workValuesScore(
  studentWorkValues: number[],
  berufField: string,
): number {
  const fieldValues = BERUFSFELD_WORK_VALUES[berufField];
  if (!fieldValues) return 0.5; // neutral fallback for unknown fields
  return cosineSimilarity(studentWorkValues, fieldValues);
}

/**
 * Education fit score based on multicheck score vs EFZ/EBA requirements.
 */
export function educationFitScore(
  educationType: string,
  multicheckScore: number | null,
): number {
  // No multicheck score → neutral, don't penalize
  if (multicheckScore === null) return 0.6;

  if (educationType === "EFZ") {
    if (multicheckScore >= 70) return 1.0;
    if (multicheckScore >= 50) return 0.7;
    if (multicheckScore >= 30) return 0.4;
    return 0.2;
  } else {
    // EBA: designed for students who need a more practical approach
    if (multicheckScore >= 70) return 0.6; // slightly overqualified
    if (multicheckScore >= 40) return 1.0; // sweet spot
    if (multicheckScore >= 20) return 0.8;
    return 0.5;
  }
}

/**
 * Premium/verified bonus score.
 */
export function premiumScore(verified: boolean, premium: boolean): number {
  if (verified && premium) return 1.0;
  if (verified) return 0.5;
  return 0.0;
}

/**
 * Compute the final composite compatibility score.
 */
export function computeScore(
  student: StudentData,
  lehrstelle: LehrstelleCandidate,
): number {
  const hasPersonality = student.hollandCodes !== null &&
    student.workValues !== null;

  if (hasPersonality) {
    const riasec = riasecScore(student.hollandCodes!, lehrstelle.personalityFit);
    const proximity = combinedProximityScore(
      student.canton,
      lehrstelle.canton,
      lehrstelle.berufsschuleCanton,
    );
    const interests = interestsScore(
      student.interests,
      student.skills,
      lehrstelle.berufField,
      lehrstelle.cultureTags,
    );
    const workVals = workValuesScore(
      student.workValues!,
      lehrstelle.berufField,
    );
    const education = educationFitScore(
      lehrstelle.educationType,
      student.multicheckScore,
    );
    const premium = premiumScore(lehrstelle.verified, lehrstelle.premium);

    const score = WEIGHTS.riasec * riasec +
      WEIGHTS.proximity * proximity +
      WEIGHTS.interests * interests +
      WEIGHTS.workValues * workVals +
      WEIGHTS.education * education +
      WEIGHTS.premium * premium;

    return Math.min(Math.max(score, 0), 1);
  } else {
    // Cold start: no personality profile
    const proximity = combinedProximityScore(
      student.canton,
      lehrstelle.canton,
      lehrstelle.berufsschuleCanton,
    );
    const interests = interestsScore(
      student.interests,
      student.skills,
      lehrstelle.berufField,
      lehrstelle.cultureTags,
    );
    const education = educationFitScore(
      lehrstelle.educationType,
      student.multicheckScore,
    );

    const score = COLD_START_WEIGHTS.proximity * proximity +
      COLD_START_WEIGHTS.interests * interests +
      COLD_START_WEIGHTS.education * education;

    return Math.min(Math.max(score, 0), 1);
  }
}
