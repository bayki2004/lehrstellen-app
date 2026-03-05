import { prisma, type Beruf } from '@lehrstellen/database';
import { scrapeBerufDetail, type ScrapedBerufData } from '../../services/scraper.service';

export interface BerufeFilterParams {
  letter?: string;
  field?: string;
  q?: string;
  type?: string; // 'EFZ' | 'EBA'
}

export interface FieldCount {
  field: string;
  count: number;
}

export interface BerufDetailResponse extends Beruf {
  scraped?: ScrapedBerufData | null;
}

export interface BerufMatchDTO {
  beruf: {
    code: string;
    nameDe: string;
    field: string;
    educationType: string;
    durationYears: number | null;
    descriptionDe: string | null;
    personalityFit: Record<string, number>;
    hollandCode: string | null;
  };
  matchPercentage: number;
  sharedDimensions: { key: string; label: string; userScore: number; berufScore: number }[];
  explanations: string[];
}

// ── RIASEC matching helpers ──────────────────────────────────────────

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

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  if (magA === 0 || magB === 0) return 0;
  return Math.max(0, dot / (magA * magB));
}

// ── Service methods ──────────────────────────────────────────────────

export async function getBerufe(filters?: BerufeFilterParams): Promise<Beruf[]> {
  try {
    return prisma.beruf.findMany({
      where: {
        ...(filters?.letter && filters.letter.length === 1 && {
          nameDe: { startsWith: filters.letter, mode: 'insensitive' as const },
        }),
        ...(filters?.field && { field: filters.field }),
        ...(filters?.type && { educationType: filters.type.toUpperCase() }),
        ...(filters?.q && {
          nameDe: { contains: filters.q, mode: 'insensitive' as const },
        }),
      },
      orderBy: { nameDe: 'asc' },
    });
  } catch (error) {
    console.error('[API] getBerufe error:', error);
    throw error;
  }
}

export async function getBerufeFields(): Promise<FieldCount[]> {
  try {
    const groups = await prisma.beruf.groupBy({
      by: ['field'],
      _count: { code: true },
      orderBy: { field: 'asc' },
    });
    return groups.map((g) => ({ field: g.field, count: g._count.code }));
  } catch (error) {
    console.error('[API] getBerufeFields error:', error);
    throw error;
  }
}

export async function getBerufByCode(code: string): Promise<BerufDetailResponse | null> {
  const beruf = await prisma.beruf.findUnique({ where: { code } });
  if (!beruf) return null;

  // Use bb_id for scraping if available
  let scraped: ScrapedBerufData | null = null;
  const scrapeId = beruf.bbId || code;
  try {
    scraped = await scrapeBerufDetail(scrapeId);
  } catch {
    // Scraping failures are non-fatal
  }

  return { ...beruf, scraped };
}

export async function getBerufeMatches(userId: string): Promise<BerufMatchDTO[]> {
  // 1. Load student RIASEC profile
  const student = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!student) return [];

  const userVec = [
    student.riasecRealistic,
    student.riasecInvestigative,
    student.riasecArtistic,
    student.riasecSocial,
    student.riasecEnterprising,
    student.riasecConventional,
  ];

  const hasProfile = userVec.some((v) => v > 0);
  if (!hasProfile) return [];

  // 2. Load all berufe
  const berufe = await getBerufe();

  // 3. Score each beruf
  const matches: BerufMatchDTO[] = [];

  for (const beruf of berufe) {
    const pf = beruf.personalityFit;
    if (!pf || typeof pf !== 'object') continue;

    const berufVec = DIMENSION_KEYS.map((k) => (pf as Record<string, number>)[k] ?? 0);
    if (berufVec.every((v) => v === 0)) continue;

    const score = Math.round(cosineSimilarity(userVec, berufVec) * 100);

    // Find shared strong dimensions
    const shared = DIMENSION_KEYS
      .map((key, i) => ({
        key,
        label: DIMENSION_LABELS[key],
        userScore: userVec[i],
        berufScore: berufVec[i],
      }))
      .filter((d) => d.userScore >= 0.4 && d.berufScore >= 0.4)
      .sort((a, b) => (b.userScore + b.berufScore) - (a.userScore + a.berufScore));

    const explanations = shared
      .slice(0, 3)
      .map((d) => DIMENSION_EXPLANATIONS[d.key])
      .filter(Boolean);

    matches.push({
      beruf: {
        code: beruf.code,
        nameDe: beruf.nameDe,
        field: beruf.field,
        educationType: beruf.educationType,
        durationYears: beruf.durationYears,
        descriptionDe: beruf.descriptionDe,
        personalityFit: pf as Record<string, number>,
        hollandCode: beruf.hollandCode ?? null,
      },
      matchPercentage: score,
      sharedDimensions: shared,
      explanations,
    });
  }

  return matches
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 15);
}

// ── Lehrstellen by beruf code ────────────────────────────────────────

export async function getLehrstellenByBerufCode(berufCode: string) {
  const rows = await prisma.lehrstelle.findMany({
    where: { berufCode, status: 'active' },
    include: { company: { select: { companyName: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return {
    count: rows.length,
    lehrstellen: rows.map((r) => ({
      id: r.id,
      title: r.title,
      company_name: r.company.companyName,
      city: r.city,
      canton: r.canton,
      positions_available: r.positionsAvailable,
    })),
  };
}

// ── Favorite berufe CRUD ─────────────────────────────────────────────

export async function getFavoriteBerufe(studentProfileId: string): Promise<string[]> {
  const rows = await prisma.studentFavoriteBeruf.findMany({
    where: { studentProfileId },
    select: { berufCode: true },
  });
  return rows.map((r) => r.berufCode);
}

export async function toggleFavoriteBeruf(
  studentProfileId: string,
  berufCode: string,
): Promise<{ isFavorite: boolean }> {
  const existing = await prisma.studentFavoriteBeruf.findUnique({
    where: { studentProfileId_berufCode: { studentProfileId, berufCode } },
  });

  if (existing) {
    await prisma.studentFavoriteBeruf.delete({
      where: { studentProfileId_berufCode: { studentProfileId, berufCode } },
    });
    return { isFavorite: false };
  }

  await prisma.studentFavoriteBeruf.create({
    data: { studentProfileId, berufCode },
  });
  return { isFavorite: true };
}
