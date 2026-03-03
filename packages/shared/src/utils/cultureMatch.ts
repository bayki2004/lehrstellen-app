import type { CultureScores, CultureDealbreakers, CultureMatchResult, CultureDimensionResult } from '../types/api';
import { CULTURE_DIMENSIONS, DEALBREAKER_TOLERANCE } from '../types/api';

/**
 * Calculate culture match between a student and a company.
 *
 * 1. Dealbreaker check: if any dealbreaker dimension difference > DEALBREAKER_TOLERANCE → hard fail (score 0).
 * 2. Per-dimension similarity: delta → percentage (0 delta = 100%, 100 delta = 0%).
 * 3. Overall score: average of all dimension similarities.
 */
export function calculateCultureMatch(
  studentScores: CultureScores,
  companyScores: CultureScores,
  companyDealbreakers?: CultureDealbreakers,
): CultureMatchResult {
  const breakdown: CultureDimensionResult[] = [];
  let dealbreakerFailed = false;

  for (const dim of CULTURE_DIMENSIONS) {
    const key = dim.key as keyof CultureScores;
    const sVal = studentScores[key];
    const cVal = companyScores[key];
    const isDealbreaker = companyDealbreakers?.[key] ?? false;

    // Skip dimensions where either side has no data
    if (sVal == null || cVal == null) {
      breakdown.push({
        key,
        label: `${dim.labelLow} ↔ ${dim.labelHigh}`,
        studentScore: sVal ?? 50,
        companyScore: cVal ?? 50,
        delta: 0,
        similarity: 50, // neutral when data is missing
        isDealbreaker,
        dealbreakerViolated: false,
      });
      continue;
    }

    const delta = Math.abs(sVal - cVal);
    const similarity = Math.round((1 - delta / 100) * 100);
    const violated = isDealbreaker && delta > DEALBREAKER_TOLERANCE;

    if (violated) dealbreakerFailed = true;

    breakdown.push({
      key,
      label: `${dim.labelLow} ↔ ${dim.labelHigh}`,
      studentScore: sVal,
      companyScore: cVal,
      delta,
      similarity,
      isDealbreaker,
      dealbreakerViolated: violated,
    });
  }

  if (dealbreakerFailed) {
    return { overallScore: 0, dealbreakerFailed: true, breakdown };
  }

  // Only average dimensions where both student and company have data
  const withData = breakdown.filter(
    (d) => studentScores[d.key] != null && companyScores[d.key] != null,
  );
  const overallScore = withData.length > 0
    ? Math.round(withData.reduce((sum, d) => sum + d.similarity, 0) / withData.length)
    : 50; // neutral if no overlapping data

  return { overallScore, dealbreakerFailed: false, breakdown };
}
