import { prisma } from '@lehrstellen/database';
import { scrapeBerufDetail, type ScrapedBerufData } from '../../services/scraper.service';

export interface BerufRow {
  code: string;
  name_de: string;
  name_fr: string | null;
  name_it: string | null;
  field: string;
  education_type: string;
  description_de: string | null;
  description_fr: string | null;
  description_it: string | null;
  personality_fit: any; // JSONB
  duration_years: number | null;
  holland_code?: string | null;
  bb_id?: string | null;
  anforderung_mathematik: number | null;
  anforderung_schulsprache: number | null;
  anforderung_naturwissenschaften: number | null;
  anforderung_fremdsprachen: number | null;
  lohn_lehrjahre: number[] | null;
}

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

export interface BerufDetailResponse extends BerufRow {
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

export async function getBerufe(filters?: BerufeFilterParams): Promise<BerufRow[]> {
  try {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let idx = 1;

    if (filters?.letter) {
      conditions.push(`UPPER(LEFT(name_de, 1)) = $${idx}`);
      params.push(filters.letter.toUpperCase());
      idx++;
    }
    if (filters?.field) {
      conditions.push(`field = $${idx}`);
      params.push(filters.field);
      idx++;
    }
    if (filters?.type) {
      conditions.push(`education_type = $${idx}`);
      params.push(filters.type.toUpperCase());
      idx++;
    }
    if (filters?.q) {
      conditions.push(`LOWER(name_de) LIKE $${idx}`);
      params.push(`%${filters.q.toLowerCase()}%`);
      idx++;
    }

    const query = `SELECT * FROM berufe WHERE ${conditions.join(' AND ')} ORDER BY name_de`;
    const res = await prisma.$queryRawUnsafe<any[]>(query, ...params);
    return res as BerufRow[];
  } catch (error) {
    console.error('[API] getBerufe error:', error);
    throw error;
  }
}

export async function getBerufeFields(): Promise<FieldCount[]> {
  try {
    const res = await prisma.$queryRaw<any[]>`
      SELECT field, COUNT(*)::int as count
      FROM berufe
      GROUP BY field
      ORDER BY field
    `;
    return res as FieldCount[];
  } catch (error) {
    console.error('[API] getBerufeFields error:', error);
    throw error;
  }
}

export async function getBerufByCode(code: string): Promise<BerufDetailResponse | null> {
  const rows = await prisma.$queryRaw<any[]>`
    SELECT *
    FROM berufe
    WHERE code = ${code}
  `;

  const beruf = rows[0] as BerufRow;
  if (!beruf) return null;

  // Use bb_id for scraping if available
  let scraped: ScrapedBerufData | null = null;
  const scrapeId = beruf.bb_id || code;
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
    const pf = beruf.personality_fit;
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
        nameDe: beruf.name_de,
        field: beruf.field,
        educationType: beruf.education_type,
        durationYears: beruf.duration_years,
        descriptionDe: beruf.description_de,
        personalityFit: pf as Record<string, number>,
        hollandCode: beruf.holland_code ?? null,
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
  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT l.id, l.title, l.city, l.canton, l.positions_available,
           c.company_name
    FROM lehrstellen l
    LEFT JOIN companies c ON l.company_id = c.id
    WHERE l.beruf_code = $1
      AND l.status = 'active'
    ORDER BY l.created_at DESC
  `, berufCode);

  return {
    count: rows.length,
    lehrstellen: rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      company_name: r.company_name ?? '',
      city: r.city,
      canton: r.canton,
      positions_available: r.positions_available ?? 1,
    })),
  };
}

// ── Favorite berufe CRUD ─────────────────────────────────────────────

export async function getFavoriteBerufe(studentProfileId: string): Promise<string[]> {
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT beruf_code FROM student_favorite_berufe WHERE student_profile_id = $1`,
    studentProfileId,
  );
  return rows.map((r: any) => r.beruf_code);
}

export async function toggleFavoriteBeruf(
  studentProfileId: string,
  berufCode: string,
): Promise<{ isFavorite: boolean }> {
  const existing = await prisma.$queryRawUnsafe<any[]>(
    `SELECT 1 FROM student_favorite_berufe WHERE student_profile_id = $1 AND beruf_code = $2`,
    studentProfileId,
    berufCode,
  );

  if (existing.length > 0) {
    await prisma.$executeRawUnsafe(
      `DELETE FROM student_favorite_berufe WHERE student_profile_id = $1 AND beruf_code = $2`,
      studentProfileId,
      berufCode,
    );
    return { isFavorite: false };
  }

  await prisma.$executeRawUnsafe(
    `INSERT INTO student_favorite_berufe (student_profile_id, beruf_code) VALUES ($1, $2)`,
    studentProfileId,
    berufCode,
  );
  return { isFavorite: true };
}
