import { prisma } from '@lehrstellen/database';
import type { ListingDTO, CreateListingRequest } from '@lehrstellen/shared';
import { ApiError } from '../../utils/ApiError';
import { generateDefaultCards } from '../../utils/infoCards';

export async function getListings(filters?: {
  field?: string;
  canton?: string;
  companyId?: string;
}): Promise<ListingDTO[]> {
  try {
    // 1. Prisma listings (company-created)
    const prismaListings = await prisma.listing.findMany({
      where: {
        isActive: true,
        ...(filters?.field && { field: filters.field }),
        ...(filters?.canton && { canton: filters.canton }),
        ...(filters?.companyId && { companyId: filters.companyId }),
      },
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Supabase lehrstellen (LENA-imported) — now via Prisma ORM
    let lehrstellenDTOs: ListingDTO[] = [];
    try {
      const rows = await prisma.lehrstelle.findMany({
        where: {
          status: 'active',
          ...(filters?.canton && { canton: filters.canton }),
          ...(filters?.field && { beruf: { field: filters.field } }),
        },
        include: {
          company: { select: { companyName: true, logoUrl: true, canton: true, city: true } },
          beruf: { select: { field: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      lehrstellenDTOs = rows.map((r) => ({
        id: r.id,
        companyId: r.companyId,
        companyName: r.company.companyName,
        companyLogo: r.company.logoUrl ?? undefined,
        companyCanton: r.company.canton,
        companyCity: r.company.city,
        title: r.title,
        description: r.description ?? '',
        field: r.beruf.field,
        canton: r.canton,
        city: r.city ?? '',
        durationYears: r.durationYears,
        startDate: r.startDate?.toISOString(),
        spotsAvailable: r.positionsAvailable,
        requiredLanguages: ['de'],
        createdAt: r.createdAt.toISOString(),
        cards: generateDefaultCards(r),
        motivationQuestions: Array.isArray(r.motivationQuestions) ? r.motivationQuestions as any[] : [],
      }));
    } catch (err) {
      console.error('[API] lehrstellen query failed — returning partial results:', err);
      // Log but don't throw: Prisma listings are still valid, lehrstellen are supplementary
    }

    // Deduplicate: lehrstellen entries have richer company data, so prefer them
    const lehrstellenIds = new Set(lehrstellenDTOs.map((l) => l.id));
    const uniquePrisma = prismaListings.map(mapToDTO).filter((l) => !lehrstellenIds.has(l.id));
    const combined = [...uniquePrisma, ...lehrstellenDTOs];
    console.log('[API DEBUG] getListings found:', prismaListings.length, 'prisma +', lehrstellenDTOs.length, 'lehrstellen =', combined.length, 'total (after dedup)');
    return combined;
  } catch (error) {
    console.error('[API DEBUG] getListings error:', error);
    throw error;
  }
}

export async function getListingById(id: string): Promise<ListingDTO> {
  // Try Prisma listings first
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { company: true },
  });

  if (listing) {
    return mapToDTO(listing);
  }

  // Fall back to lehrstellen table (LENA-imported) — now via Prisma ORM
  try {
    const r = await prisma.lehrstelle.findUnique({
      where: { id },
      include: {
        company: { select: { companyName: true, logoUrl: true, canton: true, city: true } },
        beruf: { select: { field: true } },
      },
    });
    if (r) {
      return {
        id: r.id,
        companyId: r.companyId,
        companyName: r.company.companyName,
        companyLogo: r.company.logoUrl ?? undefined,
        companyCanton: r.company.canton,
        companyCity: r.company.city,
        title: r.title,
        description: r.description ?? '',
        field: r.beruf.field,
        canton: r.canton,
        city: r.city ?? '',
        durationYears: r.durationYears,
        startDate: r.startDate?.toISOString(),
        spotsAvailable: r.positionsAvailable,
        requiredLanguages: ['de'],
        createdAt: r.createdAt.toISOString(),
        cards: generateDefaultCards(r),
        motivationQuestions: Array.isArray(r.motivationQuestions) ? r.motivationQuestions as any[] : [],
      };
    }
  } catch (err) {
    console.error('[API DEBUG] lehrstellen getById error:', err);
  }

  throw ApiError.notFound('Listing not found');
}

export async function createListing(userId: string, data: CreateListingRequest): Promise<ListingDTO> {
  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!company) {
    throw ApiError.notFound('Company profile not found');
  }

  const listing = await prisma.listing.create({
    data: {
      companyId: company.id,
      title: data.title,
      description: data.description,
      field: data.field,
      berufsfeld: data.berufsfeld ?? '',
      requiredSchoolLevel: data.requiredSchoolLevel,
      requiredLanguages: data.requiredLanguages ?? ['de'],
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      durationYears: data.durationYears ?? 3,
      spotsAvailable: data.spotsAvailable ?? 1,
      canton: data.canton,
      city: data.city,
      idealOceanOpenness: data.idealOceanOpenness,
      idealOceanConscientiousness: data.idealOceanConscientiousness,
      idealOceanExtraversion: data.idealOceanExtraversion,
      idealOceanAgreeableness: data.idealOceanAgreeableness,
      idealOceanNeuroticism: data.idealOceanNeuroticism,
      idealRiasecRealistic: data.idealRiasecRealistic,
      idealRiasecInvestigative: data.idealRiasecInvestigative,
      idealRiasecArtistic: data.idealRiasecArtistic,
      idealRiasecSocial: data.idealRiasecSocial,
      idealRiasecEnterprising: data.idealRiasecEnterprising,
      idealRiasecConventional: data.idealRiasecConventional,
      cards: (data.cards ?? []) as any,
      motivationQuestions: (data.motivationQuestions ?? []) as any,
    },
    include: { company: true },
  });

  return mapToDTO(listing);
}

export async function updateListing(
  userId: string,
  listingId: string,
  data: Partial<CreateListingRequest>,
): Promise<ListingDTO> {
  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!company) {
    throw ApiError.notFound('Company profile not found');
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.companyId !== company.id) {
    throw ApiError.notFound('Listing not found');
  }

  const updated = await prisma.listing.update({
    where: { id: listingId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.field && { field: data.field }),
      ...(data.canton && { canton: data.canton }),
      ...(data.city && { city: data.city }),
      ...(data.durationYears && { durationYears: data.durationYears }),
      ...(data.spotsAvailable !== undefined && { spotsAvailable: data.spotsAvailable }),
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.cards !== undefined && { cards: data.cards as any }),
      ...(data.motivationQuestions !== undefined && { motivationQuestions: data.motivationQuestions as any }),
    },
    include: { company: true },
  });

  return mapToDTO(updated);
}

export async function deleteListing(userId: string, listingId: string): Promise<void> {
  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!company) {
    throw ApiError.notFound('Company profile not found');
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.companyId !== company.id) {
    throw ApiError.notFound('Listing not found');
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: { isActive: false },
  });
}

export async function getCompanyListings(userId: string): Promise<ListingDTO[]> {
  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!company) {
    throw ApiError.notFound('Company profile not found');
  }

  const listings = await prisma.listing.findMany({
    where: { companyId: company.id },
    include: { company: true },
    orderBy: { createdAt: 'desc' },
  });

  return listings.map(mapToDTO);
}

function mapToDTO(listing: any): ListingDTO {
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
    cards: Array.isArray(listing.cards) ? listing.cards : [],
    motivationQuestions: Array.isArray(listing.motivationQuestions) ? listing.motivationQuestions : [],
  };
}
