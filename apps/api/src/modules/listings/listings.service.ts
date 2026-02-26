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

    // 2. Supabase lehrstellen (LENA-imported)
    let lehrstellenDTOs: ListingDTO[] = [];
    try {
      const conditions: string[] = ["l.status = 'active'"];
      const params: any[] = [];
      if (filters?.canton) {
        params.push(filters.canton);
        conditions.push(`l.canton = $${params.length}`);
      }
      if (filters?.field) {
        params.push(filters.field);
        conditions.push(`b.field = $${params.length}`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const rows = await prisma.$queryRawUnsafe<any[]>(`
        SELECT l.id, l.title, l.description, l.canton, l.city,
               l.duration_years, l.start_date, l.positions_available, l.created_at,
               l.requirements, l.culture_description,
               b.field,
               c.company_name, c.logo_url, c.canton AS company_canton, c.city AS company_city
        FROM lehrstellen l
        LEFT JOIN berufe b ON l.beruf_code = b.code
        LEFT JOIN companies c ON l.company_id = c.id
        ${whereClause}
        ORDER BY l.created_at DESC
      `, ...params);

      lehrstellenDTOs = (rows || []).map((r: any) => ({
        id: r.id,
        companyId: r.company_id ?? '',
        companyName: r.company_name ?? '',
        companyLogo: r.logo_url,
        companyCanton: r.company_canton ?? '',
        companyCity: r.company_city ?? '',
        title: r.title,
        description: r.description ?? '',
        field: r.field ?? '',
        canton: r.canton,
        city: r.city ?? '',
        durationYears: r.duration_years ?? 3,
        startDate: r.start_date?.toISOString?.() ?? r.start_date,
        spotsAvailable: r.positions_available ?? 1,
        requiredLanguages: ['de'],
        createdAt: r.created_at?.toISOString?.() ?? new Date().toISOString(),
        cards: generateDefaultCards(r),
      }));
    } catch (err) {
      console.error('[API DEBUG] lehrstellen query error:', err);
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

  // Fall back to lehrstellen table (LENA-imported)
  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(`
      SELECT l.id, l.title, l.description, l.canton, l.city,
             l.duration_years, l.start_date, l.positions_available, l.created_at,
             l.requirements, l.culture_description,
             b.field,
             c.company_name, c.logo_url, c.canton AS company_canton, c.city AS company_city
      FROM lehrstellen l
      LEFT JOIN berufe b ON l.beruf_code = b.code
      LEFT JOIN companies c ON l.company_id = c.id
      WHERE l.id = $1::uuid
      LIMIT 1
    `, id);
    if (rows.length > 0) {
      const r = rows[0];
      return {
        id: r.id,
        companyId: r.company_id ?? '',
        companyName: r.company_name ?? '',
        companyLogo: r.logo_url,
        companyCanton: r.company_canton ?? '',
        companyCity: r.company_city ?? '',
        title: r.title,
        description: r.description ?? '',
        field: r.field ?? '',
        canton: r.canton,
        city: r.city ?? '',
        durationYears: r.duration_years ?? 3,
        startDate: r.start_date?.toISOString?.() ?? r.start_date,
        spotsAvailable: r.positions_available ?? 1,
        requiredLanguages: ['de'],
        createdAt: r.created_at?.toISOString?.() ?? new Date().toISOString(),
        cards: generateDefaultCards(r),
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
      cards: data.cards ?? [],
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
      ...(data.cards !== undefined && { cards: data.cards }),
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
  };
}
