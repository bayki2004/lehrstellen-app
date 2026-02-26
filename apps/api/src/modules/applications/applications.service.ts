import { prisma, type ApplicationStatus } from '@lehrstellen/database';
import type { ApplicationDTO, ApplicationTimelineEntry, ListingDTO } from '@lehrstellen/shared';
import { ApiError } from '../../utils/ApiError';

export type BewerbungSegment = 'offen' | 'gesendet' | 'erledigt';

export interface UnifiedBewerbungItem {
  segment: BewerbungSegment;
  // Present for all segments
  matchId: string;
  listingId: string;
  studentId: string;
  compatibilityScore: number;
  listing: ListingDTO;
  createdAt: string;
  // Present only for gesendet/erledigt (items that have an application)
  applicationId?: string;
  applicationStatus?: string;
  notes?: string;
  timeline?: ApplicationTimelineEntry[];
  updatedAt?: string;
  // Bewerbung content fields
  motivationsschreiben?: string;
  verfuegbarkeit?: string;
  relevanteErfahrungen?: string[];
  fragenAnBetrieb?: string;
  schnupperlehreWunsch?: boolean;
  // Student info (company side only)
  studentName?: string;
  studentPhoto?: string;
  studentCanton?: string;
  studentCity?: string;
}

const FINAL_STATUSES: string[] = ['ACCEPTED', 'REJECTED', 'WITHDRAWN'];

