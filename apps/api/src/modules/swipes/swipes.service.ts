import { prisma, type SwipeDirection } from '@lehrstellen/database';
import type { ListingWithScoreDTO, SwipeResponse } from '@lehrstellen/shared';
import { computeCompatibility } from '../../services/matching.service';
import { ApiError } from '../../utils/ApiError';
import { CANTON_NEIGHBORS } from '@lehrstellen/shared';
import { generateDefaultCards } from '../../utils/infoCards';

const FEED_SIZE = 50;
const MIN_SCORE = 30;

/** Map a lehrstellen row (raw SQL) into a Prisma-Listing-like shape for scoring. */
function lehrstelleToListing(r: any): any {
  const pf = r.personality_fit ?? {};
  return {
    id: r.id,
    companyId: r.company_id ?? '',
    title: r.title,
    description: r.description ?? '',
    field: r.field ?? '',
    canton: r.canton,
    city: r.city ?? '',
    durationYears: r.duration_years ?? 3,
    startDate: r.start_date,
    spotsAvailable: r.positions_available ?? 1,
    isActive: true,
    requiredSchoolLevel: null,
    requiredLanguages: ['de'],
    createdAt: r.created_at ?? new Date(),
    updatedAt: r.created_at ?? new Date(),
    berufsfeld: '',
    // OCEAN — no listing-level data, defaults handled by computeCompatibility
    idealOceanOpenness: null,
    idealOceanConscientiousness: null,
    idealOceanExtraversion: null,
    idealOceanAgreeableness: null,
    idealOceanNeuroticism: null,
    // RIASEC — use berufe personality_fit for proper matching
    idealRiasecRealistic: pf.realistic ?? null,
    idealRiasecInvestigative: pf.investigative ?? null,
    idealRiasecArtistic: pf.artistic ?? null,
    idealRiasecSocial: pf.social ?? null,
    idealRiasecEnterprising: pf.enterprising ?? null,
    idealRiasecConventional: pf.conventional ?? null,
    berufCode: r.beruf_code ?? null,
    cards: generateDefaultCards(r),
    // Fake company relation for DTO mapping
    company: {
      companyName: r.company_name ?? '',
      logoUrl: r.logo_url ?? null,
      canton: r.company_canton ?? '',
      city: r.company_city ?? '',
    },
  };
}

function listingToDTO(listing: any, score: number, breakdown: any): ListingWithScoreDTO {
  return {
    id: listing.id,
    companyId: listing.companyId,
    companyName: listing.company?.companyName ?? '',
    companyLogo: listing.company?.logoUrl ?? undefined,
    companyCanton: listing.company?.canton ?? '',
    companyCity: listing.company?.city ?? '',
    title: listing.title,
    description: listing.description,
    field: listing.field,
    canton: listing.canton,
    city: listing.city,
    durationYears: listing.durationYears,
    startDate: listing.startDate?.toISOString?.() ?? listing.startDate,
    spotsAvailable: listing.spotsAvailable,
    requiredSchoolLevel: listing.requiredSchoolLevel ?? undefined,
    requiredLanguages: listing.requiredLanguages ?? ['de'],
    createdAt: listing.createdAt?.toISOString?.() ?? new Date().toISOString(),
    cards: Array.isArray(listing.cards) ? listing.cards : [],
    compatibilityScore: score,
    scoreBreakdown: breakdown,
    berufCode: listing.berufCode ?? undefined,
  };
}

