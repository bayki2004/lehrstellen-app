import { prisma } from '@lehrstellen/database';
import type { CompanyProfileDTO, UpdateCompanyProfileRequest } from '@lehrstellen/shared';
import { ApiError } from '../../utils/ApiError';

export async function getCompanyProfile(userId: string): Promise<CompanyProfileDTO> {
  const profile = await prisma.companyProfile.findUnique({
    where: { userId },
    include: { _count: { select: { listings: true } } },
  });

  if (!profile) {
    throw ApiError.notFound('Company profile not found');
  }

  return mapToDTO(profile);
}

export async function getCompanyById(companyId: string): Promise<CompanyProfileDTO> {
  const profile = await prisma.companyProfile.findUnique({
    where: { id: companyId },
    include: { _count: { select: { listings: true } } },
  });

  if (!profile) {
    throw ApiError.notFound('Company not found');
  }

  return mapToDTO(profile);
}

export async function createCompanyProfile(userId: string, data: UpdateCompanyProfileRequest) {
  const existing = await prisma.companyProfile.findUnique({ where: { userId } });
  if (existing) {
    throw ApiError.conflict('Company profile already exists');
  }

  const profile = await prisma.companyProfile.create({
    data: {
      userId,
      companyName: data.companyName!,
      description: data.description!,
      industry: data.industry!,
      companySize: data.companySize!,
      website: data.website,
      canton: data.canton!,
      city: data.city!,
      address: data.address,
      contactPersonName: data.contactPersonName!,
      contactPersonRole: data.contactPersonRole,
    },
    include: { _count: { select: { listings: true } } },
  });

  return mapToDTO(profile);
}

export async function updateCompanyProfile(userId: string, data: UpdateCompanyProfileRequest) {
  const profile = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw ApiError.notFound('Company profile not found');
  }

  const updated = await prisma.companyProfile.update({
    where: { userId },
    data: {
      ...(data.companyName && { companyName: data.companyName }),
      ...(data.description && { description: data.description }),
      ...(data.industry && { industry: data.industry }),
      ...(data.companySize && { companySize: data.companySize }),
      ...(data.website !== undefined && { website: data.website }),
      ...(data.canton && { canton: data.canton }),
      ...(data.city && { city: data.city }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.contactPersonName && { contactPersonName: data.contactPersonName }),
      ...(data.contactPersonRole !== undefined && { contactPersonRole: data.contactPersonRole }),
    },
    include: { _count: { select: { listings: true } } },
  });

  return mapToDTO(updated);
}

function mapToDTO(profile: any): CompanyProfileDTO {
  return {
    id: profile.id,
    companyName: profile.companyName,
    description: profile.description,
    industry: profile.industry,
    companySize: profile.companySize,
    website: profile.website,
    logoUrl: profile.logoUrl,
    canton: profile.canton,
    city: profile.city,
    address: profile.address,
    contactPersonName: profile.contactPersonName,
    contactPersonRole: profile.contactPersonRole,
    isVerified: profile.isVerified,
    listingsCount: profile._count?.listings ?? 0,
  };
}
