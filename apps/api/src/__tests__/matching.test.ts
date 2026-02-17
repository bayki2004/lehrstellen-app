import { describe, it, expect } from 'vitest';
import { computeCompatibility } from '../services/matching.service';

// Helper to create a mock student profile
function mockStudent(overrides: Partial<Record<string, any>> = {}) {
  return {
    id: 'student-1',
    userId: 'user-1',
    firstName: 'Test',
    lastName: 'Student',
    dateOfBirth: new Date('2009-01-01'),
    canton: 'ZH',
    city: 'Zürich',
    bio: '',
    photoUrl: null,
    schoolLevel: null,
    gpa: null,
    oceanOpenness: 0.7,
    oceanConscientiousness: 0.8,
    oceanExtraversion: 0.5,
    oceanAgreeableness: 0.6,
    oceanNeuroticism: 0.3,
    riasecRealistic: 0.4,
    riasecInvestigative: 0.8,
    riasecArtistic: 0.3,
    riasecSocial: 0.5,
    riasecEnterprising: 0.6,
    riasecConventional: 0.7,
    quizCompletedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as any;
}

// Helper to create a mock listing
function mockListing(overrides: Partial<Record<string, any>> = {}) {
  return {
    id: 'listing-1',
    companyId: 'company-1',
    title: 'Informatiker/in EFZ',
    description: 'Test listing',
    field: 'informatik',
    canton: 'ZH',
    city: 'Zürich',
    requirements: [],
    spotsAvailable: 2,
    durationYears: 4,
    startDate: null,
    isActive: true,
    idealOceanOpenness: 0.7,
    idealOceanConscientiousness: 0.8,
    idealOceanExtraversion: 0.5,
    idealOceanAgreeableness: 0.6,
    idealOceanNeuroticism: 0.3,
    idealRiasecRealistic: 0.4,
    idealRiasecInvestigative: 0.8,
    idealRiasecArtistic: 0.3,
    idealRiasecSocial: 0.5,
    idealRiasecEnterprising: 0.6,
    idealRiasecConventional: 0.7,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as any;
}

describe('Matching Service', () => {
  describe('computeCompatibility', () => {
    it('returns perfect score for identical profiles', () => {
      const student = mockStudent();
      const listing = mockListing();
      const result = computeCompatibility(student, listing, ['informatik']);

      // Identical vectors → cosine similarity = 1.0 → 100 per category
      // Total = 100*0.35 + 100*0.35 + 100*0.20 + 100*0.10 = 100
      expect(result.totalScore).toBe(100);
      expect(result.breakdown).toHaveLength(4);
    });

    it('returns lower score for different cantons', () => {
      const student = mockStudent({ canton: 'BE' });
      const listing = mockListing({ canton: 'ZH' });

      const result = computeCompatibility(student, listing, ['informatik']);

      // Location drops from 100 to 30
      expect(result.totalScore).toBeLessThan(100);
      const locationBreakdown = result.breakdown.find((b) => b.label === 'Region');
      expect(locationBreakdown?.score).toBe(30);
    });

    it('returns 0 field score when desired fields do not match', () => {
      const student = mockStudent();
      const listing = mockListing({ field: 'informatik' });

      const result = computeCompatibility(student, listing, ['kv', 'polymechanik']);

      const fieldBreakdown = result.breakdown.find((b) => b.label === 'Berufsfeld');
      expect(fieldBreakdown?.score).toBe(0);
    });

    it('returns 50 field score when student has no desired fields', () => {
      const student = mockStudent();
      const listing = mockListing();

      const result = computeCompatibility(student, listing, []);

      const fieldBreakdown = result.breakdown.find((b) => b.label === 'Berufsfeld');
      expect(fieldBreakdown?.score).toBe(50);
    });

    it('handles zero OCEAN vectors gracefully', () => {
      const student = mockStudent({
        oceanOpenness: 0,
        oceanConscientiousness: 0,
        oceanExtraversion: 0,
        oceanAgreeableness: 0,
        oceanNeuroticism: 0,
      });
      const listing = mockListing();

      const result = computeCompatibility(student, listing, ['informatik']);

      // Zero magnitude → returns 0.5 neutral → score ~50
      const personalityBreakdown = result.breakdown.find((b) => b.label === 'Persoenlichkeit');
      expect(personalityBreakdown?.score).toBe(50);
      expect(result.totalScore).toBeGreaterThan(0);
    });

    it('uses field-based RIASEC fallback when listing has no RIASEC scores', () => {
      const student = mockStudent();
      const listing = mockListing({
        idealRiasecRealistic: null,
        idealRiasecInvestigative: null,
        idealRiasecArtistic: null,
        idealRiasecSocial: null,
        idealRiasecEnterprising: null,
        idealRiasecConventional: null,
      });

      const result = computeCompatibility(student, listing, ['informatik']);

      // Should still compute interest score via field RIASEC map
      const interestBreakdown = result.breakdown.find((b) => b.label === 'Interessen');
      expect(interestBreakdown?.score).toBeGreaterThanOrEqual(0);
      expect(interestBreakdown?.score).toBeLessThanOrEqual(100);
    });

    it('weights sum to 1.0', () => {
      const student = mockStudent();
      const listing = mockListing();
      const result = computeCompatibility(student, listing, ['informatik']);

      const totalWeight = result.breakdown.reduce((sum, b) => sum + b.weight, 0);
      expect(totalWeight).toBeCloseTo(1.0);
    });

    it('score is always between 0 and 100', () => {
      // Edge case: opposite personality vectors
      const student = mockStudent({
        oceanOpenness: 0.1,
        oceanConscientiousness: 0.1,
        oceanExtraversion: 0.9,
        oceanAgreeableness: 0.9,
        oceanNeuroticism: 0.1,
      });
      const listing = mockListing({
        idealOceanOpenness: 0.9,
        idealOceanConscientiousness: 0.9,
        idealOceanExtraversion: 0.1,
        idealOceanAgreeableness: 0.1,
        idealOceanNeuroticism: 0.9,
      });

      const result = computeCompatibility(student, listing, []);

      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);
    });
  });
});
