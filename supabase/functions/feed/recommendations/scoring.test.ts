import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  cosineSimilarity,
  computeScore,
  riasecScore,
  interestsScore,
  workValuesScore,
  educationFitScore,
  premiumScore,
  type StudentData,
  type LehrstelleCandidate,
} from "./scoring.ts";
import { proximityScore, combinedProximityScore } from "./canton-data.ts";

// --- Cosine Similarity ---

Deno.test("cosine similarity: identical vectors → 1.0", () => {
  const v = [0.5, 0.8, 0.3, 0.9, 0.1, 0.4];
  const result = cosineSimilarity(v, v);
  assertAlmostEquals(result, 1.0);
});

Deno.test("cosine similarity: orthogonal vectors → 0.0", () => {
  const a = [1, 0, 0];
  const b = [0, 1, 0];
  assertEquals(cosineSimilarity(a, b), 0);
});

Deno.test("cosine similarity: zero vector → 0.0", () => {
  assertEquals(cosineSimilarity([0, 0, 0], [1, 2, 3]), 0);
});

Deno.test("cosine similarity: known values", () => {
  // Student: strong Investigative + Artistic
  const student = [0.2, 0.9, 0.8, 0.3, 0.1, 0.2];
  // Informatiker: strong Investigative + Conventional
  const beruf = [0.3, 0.9, 0.4, 0.2, 0.3, 0.5];
  const result = cosineSimilarity(student, beruf);
  // Should be high but not 1.0 due to different A vs C emphasis
  assert(result > 0.7 && result < 1.0, `Expected 0.7-1.0, got ${result}`);
});

// --- Canton Proximity ---

Deno.test("proximity: same canton → 1.0", () => {
  assertEquals(proximityScore("ZH", "ZH"), 1.0);
});

Deno.test("proximity: adjacent, same language → 0.75", () => {
  assertEquals(proximityScore("ZH", "AG"), 0.75);
});

Deno.test("proximity: non-adjacent, same language → 0.50", () => {
  // ZH and BE are both German but not adjacent
  assertEquals(proximityScore("ZH", "BE"), 0.50);
});

Deno.test("proximity: adjacent, different language → 0.35", () => {
  // BE and FR are adjacent but FR is bilingual de/fr, BE is de
  // Actually FR is bilingual so they share language. Let's use a better example.
  // VD (fr) and VS (de/fr) are adjacent and share fr → 0.75
  // TI (it) and GR (de/rm) are adjacent and different → 0.35
  assertEquals(proximityScore("TI", "GR"), 0.35);
});

Deno.test("proximity: far, different language → 0.10", () => {
  // ZH (de) and TI (it), not adjacent
  assertEquals(proximityScore("ZH", "TI"), 0.10);
});

Deno.test("combined proximity: with berufsschule", () => {
  // Lehrstelle in ZH, Berufsschule in BE, student in AG
  const result = combinedProximityScore("AG", "ZH", "BE");
  // lehrstelleScore: AG-ZH adjacent+de = 0.75
  // berufsschuleScore: AG-BE adjacent+de = 0.75
  // combined: 0.6*0.75 + 0.4*0.75 = 0.75
  assertAlmostEquals(result, 0.75);
});

Deno.test("combined proximity: no berufsschule falls back to lehrstelle", () => {
  const result = combinedProximityScore("ZH", "BE", null);
  assertEquals(result, proximityScore("ZH", "BE"));
});

// --- Interests ---

Deno.test("interests: matching berufsfeld → high score", () => {
  const result = interestsScore(
    ["Informatik", "Gaming"],
    ["Computer"],
    "Informatik",
    ["Innovation", "Teamwork"],
  );
  // Berufsfeld match (0.6) + some tag overlap
  assert(result >= 0.6, `Expected >= 0.6, got ${result}`);
});

Deno.test("interests: no match → low score", () => {
  const result = interestsScore(
    ["Fussball", "Musik"],
    ["Sport"],
    "Kaufmännisch",
    ["Büro", "Excel"],
  );
  assertEquals(result, 0); // No field match, no tag overlap
});

// --- Education Fit ---

Deno.test("education: EFZ with high multicheck → 1.0", () => {
  assertEquals(educationFitScore("EFZ", 85), 1.0);
});

Deno.test("education: EFZ with low multicheck → 0.2", () => {
  assertEquals(educationFitScore("EFZ", 20), 0.2);
});

Deno.test("education: EBA sweet spot → 1.0", () => {
  assertEquals(educationFitScore("EBA", 50), 1.0);
});

