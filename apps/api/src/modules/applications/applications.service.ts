import { prisma, type ApplicationStatus } from '@lehrstellen/database';
import type { ApplicationDTO, ApplicationTimelineEntry } from '@lehrstellen/shared';
import { ApiError } from '../../utils/ApiError';

export async function getApplications(userId: string, role: string): Promise<ApplicationDTO[]> {
  if (role === 'STUDENT') {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Profile not found');

    const apps = await prisma.application.findMany({
      where: { studentId: student.id },
      include: { listing: { include: { company: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    return apps.map(mapToDTO);
  }

  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!company) throw ApiError.notFound('Profile not found');

  const apps = await prisma.application.findMany({
    where: { listing: { companyId: company.id } },
    include: { listing: { include: { company: true } } },
    orderBy: { updatedAt: 'desc' },
  });

  return apps.map(mapToDTO);
}

export async function getApplicationById(id: string): Promise<ApplicationDTO> {
  const app = await prisma.application.findUnique({
    where: { id },
    include: { listing: { include: { company: true } } },
  });

  if (!app) throw ApiError.notFound('Application not found');
  return mapToDTO(app);
}

export async function createApplication(userId: string, matchId: string): Promise<ApplicationDTO> {
  const student = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!student) throw ApiError.notFound('Profile not found');

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || match.studentId !== student.id) {
    throw ApiError.notFound('Match not found');
  }

  const existing = await prisma.application.findUnique({
    where: { matchId },
  });
  if (existing) throw ApiError.conflict('Application already exists for this match');

  const app = await prisma.application.create({
    data: {
      studentId: student.id,
      listingId: match.listingId,
      matchId,
      timeline: [
        {
          status: 'PENDING',
          timestamp: new Date().toISOString(),
          note: 'Bewerbung eingereicht',
        },
      ],
    },
    include: { listing: { include: { company: true } } },
  });

  return mapToDTO(app);
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  note?: string,
): Promise<ApplicationDTO> {
  const app = await prisma.application.findUnique({ where: { id } });
  if (!app) throw ApiError.notFound('Application not found');

  const currentTimeline = (app.timeline as unknown as ApplicationTimelineEntry[]) || [];
  const newEntry = {
    status,
    timestamp: new Date().toISOString(),
    ...(note && { note }),
  };

  const updated = await prisma.application.update({
    where: { id },
    data: {
      status,
      timeline: [...currentTimeline, newEntry] as any,
      ...(note && { notes: note }),
    },
    include: { listing: { include: { company: true } } },
  });

  return mapToDTO(updated);
}

function mapToDTO(app: any): ApplicationDTO {
  const listing = app.listing;
  return {
    id: app.id,
    studentId: app.studentId,
    listingId: app.listingId,
    matchId: app.matchId,
    status: app.status,
    notes: app.notes,
    timeline: (app.timeline as ApplicationTimelineEntry[]) || [],
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
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
  };
}
