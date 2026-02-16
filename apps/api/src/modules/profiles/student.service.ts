import { prisma } from '@lehrstellen/database';
import type { StudentProfileDTO, UpdateStudentProfileRequest } from '@lehrstellen/shared';
import { ApiError } from '../../utils/ApiError';

export async function getStudentProfile(userId: string): Promise<StudentProfileDTO> {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: { desiredFields: { orderBy: { priority: 'asc' } } },
  });

  if (!profile) {
    throw ApiError.notFound('Student profile not found');
  }

  return mapToDTO(profile);
}

export async function createStudentProfile(userId: string, data: UpdateStudentProfileRequest) {
  const existing = await prisma.studentProfile.findUnique({ where: { userId } });
  if (existing) {
    throw ApiError.conflict('Profile already exists');
  }

  const profile = await prisma.studentProfile.create({
    data: {
      userId,
      firstName: data.firstName!,
      lastName: data.lastName!,
      dateOfBirth: new Date(data.dateOfBirth!),
      canton: data.canton!,
      city: data.city!,
      bio: data.bio,
    },
    include: { desiredFields: true },
  });

  if (data.desiredFields?.length) {
    await prisma.studentDesiredField.createMany({
      data: data.desiredFields.map((field, i) => ({
        studentId: profile.id,
        field,
        priority: i,
      })),
    });
  }

  return mapToDTO(
    await prisma.studentProfile.findUnique({
      where: { id: profile.id },
      include: { desiredFields: { orderBy: { priority: 'asc' } } },
    })!,
  );
}

export async function updateStudentProfile(userId: string, data: UpdateStudentProfileRequest) {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw ApiError.notFound('Student profile not found');
  }

  await prisma.studentProfile.update({
    where: { userId },
    data: {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
      ...(data.canton && { canton: data.canton }),
      ...(data.city && { city: data.city }),
      ...(data.bio !== undefined && { bio: data.bio }),
    },
  });

  if (data.desiredFields) {
    await prisma.studentDesiredField.deleteMany({ where: { studentId: profile.id } });
    if (data.desiredFields.length > 0) {
      await prisma.studentDesiredField.createMany({
        data: data.desiredFields.map((field, i) => ({
          studentId: profile.id,
          field,
          priority: i,
        })),
      });
    }
  }

  return getStudentProfile(userId);
}

function mapToDTO(profile: any): StudentProfileDTO {
  return {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    dateOfBirth: profile.dateOfBirth.toISOString(),
    canton: profile.canton,
    city: profile.city,
    bio: profile.bio,
    profilePhoto: profile.profilePhoto,
    oceanScores: {
      openness: profile.oceanOpenness,
      conscientiousness: profile.oceanConscientiousness,
      extraversion: profile.oceanExtraversion,
      agreeableness: profile.oceanAgreeableness,
      neuroticism: profile.oceanNeuroticism,
    },
    riasecScores: {
      realistic: profile.riasecRealistic,
      investigative: profile.riasecInvestigative,
      artistic: profile.riasecArtistic,
      social: profile.riasecSocial,
      enterprising: profile.riasecEnterprising,
      conventional: profile.riasecConventional,
    },
    quizCompleted: !!profile.quizCompletedAt,
    desiredFields: (profile.desiredFields ?? []).map((d: any) => d.field),
  };
}