Deno.test("education: EBA overqualified → 0.6", () => {
  assertEquals(educationFitScore("EBA", 80), 0.6);
});

Deno.test("education: no multicheck → neutral 0.6", () => {
  assertEquals(educationFitScore("EFZ", null), 0.6);
  assertEquals(educationFitScore("EBA", null), 0.6);
});

// --- Premium ---

Deno.test("premium: verified + premium → 1.0", () => {
  assertEquals(premiumScore(true, true), 1.0);
});

Deno.test("premium: verified only → 0.5", () => {
  assertEquals(premiumScore(true, false), 0.5);
});

Deno.test("premium: neither → 0.0", () => {
  assertEquals(premiumScore(false, false), 0.0);
});

// --- Full Composite Score ---

Deno.test("composite: with personality profile", () => {
  const student: StudentData = {
    canton: "ZH",
    preferredLanguage: "de",
    interests: ["Informatik", "Programmieren"],
    skills: ["Computer", "Englisch"],
    multicheckScore: 75,
    hollandCodes: [0.3, 0.9, 0.4, 0.2, 0.3, 0.5], // Investigative-dominant
    workValues: [0.5, 0.8, 0.6, 0.7, 0.6, 0.2, 0.1, 1.0],
  };

  const lehrstelle: LehrstelleCandidate = {
    id: "test-1",
    canton: "ZH",
    berufsschuleCanton: "ZH",
    educationType: "EFZ",
    berufField: "Informatik",
    personalityFit: {
      realistic: 0.3, investigative: 0.9, artistic: 0.4,
      social: 0.2, enterprising: 0.3, conventional: 0.5,
    },
    cultureTags: ["Innovation", "Teamwork"],
    verified: true,
    premium: true,
  };

  const score = computeScore(student, lehrstelle);
  // Perfect RIASEC match + same canton + matching field + high multicheck for EFZ
  assert(score > 0.8, `Expected > 0.8, got ${score}`);
  assert(score <= 1.0, `Expected <= 1.0, got ${score}`);
});

Deno.test("composite: cold start (no personality)", () => {
  const student: StudentData = {
    canton: "ZH",
    preferredLanguage: "de",
    interests: ["Informatik"],
    skills: ["Computer"],
    multicheckScore: null,
    hollandCodes: null,
    workValues: null,
  };

  const lehrstelle: LehrstelleCandidate = {
    id: "test-2",
    canton: "ZH",
    berufsschuleCanton: null,
    educationType: "EFZ",
    berufField: "Informatik",
    personalityFit: { realistic: 0.3, investigative: 0.9 },
    cultureTags: ["Informatik"],
    verified: true,
    premium: false,
  };

  const score = computeScore(student, lehrstelle);
  // proximity=1.0(0.45) + interests=~1.0(0.35) + education=0.6(0.20)
  assert(score > 0.5, `Cold start score should be > 0.5, got ${score}`);
  assert(score <= 1.0, `Expected <= 1.0, got ${score}`);
});

Deno.test("composite: poor match", () => {
  const student: StudentData = {
    canton: "ZH",
    preferredLanguage: "de",
    interests: ["Fussball"],
    skills: ["Sport"],
    multicheckScore: 30,
    hollandCodes: [0.9, 0.1, 0.1, 0.1, 0.1, 0.1], // Strong Realistic
    workValues: [0.2, 0.3, 0.1, 0.3, 0.5, 0.2, 0.9, 0.1],
  };

  const lehrstelle: LehrstelleCandidate = {
    id: "test-3",
    canton: "GE",
    berufsschuleCanton: "GE",
    educationType: "EFZ",
    berufField: "Kaufmännisch",
    personalityFit: {
      realistic: 0.2, investigative: 0.3, artistic: 0.1,
      social: 0.4, enterprising: 0.5, conventional: 0.8,
    },
    cultureTags: ["Büro", "Ordnung"],
    verified: false,
    premium: false,
  };

  const score = computeScore(student, lehrstelle);
  // Poor RIASEC match + far away + no interest match + low multicheck for EFZ
  assert(score < 0.4, `Poor match should be < 0.4, got ${score}`);
});

// --- Helpers ---

function assertAlmostEquals(actual: number, expected: number, tolerance = 0.01) {
  assert(
    Math.abs(actual - expected) < tolerance,
    `Expected ${expected} ± ${tolerance}, got ${actual}`,
  );
}

function assert(condition: boolean, msg?: string) {
  if (!condition) throw new Error(msg ?? "Assertion failed");
}