/** Fetch lehrstellen from the Supabase-managed table. */
async function fetchLehrstellen(cantonFilter?: string[]): Promise<any[]> {
  try {
    let cantonClause = '';
    const params: any[] = [];
    if (cantonFilter && cantonFilter.length > 0) {
      const placeholders = cantonFilter.map((c, i) => {
        params.push(c);
        return `$${i + 1}`;
      });
      cantonClause = `AND l.canton IN (${placeholders.join(',')})`;
    }
    const rows = await prisma.$queryRawUnsafe<any[]>(`
      SELECT l.id, l.title, l.description, l.canton, l.city,
             l.duration_years, l.start_date, l.positions_available, l.created_at,
             l.company_id, l.requirements, l.culture_description, l.beruf_code,
             b.field, b.personality_fit,
             c.company_name, c.logo_url, c.canton AS company_canton, c.city AS company_city
      FROM lehrstellen l
      LEFT JOIN berufe b ON l.beruf_code = b.code
      LEFT JOIN companies c ON l.company_id = c.id
      WHERE l.status = 'active' ${cantonClause}
      ORDER BY l.created_at DESC
    `, ...params);
    return rows || [];
  } catch (err) {
    console.error('[API DEBUG] lehrstellen feed query error:', err);
    return [];
  }
}

export async function getSwipeFeed(userId: string): Promise<ListingWithScoreDTO[]> {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: { desiredFields: { orderBy: { priority: 'asc' } } },
  });

  if (!student) {
    throw ApiError.notFound('Student profile not found');
  }

  // Fetch student's favorite beruf codes for score boost
  const favoriteRows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT beruf_code FROM student_favorite_berufe WHERE student_profile_id = $1`,
    student.id,
  );
  const favoriteBerufCodes = new Set(favoriteRows.map((r: any) => r.beruf_code));

  // Get IDs of already-swiped listings
  const swipedListingIds = (
    await prisma.swipe.findMany({
      where: { studentId: student.id },
      select: { listingId: true },
    })
  ).map((s) => s.listingId);

  // If quiz not completed, return listings sorted by recency (no compatibility scoring)
  if (!student.quizCompletedAt) {
    const [recentListings, lehrstellenRows] = await Promise.all([
      prisma.listing.findMany({
        where: {
          isActive: true,
          spotsAvailable: { gt: 0 },
          id: { notIn: swipedListingIds },
        },
        include: { company: true },
        orderBy: { createdAt: 'desc' },
        take: FEED_SIZE,
      }),
      fetchLehrstellen(),
    ]);

    const prismaResults = recentListings.map((listing) => listingToDTO(listing, 0, undefined));
    const lenaResults = lehrstellenRows
      .filter((r) => !swipedListingIds.includes(r.id))
      .map((r) => listingToDTO(lehrstelleToListing(r), 0, undefined));

    return [...prismaResults, ...lenaResults].slice(0, FEED_SIZE);
  }

  // Get neighboring cantons for broader matching
  const neighborCantons = CANTON_NEIGHBORS[student.canton] ?? [];
  const relevantCantons = [student.canton, ...neighborCantons];

  // Fetch candidates from both tables in parallel
  const [prismaCandidates, lehrstellenRows] = await Promise.all([
    prisma.listing.findMany({
      where: {
        isActive: true,
        spotsAvailable: { gt: 0 },
        id: { notIn: swipedListingIds },
        canton: { in: relevantCantons },
      },
      include: { company: true },
      take: 200,
    }),
    fetchLehrstellen(relevantCantons),
  ]);

  // Convert lehrstellen to listing-like objects and merge
  const lenaCandidates = lehrstellenRows
    .filter((r) => !swipedListingIds.includes(r.id))
    .map(lehrstelleToListing);

  const allCandidates = [...prismaCandidates, ...lenaCandidates];
  const desiredFields = student.desiredFields.map((d) => d.field);

  // Score and sort (with favorite beruf boost)
  const scored = allCandidates
    .map((listing) => {
      const result = computeCompatibility(student, listing, desiredFields);
      let score = result.totalScore;
      // Boost score for favorite berufe (+15, capped at 100)
      if (listing.berufCode && favoriteBerufCodes.has(listing.berufCode)) {
        score = Math.min(100, score + 15);
      }
      return { listing, score, breakdown: result.breakdown };
    })
    .filter((item) => item.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, FEED_SIZE);

  console.log('[API DEBUG] getSwipeFeed:', prismaCandidates.length, 'prisma +', lenaCandidates.length, 'lehrstellen =', allCandidates.length, 'candidates,', scored.length, 'after scoring');

  return scored.map(({ listing, score, breakdown }) =>
    listingToDTO(listing, score, breakdown),
  );
}

/**
 * When a student swipes on a lehrstelle (from the Supabase table), create a
 * proxy Listing record in the Prisma table so FK constraints on swipes/matches
 * are satisfied. Returns the proxy listing or null if not found.
 */
async function ensureLehrstelleProxy(lehrstelleId: string): Promise<any | null> {
  // Already exists as proxy?
  const existing = await prisma.listing.findUnique({ where: { id: lehrstelleId } });
  if (existing) return existing;

  // Fetch from Supabase lehrstellen table
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT l.id, l.title, l.description, l.canton, l.city,
            l.duration_years, l.start_date, l.positions_available,
            l.company_id, l.created_at, l.requirements, l.culture_description,
            b.field, b.personality_fit,
            c.company_name, c.canton AS company_canton, c.city AS company_city
     FROM lehrstellen l
     LEFT JOIN berufe b ON l.beruf_code = b.code
     LEFT JOIN companies c ON l.company_id = c.id
     WHERE l.id = $1::uuid`,
    lehrstelleId,
  );
  if (!rows.length) return null;

  const r = rows[0];

  const pf = r.personality_fit ?? {};

  // Create proxy listing (companyId = lehrstelle's company UUID; FK was dropped)
  return prisma.listing.create({
    data: {
      id: r.id,
      companyId: r.company_id ?? 'lehrstellen-import',
      title: r.title ?? '',
      description: r.description ?? '',
      field: r.field ?? 'Allgemein',
      canton: r.canton ?? '',
      city: r.city ?? '',
      durationYears: r.duration_years ?? 3,
      startDate: r.start_date ? new Date(r.start_date) : null,
      spotsAvailable: r.positions_available ?? 1,
      // RIASEC from berufe personality_fit for proper scoring
      idealRiasecRealistic: pf.realistic ?? null,
      idealRiasecInvestigative: pf.investigative ?? null,
      idealRiasecArtistic: pf.artistic ?? null,
      idealRiasecSocial: pf.social ?? null,
      idealRiasecEnterprising: pf.enterprising ?? null,
      idealRiasecConventional: pf.conventional ?? null,
      cards: generateDefaultCards(r),
    },
  });
}

