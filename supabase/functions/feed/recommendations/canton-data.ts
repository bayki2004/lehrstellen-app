/**
 * Swiss canton proximity data for matching algorithm.
 * Canton adjacency, language regions, and Berufsfeld work value profiles.
 */

// All 26 Swiss cantons → list of adjacent cantons
export const CANTON_ADJACENCY: Record<string, string[]> = {
  ZH: ["SH", "TG", "SG", "SZ", "ZG", "AG", "LU"],
  BE: ["SO", "JU", "NE", "FR", "VS", "LU", "NW", "OW", "AG"],
  LU: ["BE", "OW", "NW", "UR", "SZ", "ZG", "AG", "ZH"],
  UR: ["SZ", "NW", "OW", "BE", "GR", "TI", "LU"],
  SZ: ["ZH", "ZG", "LU", "UR", "GL", "SG"],
  OW: ["BE", "NW", "LU"],
  NW: ["OW", "LU", "UR"],
  GL: ["SZ", "SG", "GR", "UR"],
  ZG: ["ZH", "LU", "SZ"],
  FR: ["BE", "NE", "VD"],
  SO: ["BE", "AG", "BL", "JU"],
  BS: ["BL"],
  BL: ["BS", "SO", "AG", "JU"],
  SH: ["ZH", "TG"],
  AR: ["AI", "SG"],
  AI: ["AR", "SG"],
  SG: ["ZH", "TG", "AR", "AI", "GR", "GL", "SZ"],
  GR: ["SG", "GL", "UR", "TI"],
  AG: ["ZH", "ZG", "LU", "BE", "SO", "BL"],
  TG: ["ZH", "SH", "SG"],
  TI: ["GR", "UR", "VS"],
  VD: ["FR", "NE", "GE", "VS"],
  VS: ["VD", "BE", "TI"],
  NE: ["VD", "FR", "BE", "JU"],
  GE: ["VD"],
  JU: ["NE", "BE", "SO", "BL"],
};

// Primary language region per canton (bilingual cantons listed as primary/secondary)
const CANTON_LANGUAGES: Record<string, string[]> = {
  ZH: ["de"], BE: ["de"], LU: ["de"], UR: ["de"], SZ: ["de"],
  OW: ["de"], NW: ["de"], GL: ["de"], ZG: ["de"], SO: ["de"],
  BS: ["de"], BL: ["de"], SH: ["de"], AR: ["de"], AI: ["de"],
  SG: ["de"], AG: ["de"], TG: ["de"],
  FR: ["de", "fr"], // bilingual
  GR: ["de", "rm"], // bilingual
  VS: ["de", "fr"], // bilingual
  VD: ["fr"], NE: ["fr"], GE: ["fr"], JU: ["fr"],
  TI: ["it"],
};

/**
 * Check if two cantons share a language region.
 * For bilingual cantons, checks if any language overlaps.
 * studentLang is used to determine the student's primary language for bilingual cantons.
 */
export function sameLanguageRegion(
  cantonA: string,
  cantonB: string,
): boolean {
  const langsA = CANTON_LANGUAGES[cantonA] ?? ["de"];
  const langsB = CANTON_LANGUAGES[cantonB] ?? ["de"];
  return langsA.some((l) => langsB.includes(l));
}

/**
 * Compute proximity score between a student's canton and a target canton.
 *
 * Tiers:
 *   Same canton           → 1.00
 *   Adjacent, same lang   → 0.75
 *   Non-adj, same lang    → 0.50
 *   Adjacent, diff lang   → 0.35
 *   Far, diff lang        → 0.10
 */
export function proximityScore(
  studentCanton: string,
  targetCanton: string,
): number {
  if (studentCanton === targetCanton) return 1.0;

  const adjacent = CANTON_ADJACENCY[studentCanton]?.includes(targetCanton) ?? false;
  const sameLang = sameLanguageRegion(studentCanton, targetCanton);

  if (adjacent && sameLang) return 0.75;
  if (!adjacent && sameLang) return 0.50;
  if (adjacent && !sameLang) return 0.35;
  return 0.10;
}

/**
 * Combined proximity score factoring in both Lehrstelle location and Berufsschule location.
 * Lehrstelle weight: 60%, Berufsschule weight: 40%
 */
export function combinedProximityScore(
  studentCanton: string,
  lehrstelleCanton: string,
  berufsschuleCanton: string | null,
): number {
  const lehrstelleScore = proximityScore(studentCanton, lehrstelleCanton);

  if (!berufsschuleCanton) {
    // No Berufsschule data — use Lehrstelle canton as fallback
    return lehrstelleScore;
  }

  const berufsschuleScore = proximityScore(studentCanton, berufsschuleCanton);
  return 0.6 * lehrstelleScore + 0.4 * berufsschuleScore;
}

/**
 * Implied work value vectors per Berufsfeld.
 * 8 dimensions: [teamwork, independence, creativity, stability,
 *                variety, helpingOthers, physicalActivity, technology]
 */
export const BERUFSFELD_WORK_VALUES: Record<string, number[]> = {
  "Informatik":         [0.5, 0.8, 0.6, 0.7, 0.6, 0.2, 0.1, 1.0],
  "Technik":            [0.6, 0.4, 0.3, 0.7, 0.5, 0.2, 0.7, 0.8],
  "Gesundheit":         [0.9, 0.3, 0.2, 0.6, 0.7, 1.0, 0.6, 0.3],
  "Kaufmännisch":       [0.7, 0.5, 0.3, 0.8, 0.5, 0.3, 0.1, 0.5],
  "Handwerk":           [0.5, 0.6, 0.7, 0.5, 0.6, 0.2, 0.9, 0.3],
  "Gastronomie":        [0.8, 0.3, 0.6, 0.4, 0.7, 0.5, 0.7, 0.2],
  "Detailhandel":       [0.7, 0.4, 0.3, 0.5, 0.6, 0.6, 0.4, 0.3],
  "Design & Medien":    [0.4, 0.7, 1.0, 0.4, 0.7, 0.2, 0.1, 0.7],
  "Soziales":           [0.9, 0.3, 0.4, 0.5, 0.6, 1.0, 0.4, 0.2],
  "Bau":                [0.7, 0.4, 0.2, 0.5, 0.5, 0.2, 1.0, 0.3],
  "Logistik":           [0.6, 0.5, 0.1, 0.6, 0.4, 0.2, 0.7, 0.5],
  "Natur & Umwelt":     [0.4, 0.6, 0.4, 0.4, 0.7, 0.3, 1.0, 0.2],
};
