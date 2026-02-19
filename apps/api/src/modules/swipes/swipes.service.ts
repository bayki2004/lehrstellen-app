import { prisma, type SwipeDirection } from '@lehrstellen/database';
import type { ListingWithScoreDTO, SwipeResponse } from '@lehrstellen/shared';
import { computeCompatibility } from '../../services/matching.service';
import { ApiError } from '../../utils/ApiError';
import { CANTON_NEIGHBORS } from '@lehrstellen/shared';

const FEED_SIZE = 50;
const MIN_SCORE = 30;

export async function getSwipeFeed(userId: string): Promise<ListingWithScoreDTO[]> {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: { desiredFields: { orderBy: { priority: 'asc' } } },
  });

  if (!student) {
    throw ApiError.notFound('Student profile not found');
  }

  const quizDone = !!student.quizCompletedAt;

  // Get IDs of already-swiped listings
  const swipedListingIds = (
    await prisma.swipe.findMany({
      where: { studentId: student.id },
      select: { listingId: true },
    })
  ).map((s) => s.listingId);

  // Get neighboring cantons for broader matching (fall back to all cantons when quiz not done)
  const neighborCantons = CANTON_NEIGHBORS[student.canton] ?? [];
  const relevantCantons = quizDone
    ? [student.canton, ...neighborCantons]
    : undefined; // undefined = no canton filter

  // Fetch candidate listings (not yet swiped, active, nearby)
  const candidates = await prisma.listing.findMany({
    where: {
      isActive: true,
      spotsAvailable: { gt: 0 },
      id: { notIn: swipedListingIds },
      ...(relevantCantons ? { canton: { in: relevantCantons } } : {}),
    },
    include: { company: true },
    take: 200,
  });

  const desiredFields = student.desiredFields.map((d) => d.field);

  // Score and sort; when quiz not done use neutral score 50 for all listings
  const scored = candidates
    .map((listing) => {
      if (!quizDone) {
        return { listing, score: 50, breakdown: [] };
      }
      const result = computeCompatibility(student, listing, desiredFields);
      return {
        listing,
        score: result.totalScore,
        breakdown: result.breakdown,
      };
    })
    .filter((item) => !quizDone || item.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, FEED_SIZE);

  return scored.map(({ listing, score, breakdown }) => ({
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
    startDate: listing.startDate?.toISOString(),
    spotsAvailable: listing.spotsAvailable,
    requiredSchoolLevel: listing.requiredSchoolLevel ?? undefined,
    requiredLanguages: listing.requiredLanguages,
    createdAt: listing.createdAt.toISOString(),
    compatibilityScore: score,
    scoreBreakdown: breakdown,
  }));
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

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }

  // Check for duplicate swipe
  const existing = await prisma.swipe.findUnique({
    where: { studentId_listingId: { studentId: student.id, listingId } },
  });
  if (existing) {
    throw ApiError.conflict('Already swiped on this listing');
  }

  // Record the swipe
  await prisma.swipe.create({
    data: {
      studentId: student.id,
      listingId,
      direction,
    },
  });

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

    // Create system message
    await prisma.message.create({
      data: {
        matchId: match.id,
        senderId: userId,
        content: 'Es ist ein Match! Startet eine Unterhaltung.',
        type: 'SYSTEM',
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
