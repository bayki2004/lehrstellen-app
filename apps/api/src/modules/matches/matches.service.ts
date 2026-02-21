import { prisma } from '@lehrstellen/database';
import type { MatchDTO } from '@lehrstellen/shared';
import { ApiError } from '../../utils/ApiError';

export async function getMatches(userId: string, role: string): Promise<MatchDTO[]> {
  if (role === 'STUDENT') {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Profile not found');

    const matches = await prisma.match.findMany({
      where: { studentId: student.id, status: 'ACTIVE' },
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

    return matches.map((m) => mapToDTO(m, userId));
  }

  // Company: get matches for their listings
  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!company) throw ApiError.notFound('Profile not found');

  const matches = await prisma.match.findMany({
    where: {
      listing: { companyId: company.id },
      status: 'ACTIVE',
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

  // Verify user is part of this match
  const student = await prisma.studentProfile.findUnique({ where: { userId } });
  const company = await prisma.companyProfile.findUnique({ where: { userId } });

  const isStudent = student && match.studentId === student.id;
  const isCompany = company && match.listing.companyId === company.id;

  if (!isStudent && !isCompany) {
    throw ApiError.forbidden('Not authorized to view this match');
  }

  return mapToDTO(match, userId);
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
