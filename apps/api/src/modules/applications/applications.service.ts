import { prisma, type ApplicationStatus } from '@lehrstellen/database';
import type {
  ApplicationDTO,
  ApplicationDossierDTO,
  ApplicationTimelineEntry,
  ListingDTO,
  OceanScores,
  RiasecScores,
  CultureScores,
  StudentGradeDTO,
} from '@lehrstellen/shared';
import { ApiError } from '../../utils/ApiError';
import { computeCompatibility } from '../../services/matching.service';
import { enrichLehrstellenCompanyData } from '../../utils/enrichLehrstellenCompany';

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
  motivationAnswers?: { question: string; answer: string }[];
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
        timeline: (match.application.timeline as unknown as ApplicationTimelineEntry[]) || [],
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
      timeline: (app.timeline as unknown as ApplicationTimelineEntry[]) || [],
      updatedAt: app.updatedAt.toISOString(),
      // Bewerbung content fields
      motivationAnswers: Array.isArray(app.motivationAnswers) ? (app.motivationAnswers as any[]) : [],
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

export async function getApplicationById(id: string) {
  const app = await prisma.application.findUnique({
    where: { id },
    include: { listing: { include: { company: true } }, student: true },
  });

  if (!app) throw ApiError.notFound('Application not found');
  await enrichLehrstellenCompanyData([app.listing]);
  const dto = mapToDTO(app);
  return {
    ...dto,
    student: app.student
      ? {
          firstName: app.student.firstName,
          lastName: app.student.lastName,
          canton: app.student.canton,
          city: app.student.city,
        }
      : undefined,
  };
}

export interface CreateApplicationPayload {
  matchId: string;
  motivationAnswers?: { question: string; answer: string }[];
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
      motivationAnswers: payload.motivationAnswers ?? [],
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
    include: { match: true, student: true },
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
        senderId: app.student.userId,
        content: 'Bewerbung angenommen! Ihr könnt jetzt chatten.',
        type: 'SYSTEM',
      },
    });
  }

  await enrichLehrstellenCompanyData([updated.listing]);
  return mapToDTO(updated);
}

export async function getApplicationDossier(
  applicationId: string,
  companyUserId: string,
): Promise<ApplicationDossierDTO> {
  const company = await prisma.companyProfile.findUnique({ where: { userId: companyUserId } });
  if (!company) throw ApiError.notFound('Company profile not found');

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      listing: { include: { company: true } },
      match: true,
      student: true,
    },
  });
  if (!app) throw ApiError.notFound('Application not found');
  if (app.listing.companyId !== company.id) {
    throw ApiError.forbidden('Not authorized to view this dossier');
  }

  await enrichLehrstellenCompanyData([app.listing]);

  const student = app.student;
  if (!student) throw ApiError.notFound('Student profile not found');

  // Fetch grades
  const grades = await prisma.studentGrade.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
  });

  // Compute compatibility
  const companyCulture: CultureScores = {
    hierarchyFocus: company.cultureHierarchyFocus,
    punctualityRigidity: company.culturePunctualityRigidity,
    resilienceGrit: company.cultureResilienceGrit,
    socialEnvironment: company.cultureSocialEnvironment,
    errorCulture: company.cultureErrorCulture,
    clientFacing: company.cultureClientFacing,
    digitalAffinity: company.cultureDigitalAffinity,
    prideFocus: company.culturePrideFocus,
  };

  const companyDealbreakers = {
    hierarchyFocus: company.dealbreakerHierarchyFocus,
    punctualityRigidity: company.dealbreakerPunctualityRigidity,
    resilienceGrit: company.dealbreakerResilienceGrit,
    socialEnvironment: company.dealbreakerSocialEnvironment,
    errorCulture: company.dealbreakerErrorCulture,
    clientFacing: company.dealbreakerClientFacing,
    digitalAffinity: company.dealbreakerDigitalAffinity,
    prideFocus: company.dealbreakerPrideFocus,
  };

  const desiredFieldRows = await prisma.studentDesiredField.findMany({
    where: { studentId: student.id },
  });
  const desiredFields = desiredFieldRows.map((f) => f.field);
  const compatibility = computeCompatibility(
    student,
    app.listing,
    desiredFields,
    companyCulture,
    companyDealbreakers,
  );

  const studentCulture: CultureScores = {
    hierarchyFocus: student.cultureHierarchyFocus,
    punctualityRigidity: student.culturePunctualityRigidity,
    resilienceGrit: student.cultureResilienceGrit,
    socialEnvironment: student.cultureSocialEnvironment,
    errorCulture: student.cultureErrorCulture,
    clientFacing: student.cultureClientFacing,
    digitalAffinity: student.cultureDigitalAffinity,
    prideFocus: student.culturePrideFocus,
  };

  return {
    application: mapToDTO(app),
    student: {
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth?.toISOString(),
      canton: student.canton,
      city: student.city,
      profilePhoto: student.profilePhoto ?? undefined,
      bio: student.bio ?? undefined,
      oceanScores: {
        openness: student.oceanOpenness,
        conscientiousness: student.oceanConscientiousness,
        extraversion: student.oceanExtraversion,
        agreeableness: student.oceanAgreeableness,
        neuroticism: student.oceanNeuroticism,
      },
      riasecScores: {
        realistic: student.riasecRealistic,
        investigative: student.riasecInvestigative,
        artistic: student.riasecArtistic,
        social: student.riasecSocial,
        enterprising: student.riasecEnterprising,
        conventional: student.riasecConventional,
      },
      cultureScores: studentCulture,
      desiredFields,
      motivationLetter: student.motivationLetter ?? undefined,
    },
    grades: grades.map((g) => ({
      id: g.id,
      documentType: g.documentType as StudentGradeDTO['documentType'],
      entryMethod: g.entryMethod as StudentGradeDTO['entryMethod'],
      canton: g.canton ?? undefined,
      niveau: g.niveau ?? undefined,
      semester: g.semester ?? undefined,
      schoolYear: g.schoolYear ?? undefined,
      testVariant: g.testVariant ?? undefined,
      testDate: g.testDate?.toISOString() ?? undefined,
      grades: g.grades as StudentGradeDTO['grades'],
      isVerified: g.isVerified,
      verifiedAt: g.verifiedAt?.toISOString() ?? undefined,
      createdAt: g.createdAt.toISOString(),
    })),
    compatibility: {
      totalScore: compatibility.totalScore,
      breakdown: compatibility.breakdown,
    },
    companyCulture,
  };
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
    motivationQuestions: Array.isArray(listing.motivationQuestions) ? listing.motivationQuestions : [],
  };
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
    motivationAnswers: Array.isArray(app.motivationAnswers) ? (app.motivationAnswers as any[]) : [],
    verfuegbarkeit: app.verfuegbarkeit ?? undefined,
    relevanteErfahrungen: (app.relevanteErfahrungen as string[]) ?? [],
    fragenAnBetrieb: app.fragenAnBetrieb ?? undefined,
    schnupperlehreWunsch: app.schnupperlehreWunsch,
  };
}
