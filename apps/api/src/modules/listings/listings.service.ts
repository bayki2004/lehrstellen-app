import { prisma } from '@lehrstellen/database';
import type { ListingDTO, CreateListingRequest } from '@lehrstellen/shared';
import { ApiError } from '../../utils/ApiError';

export async function getListings(filters?: {
  field?: string;
  canton?: string;
  companyId?: string;
}): Promise<ListingDTO[]> {
  const listings = await prisma.listing.findMany({
    where: {
      isActive: true,
      ...(filters?.field && { field: filters.field }),
      ...(filters?.canton && { canton: filters.canton }),
      ...(filters?.companyId && { companyId: filters.companyId }),
    },
    include: { company: true },
    orderBy: { createdAt: 'desc' },
  });

  return listings.map(mapToDTO);
}

export async function getListingById(id: string): Promise<ListingDTO> {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }

  return mapToDTO(listing);
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
  };
}
