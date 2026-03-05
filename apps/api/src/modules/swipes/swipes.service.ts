import { prisma, type SwipeDirection } from '@lehrstellen/database';
import type { ListingWithScoreDTO, SwipeResponse, CultureScores, CultureDealbreakers } from '@lehrstellen/shared';
import { computeCompatibility, type CultureData } from '../../services/matching.service';
import { ApiError } from '../../utils/ApiError';
import { CANTON_NEIGHBORS } from '@lehrstellen/shared';
import { generateDefaultCards } from '../../utils/infoCards';

const FEED_SIZE = 50;
const MIN_SCORE = 30;
const DAILY_SWIPE_LIMIT = 5;

/** Map a Prisma Lehrstelle (with company + beruf includes) into a Listing-like shape for scoring. */
function lehrstelleToListing(r: any): any {
  const pf = (r.beruf?.personalityFit as Record<string, number>) ?? {};
  return {
    id: r.id,
    companyId: r.companyId ?? '',
    title: r.title,
    description: r.description ?? '',
    field: r.beruf?.field ?? '',
    canton: r.canton,
    city: r.city ?? '',
    durationYears: r.durationYears ?? 3,
    startDate: r.startDate,
    spotsAvailable: r.positionsAvailable ?? 1,
    isActive: true,
    requiredSchoolLevel: null,
    requiredLanguages: ['de'],
    createdAt: r.createdAt ?? new Date(),
    updatedAt: r.createdAt ?? new Date(),
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
    berufCode: r.berufCode ?? null,
    cards: generateDefaultCards(r),
    motivationQuestions: Array.isArray(r.motivationQuestions) ? r.motivationQuestions : [],
    // Company relation from Prisma include
    company: r.company ? {
      companyName: r.company.companyName ?? '',
      logoUrl: r.company.logoUrl ?? null,
      canton: r.company.canton ?? '',
      city: r.company.city ?? '',
    } : { companyName: '', logoUrl: null, canton: '', city: '' },
    // Culture data from imported company
    _companyCulture: r.company ? {
      hierarchyFocus: r.company.cultureHierarchyFocus ?? null,
      punctualityRigidity: r.company.culturePunctualityRigidity ?? null,
      resilienceGrit: r.company.cultureResilienceGrit ?? null,
      socialEnvironment: r.company.cultureSocialEnvironment ?? null,
      errorCulture: r.company.cultureErrorCulture ?? null,
      clientFacing: r.company.cultureClientFacing ?? null,
      digitalAffinity: r.company.cultureDigitalAffinity ?? null,
      prideFocus: r.company.culturePrideFocus ?? null,
    } as CultureData : undefined,
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
    motivationQuestions: Array.isArray(listing.motivationQuestions) ? listing.motivationQuestions : [],
    compatibilityScore: score,
    scoreBreakdown: breakdown,
    berufCode: listing.berufCode ?? undefined,
  };
}

