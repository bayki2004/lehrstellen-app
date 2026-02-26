import { prisma } from '@lehrstellen/database';
import type { MatchDTO } from '@lehrstellen/shared';
import { ApiError } from '../../utils/ApiError';

/**
 * For proxy listings (created from lehrstellen), the Prisma `company` relation
 * is null. Batch-fetch company info from Supabase `companies` table.
 */
async function enrichLehrstellenCompanyData(listings: any[]): Promise<void> {
  const needEnrichment = listings.filter((l) => l && !l.company);
  if (needEnrichment.length === 0) return;

  const companyIds = [...new Set(needEnrichment.map((l) => l.companyId).filter(Boolean))];
  if (companyIds.length === 0) return;

  const placeholders = companyIds.map((_, i) => `$${i + 1}::uuid`).join(',');
  const companies = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id, company_name, logo_url, canton, city FROM companies WHERE id IN (${placeholders})`,
    ...companyIds,
  );

  const companyMap = new Map(companies.map((c: any) => [c.id, c]));

  for (const listing of needEnrichment) {
    const c = companyMap.get(listing.companyId);
    if (c) {
      listing.company = {
        companyName: c.company_name,
        logoUrl: c.logo_url,
        canton: c.canton,
        city: c.city,
      };
    }
  }
}

export async function getMatches(userId: string, role: string): Promise<MatchDTO[]> {
  if (role === 'STUDENT') {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Profile not found');

    const matches = await prisma.match.findMany({
      where: {
        studentId: student.id,
        status: 'ACTIVE',
        application: { status: 'ACCEPTED' },
      },
      include: {
        listing: { include: { company: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: {
          select: {
            messages: { where: { isRead: false, senderId: { not: userId } } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    await enrichLehrstellenCompanyData(matches.map((m) => m.listing));
    return matches.map((m) => mapToDTO(m, userId));
  }

  // Company: get matches for their listings
  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!company) throw ApiError.notFound('Profile not found');

  const matches = await prisma.match.findMany({
    where: {
      listing: { companyId: company.id },
      status: 'ACTIVE',
      application: { status: 'ACCEPTED' },
    },
    include: {
      listing: { include: { company: true } },
      student: true,
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      _count: {
        select: {
          messages: { where: { isRead: false, senderId: { not: userId } } },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  await enrichLehrstellenCompanyData(matches.map((m) => m.listing));
  return matches.map((m) => mapToDTO(m, userId));
}

export async function getMatchById(userId: string, matchId: string): Promise<MatchDTO> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      listing: { include: { company: true } },
      student: { include: { desiredFields: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      _count: {
        select: {
          messages: { where: { isRead: false, senderId: { not: userId } } },
        },
      },
    },
  });

  if (!match) {
    throw ApiError.notFound('Match not found');
  }

  await enrichLehrstellenCompanyData([match.listing]);

  // Verify user is part of this match
  const student = await prisma.studentProfile.findUnique({ where: { userId } });
  const company = await prisma.companyProfile.findUnique({ where: { userId } });

  const isStudent = student && match.studentId === student.id;
  const isCompany = company && match.listing.companyId === company.id;

  if (!isStudent && !isCompany) {
    throw ApiError.forbidden('Not authorized to view this match');
  }

  // Chat is only available after application is accepted
  const application = await prisma.application.findUnique({ where: { matchId } });
  if (!application || application.status !== 'ACCEPTED') {
    throw ApiError.forbidden('Chat ist nur nach Annahme der Bewerbung verfügbar');
  }

  return mapToDTO(match, userId);
}

export async function dismissMatch(userId: string, matchId: string): Promise<void> {
  const student = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!student) throw ApiError.notFound('Profile not found');

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw ApiError.notFound('Match not found');

  if (match.studentId !== student.id) {
    throw ApiError.forbidden('Not authorized to dismiss this match');
  }

  // Delete related application (if any) and the match itself
  await prisma.$transaction([
    prisma.application.deleteMany({ where: { matchId } }),
    prisma.message.deleteMany({ where: { matchId } }),
    prisma.match.delete({ where: { id: matchId } }),
  ]);
}

function mapToDTO(match: any, userId: string): MatchDTO {
  const listing = match.listing;
  return {
    id: match.id,
    studentId: match.studentId,
    listingId: match.listingId,
    compatibilityScore: match.compatibilityScore,
    status: match.status,
    createdAt: match.createdAt.toISOString(),
    listing: {
      id: listing.id,
      companyId: listing.companyId,
      companyName: listing.company?.companyName ?? '',
      companyLogo: listing.company?.logoUrl,
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
      requiredSchoolLevel: listing.requiredSchoolLevel,
      requiredLanguages: listing.requiredLanguages,
      createdAt: listing.createdAt.toISOString(),
    },
    student: match.student
      ? {
          id: match.student.id,
          firstName: match.student.firstName,
          lastName: match.student.lastName,
          dateOfBirth: match.student.dateOfBirth.toISOString(),
          canton: match.student.canton,
          city: match.student.city,
          bio: match.student.bio,
          profilePhoto: match.student.profilePhoto,
          oceanScores: {
            openness: match.student.oceanOpenness,
            conscientiousness: match.student.oceanConscientiousness,
            extraversion: match.student.oceanExtraversion,
            agreeableness: match.student.oceanAgreeableness,
            neuroticism: match.student.oceanNeuroticism,
          },
          riasecScores: {
            realistic: match.student.riasecRealistic,
            investigative: match.student.riasecInvestigative,
            artistic: match.student.riasecArtistic,
            social: match.student.riasecSocial,
            enterprising: match.student.riasecEnterprising,
            conventional: match.student.riasecConventional,
          },
          quizCompleted: !!match.student.quizCompletedAt,
          desiredFields: (match.student.desiredFields ?? []).map((d: any) => d.field),
        }
      : undefined,
    lastMessage: match.messages?.[0]
      ? {
          id: match.messages[0].id,
          matchId: match.messages[0].matchId,
          senderId: match.messages[0].senderId,
          content: match.messages[0].content,
          type: match.messages[0].type,
          isRead: match.messages[0].isRead,
          createdAt: match.messages[0].createdAt.toISOString(),
        }
      : undefined,
    unreadCount: match._count?.messages ?? 0,
  };
}
