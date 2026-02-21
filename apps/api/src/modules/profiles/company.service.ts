import { prisma } from '@lehrstellen/database';
import type { CompanyProfileDTO, UpdateCompanyProfileRequest } from '@lehrstellen/shared';
import { ApiError } from '../../utils/ApiError';
import fs from 'fs';
import path from 'path';

const profileInclude = {
  _count: { select: { listings: true } },
  photos: { orderBy: { sortOrder: 'asc' as const } },
  links: { orderBy: { sortOrder: 'asc' as const } },
};

const profileWithListingsInclude = {
  ...profileInclude,
  listings: { where: { isActive: true }, take: 20 },
};

export async function getCompanyProfile(userId: string): Promise<CompanyProfileDTO> {
  const profile = await prisma.companyProfile.findUnique({
    where: { userId },
    include: profileWithListingsInclude,
  });

  if (!profile) {
    throw ApiError.notFound('Company profile not found');
  }

  return mapToDTO(profile);
}

export async function getCompanyById(companyId: string): Promise<CompanyProfileDTO> {
  const profile = await prisma.companyProfile.findUnique({
    where: { id: companyId },
    include: profileWithListingsInclude,
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
      videoUrl: data.videoUrl,
      canton: data.canton!,
      city: data.city!,
      address: data.address,
      contactPersonName: data.contactPersonName!,
      contactPersonRole: data.contactPersonRole,
      ...(data.links?.length && {
        links: {
          create: data.links.map((link, i) => ({
            label: link.label,
            url: link.url,
            sortOrder: i,
          })),
        },
      }),
    },
    include: profileInclude,
  });

  return mapToDTO(profile);
}

export async function updateCompanyProfile(userId: string, data: UpdateCompanyProfileRequest) {
  const profile = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw ApiError.notFound('Company profile not found');
  }

  // Handle links: delete existing and recreate
  if (data.links !== undefined) {
    await prisma.companyLink.deleteMany({ where: { companyId: profile.id } });
    if (data.links.length > 0) {
      await prisma.companyLink.createMany({
        data: data.links.map((link, i) => ({
          companyId: profile.id,
          label: link.label,
          url: link.url,
          sortOrder: i,
        })),
      });
    }
  }

  const updated = await prisma.companyProfile.update({
    where: { userId },
    data: {
      ...(data.companyName && { companyName: data.companyName }),
      ...(data.description && { description: data.description }),
      ...(data.industry && { industry: data.industry }),
      ...(data.companySize && { companySize: data.companySize }),
      ...(data.website !== undefined && { website: data.website }),
      ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
      ...(data.canton && { canton: data.canton }),
      ...(data.city && { city: data.city }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.contactPersonName && { contactPersonName: data.contactPersonName }),
      ...(data.contactPersonRole !== undefined && { contactPersonRole: data.contactPersonRole }),
    },
    include: profileWithListingsInclude,
  });

  return mapToDTO(updated);
}

export async function addPhotos(companyId: string, files: { url: string; caption?: string }[]) {
  const maxSort = await prisma.companyPhoto.findFirst({
    where: { companyId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  });
  const startOrder = (maxSort?.sortOrder ?? -1) + 1;

  const photos = await prisma.companyPhoto.createManyAndReturn({
    data: files.map((f, i) => ({
      companyId,
      url: f.url,
      caption: f.caption,
      sortOrder: startOrder + i,
    })),
  });

  return photos;
}

export async function deletePhoto(companyId: string, photoId: string) {
  const photo = await prisma.companyPhoto.findFirst({
    where: { id: photoId, companyId },
  });

  if (!photo) {
    throw ApiError.notFound('Photo not found');
  }

  await prisma.companyPhoto.delete({ where: { id: photoId } });

  // Delete file from disk if it's a local path
  if (photo.url.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, '../../../', photo.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  return photo;
}

export async function setVideoUrl(userId: string, videoUrl: string | null) {
  const profile = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw ApiError.notFound('Company profile not found');
  }

  // Delete old video file if replacing with a new one
  if (profile.videoUrl?.startsWith('/uploads/') && profile.videoUrl !== videoUrl) {
    const filePath = path.join(__dirname, '../../../', profile.videoUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  await prisma.companyProfile.update({
    where: { userId },
    data: { videoUrl },
  });
}

export async function getCompanyIdByUserId(userId: string): Promise<string> {
  const profile = await prisma.companyProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) {
    throw ApiError.notFound('Company profile not found');
  }
  return profile.id;
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
    videoUrl: profile.videoUrl,
    canton: profile.canton,
    city: profile.city,
    address: profile.address,
    contactPersonName: profile.contactPersonName,
    contactPersonRole: profile.contactPersonRole,
    isVerified: profile.isVerified,
    listingsCount: profile._count?.listings ?? 0,
    photos: (profile.photos ?? []).map((p: any) => ({
      id: p.id,
      url: p.url,
      caption: p.caption,
      sortOrder: p.sortOrder,
    })),
    links: (profile.links ?? []).map((l: any) => ({
      id: l.id,
      label: l.label,
      url: l.url,
      sortOrder: l.sortOrder,
    })),
    listings: profile.listings?.map((l: any) => ({
      id: l.id,
      companyId: l.companyId,
      companyName: profile.companyName,
      companyLogo: profile.logoUrl,
      companyCanton: profile.canton,
      companyCity: profile.city,
      title: l.title,
      description: l.description,
      field: l.field,
      canton: l.canton,
      city: l.city,
      durationYears: l.durationYears,
      startDate: l.startDate?.toISOString(),
      spotsAvailable: l.spotsAvailable,
      requiredSchoolLevel: l.requiredSchoolLevel,
      requiredLanguages: l.requiredLanguages,
      createdAt: l.createdAt.toISOString(),
    })),
  };
}