/** Fetch lehrstellen via Prisma ORM with company + beruf includes. */
async function fetchLehrstellen(cantonFilter?: string[]): Promise<any[]> {
  try {
    return prisma.lehrstelle.findMany({
      where: {
        status: 'active',
        ...(cantonFilter && cantonFilter.length > 0 && { canton: { in: cantonFilter } }),
      },
      include: {
        beruf: { select: { field: true, personalityFit: true } },
        company: {
          select: {
            companyName: true, logoUrl: true, canton: true, city: true,
            cultureHierarchyFocus: true, culturePunctualityRigidity: true,
            cultureResilienceGrit: true, cultureSocialEnvironment: true,
            cultureErrorCulture: true, cultureClientFacing: true,
            cultureDigitalAffinity: true, culturePrideFocus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('[API] lehrstellen feed query failed — returning partial feed:', err);
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
  const favoriteRows = await prisma.studentFavoriteBeruf.findMany({
    where: { studentProfileId: student.id },
    select: { berufCode: true },
  });
  const favoriteBerufCodes = new Set(favoriteRows.map((r) => r.berufCode));

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
      // Extract culture data: from _companyCulture (lehrstellen) or company relation (Prisma)
      const companyCulture: CultureData | undefined = listing._companyCulture ?? (listing.company ? {
        hierarchyFocus: listing.company.cultureHierarchyFocus ?? null,
        punctualityRigidity: listing.company.culturePunctualityRigidity ?? null,
        resilienceGrit: listing.company.cultureResilienceGrit ?? null,
        socialEnvironment: listing.company.cultureSocialEnvironment ?? null,
        errorCulture: listing.company.cultureErrorCulture ?? null,
        clientFacing: listing.company.cultureClientFacing ?? null,
        digitalAffinity: listing.company.cultureDigitalAffinity ?? null,
        prideFocus: listing.company.culturePrideFocus ?? null,
      } : undefined);
      // Extract dealbreakers (Prisma listings only — lehrstellen don't have them)
      const companyDealbreakers: CultureDealbreakers | undefined = listing.company ? {
        hierarchyFocus: listing.company.dealbreakerHierarchyFocus ?? false,
        punctualityRigidity: listing.company.dealbreakerPunctualityRigidity ?? false,
        resilienceGrit: listing.company.dealbreakerResilienceGrit ?? false,
        socialEnvironment: listing.company.dealbreakerSocialEnvironment ?? false,
        errorCulture: listing.company.dealbreakerErrorCulture ?? false,
        clientFacing: listing.company.dealbreakerClientFacing ?? false,
        digitalAffinity: listing.company.dealbreakerDigitalAffinity ?? false,
        prideFocus: listing.company.dealbreakerPrideFocus ?? false,
      } : undefined;
      const result = computeCompatibility(student, listing, desiredFields, companyCulture, companyDealbreakers);
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

  // Fetch from lehrstellen table via Prisma ORM
  const r = await prisma.lehrstelle.findUnique({
    where: { id: lehrstelleId },
    include: {
      beruf: { select: { field: true, personalityFit: true } },
      company: { select: { companyName: true, canton: true, city: true } },
    },
  });
  if (!r) return null;

  const pf = (r.beruf?.personalityFit as Record<string, number>) ?? {};

  // Create proxy listing (companyId = lehrstelle's company UUID; FK was dropped)
  return prisma.listing.create({
    data: {
      id: r.id,
      companyId: r.companyId ?? 'lehrstellen-import',
      title: r.title ?? '',
      description: r.description ?? '',
      field: r.beruf?.field ?? 'Allgemein',
      canton: r.canton ?? '',
      city: r.city ?? '',
      durationYears: r.durationYears ?? 3,
      startDate: r.startDate ? new Date(r.startDate) : null,
      spotsAvailable: r.positionsAvailable ?? 1,
      // RIASEC from berufe personality_fit for proper scoring
      idealRiasecRealistic: pf.realistic ?? null,
      idealRiasecInvestigative: pf.investigative ?? null,
      idealRiasecArtistic: pf.artistic ?? null,
      idealRiasecSocial: pf.social ?? null,
      idealRiasecEnterprising: pf.enterprising ?? null,
      idealRiasecConventional: pf.conventional ?? null,
      cards: generateDefaultCards(r) as any,
      motivationQuestions: (Array.isArray(r.motivationQuestions) ? r.motivationQuestions : []) as any,
    },
  });
}

/** Count today's RIGHT/SUPER swipes and return remaining quota. */
export async function getSwipeRemaining(userId: string): Promise<{ remaining: number; limit: number; resetsAt: string }> {
  const student = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!student) throw ApiError.notFound('Student profile not found');

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const usedToday = await prisma.swipe.count({
    where: {
      studentId: student.id,
      direction: { in: ['RIGHT', 'SUPER'] },
      createdAt: { gte: todayStart },
    },
  });

  const tomorrow = new Date(todayStart);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    remaining: Math.max(0, DAILY_SWIPE_LIMIT - usedToday),
    limit: DAILY_SWIPE_LIMIT,
    resetsAt: tomorrow.toISOString(),
  };
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

  // Use transaction for swipe limit check + swipe + match creation (prevents race conditions)
  return prisma.$transaction(async (tx) => {
    // Enforce daily swipe limit for RIGHT/SUPER swipes
    if (direction === 'RIGHT' || direction === 'SUPER') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const usedToday = await tx.swipe.count({
        where: {
          studentId: student.id,
          direction: { in: ['RIGHT', 'SUPER'] },
          createdAt: { gte: todayStart },
        },
      });

      if (usedToday >= DAILY_SWIPE_LIMIT) {
        throw ApiError.tooManyRequests('Tageslimit erreicht (5 Swipes pro Tag)');
      }
    }

    // Record the swipe (unique constraint handles duplicate swipes)
    try {
      await tx.swipe.create({
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
      // Fetch company culture for the listing
      let companyCulture: CultureData | undefined;
      let companyDealbreakers: CultureDealbreakers | undefined;
      if (listing!.companyId) {
        const company = await tx.companyProfile.findUnique({
          where: { id: listing!.companyId },
          select: {
            cultureHierarchyFocus: true, culturePunctualityRigidity: true,
            cultureResilienceGrit: true, cultureSocialEnvironment: true,
            cultureErrorCulture: true, cultureClientFacing: true,
            cultureDigitalAffinity: true, culturePrideFocus: true,
            dealbreakerHierarchyFocus: true, dealbreakerPunctualityRigidity: true,
            dealbreakerResilienceGrit: true, dealbreakerSocialEnvironment: true,
            dealbreakerErrorCulture: true, dealbreakerClientFacing: true,
            dealbreakerDigitalAffinity: true, dealbreakerPrideFocus: true,
          },
        });
        if (company) {
          companyCulture = {
            hierarchyFocus: company.cultureHierarchyFocus,
            punctualityRigidity: company.culturePunctualityRigidity,
            resilienceGrit: company.cultureResilienceGrit,
            socialEnvironment: company.cultureSocialEnvironment,
            errorCulture: company.cultureErrorCulture,
            clientFacing: company.cultureClientFacing,
            digitalAffinity: company.cultureDigitalAffinity,
            prideFocus: company.culturePrideFocus,
          };
          companyDealbreakers = {
            hierarchyFocus: company.dealbreakerHierarchyFocus,
            punctualityRigidity: company.dealbreakerPunctualityRigidity,
            resilienceGrit: company.dealbreakerResilienceGrit,
            socialEnvironment: company.dealbreakerSocialEnvironment,
            errorCulture: company.dealbreakerErrorCulture,
            clientFacing: company.dealbreakerClientFacing,
            digitalAffinity: company.dealbreakerDigitalAffinity,
            prideFocus: company.dealbreakerPrideFocus,
          };
        }
      }
      const { totalScore } = computeCompatibility(student, listing!, desiredFields, companyCulture, companyDealbreakers);

      const match = await tx.match.create({
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
  });
}