export async function getApplications(userId: string, role: string): Promise<UnifiedBewerbungItem[]> {
  if (role === 'STUDENT') {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Profile not found');

    // Fetch all active matches with their optional application and listing+company
    const matches = await prisma.match.findMany({
      where: { studentId: student.id, status: 'ACTIVE' },
      include: {
        listing: {
          include: {
            company: true,
          },
        },
        application: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Enrich lehrstellen proxies that have no Prisma company relation
    await enrichLehrstellenCompanyData(matches.map((m) => m.listing));

    return matches.map((match) => {
      const listingDTO = mapListingToDTO(match.listing);

      if (!match.application) {
        // No application yet → "Offen" segment
        return {
          segment: 'offen' as BewerbungSegment,
          matchId: match.id,
          listingId: match.listingId,
          studentId: match.studentId,
          compatibilityScore: match.compatibilityScore,
          listing: listingDTO,
          createdAt: match.createdAt.toISOString(),
        };
      }

      // Has application → determine segment based on status
      const segment: BewerbungSegment = FINAL_STATUSES.includes(match.application.status)
        ? 'erledigt'
        : 'gesendet';

      return {
        segment,
        matchId: match.id,
        listingId: match.listingId,
        studentId: match.studentId,
        compatibilityScore: match.compatibilityScore,
        listing: listingDTO,
        createdAt: match.createdAt.toISOString(),
        applicationId: match.application.id,
        applicationStatus: match.application.status,
        notes: match.application.notes ?? undefined,
        timeline: (match.application.timeline as ApplicationTimelineEntry[]) || [],
        updatedAt: match.application.updatedAt.toISOString(),
      };
    });
  }

  // COMPANY role: return applications for their listings (unchanged logic, add segment)
  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!company) throw ApiError.notFound('Profile not found');

  const apps = await prisma.application.findMany({
    where: { listing: { companyId: company.id } },
    include: { listing: { include: { company: true } }, match: true, student: true },
    orderBy: { updatedAt: 'desc' },
  });

  return apps.map((app) => {
    const listingDTO = mapListingToDTO(app.listing);
    const segment: BewerbungSegment = FINAL_STATUSES.includes(app.status)
      ? 'erledigt'
      : 'gesendet';

    return {
      segment,
      matchId: app.matchId,
      listingId: app.listingId,
      studentId: app.studentId,
      compatibilityScore: app.match?.compatibilityScore ?? 0,
      listing: listingDTO,
      createdAt: app.createdAt.toISOString(),
      applicationId: app.id,
      applicationStatus: app.status,
      notes: app.notes ?? undefined,
      timeline: (app.timeline as ApplicationTimelineEntry[]) || [],
      updatedAt: app.updatedAt.toISOString(),
      // Bewerbung content fields
      motivationsschreiben: app.motivationsschreiben ?? undefined,
      verfuegbarkeit: app.verfuegbarkeit ?? undefined,
      relevanteErfahrungen: (app.relevanteErfahrungen as string[]) ?? [],
      fragenAnBetrieb: app.fragenAnBetrieb ?? undefined,
      schnupperlehreWunsch: app.schnupperlehreWunsch,
      // Student info for company review
      studentName: app.student ? `${app.student.firstName} ${app.student.lastName}` : undefined,
      studentPhoto: app.student?.profilePhoto ?? undefined,
      studentCanton: app.student?.canton ?? undefined,
      studentCity: app.student?.city ?? undefined,
    };
  });
}

export async function getApplicationById(id: string): Promise<ApplicationDTO> {
  const app = await prisma.application.findUnique({
    where: { id },
    include: { listing: { include: { company: true } } },
  });

  if (!app) throw ApiError.notFound('Application not found');
  await enrichLehrstellenCompanyData([app.listing]);
  return mapToDTO(app);
}

export interface CreateApplicationPayload {
  matchId: string;
  motivationsschreiben?: string;
  verfuegbarkeit?: string;
  relevanteErfahrungen?: string[];
  fragenAnBetrieb?: string;
  schnupperlehreWunsch?: boolean;
}

export async function createApplication(userId: string, payload: CreateApplicationPayload): Promise<ApplicationDTO> {
  const student = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!student) throw ApiError.notFound('Profile not found');

  const match = await prisma.match.findUnique({ where: { id: payload.matchId } });
  if (!match || match.studentId !== student.id) {
    throw ApiError.notFound('Match not found');
  }

  const existing = await prisma.application.findUnique({
    where: { matchId: payload.matchId },
  });
  if (existing) throw ApiError.conflict('Application already exists for this match');

  const app = await prisma.application.create({
    data: {
      studentId: student.id,
      listingId: match.listingId,
      matchId: payload.matchId,
      motivationsschreiben: payload.motivationsschreiben,
      verfuegbarkeit: payload.verfuegbarkeit,
      relevanteErfahrungen: payload.relevanteErfahrungen ?? [],
      fragenAnBetrieb: payload.fragenAnBetrieb,
      schnupperlehreWunsch: payload.schnupperlehreWunsch ?? false,
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

  await enrichLehrstellenCompanyData([app.listing]);
  return mapToDTO(app);
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  note?: string,
): Promise<ApplicationDTO> {
  const app = await prisma.application.findUnique({
    where: { id },
    include: { match: true },
  });
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

  // Create system message when company ACCEPTS — this unlocks chat
  if (status === 'ACCEPTED' && app.matchId) {
    await prisma.message.create({
      data: {
        matchId: app.matchId,
        senderId: app.studentId,
        content: 'Bewerbung angenommen! Ihr könnt jetzt chatten.',
        type: 'SYSTEM',
      },
    });
  }

  await enrichLehrstellenCompanyData([updated.listing]);
  return mapToDTO(updated);
}

function mapListingToDTO(listing: any): ListingDTO {
  return {
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
  };
}

/**
 * For proxy listings (created from lehrstellen), the Prisma `company` relation
 * is null because companyId points to the Supabase `companies` table.
 * This function batch-fetches company info and injects it onto the listing objects.
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

function mapToDTO(app: any): ApplicationDTO {
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
    listing: mapListingToDTO(app.listing),
    motivationsschreiben: app.motivationsschreiben ?? undefined,
    verfuegbarkeit: app.verfuegbarkeit ?? undefined,
    relevanteErfahrungen: (app.relevanteErfahrungen as string[]) ?? [],
    fragenAnBetrieb: app.fragenAnBetrieb ?? undefined,
    schnupperlehreWunsch: app.schnupperlehreWunsch,
  };
}