export async function recordSwipe(
  userId: string,
  listingId: string,
  direction: SwipeDirection,
): Promise<SwipeResponse> {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: { desiredFields: true },
  });
  if (!student) {
    throw ApiError.notFound('Student profile not found');
  }

  // Try Prisma listings first, then lehrstellen proxy
  let listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });
  if (!listing) {
    listing = await ensureLehrstelleProxy(listingId);
  }
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }

  // Record the swipe (unique constraint handles race conditions)
  try {
    await prisma.swipe.create({
      data: {
        studentId: student.id,
        listingId,
        direction,
      },
    });
  } catch (e: any) {
    if (e.code === 'P2002') {
      throw ApiError.conflict('Already swiped on this listing');
    }
    throw e;
  }

  // If RIGHT or SUPER, create a match (MVP auto-match)
  if (direction === 'RIGHT' || direction === 'SUPER') {
    const desiredFields = student.desiredFields.map((d) => d.field);
    const { totalScore } = computeCompatibility(student, listing, desiredFields);

    const match = await prisma.match.create({
      data: {
        studentId: student.id,
        listingId,
        compatibilityScore: totalScore,
      },
    });

    return {
      isMatch: true,
      matchId: match.id,
      compatibilityScore: totalScore,
    };
  }

  return { isMatch: false };
}
