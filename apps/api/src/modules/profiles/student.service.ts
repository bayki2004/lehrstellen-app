import { prisma } from '@lehrstellen/database';
import type {
  StudentProfileDTO,
  StudentProfileExtendedDTO,
  UpdateStudentProfileRequest,
  UpdateStudentExtendedRequest,
  PassendeBerufDTO,
} from '@lehrstellen/shared';
import { ApiError } from '../../utils/ApiError';

// ============================================
// BASIC PROFILE
// ============================================

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

  const parsedDate = new Date(data.dateOfBirth!);
  if (isNaN(parsedDate.getTime())) {
    throw ApiError.badRequest('Invalid date format. Use YYYY-MM-DD (e.g. 2008-05-15)');
  }

  const profile = await prisma.studentProfile.create({
    data: {
      userId,
      firstName: data.firstName!,
      lastName: data.lastName!,
      dateOfBirth: parsedDate,
      canton: data.canton!,
      city: data.city!,
      bio: data.bio,
      phone: data.phone,
      nationality: data.nationality,
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
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.nationality !== undefined && { nationality: data.nationality }),
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

// ============================================
// EXTENDED PROFILE
// ============================================

export async function getStudentProfileExtended(userId: string): Promise<StudentProfileExtendedDTO> {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      desiredFields: { orderBy: { priority: 'asc' } },
      schools: true,
      skills: true,
      languages: true,
      schnupperlehren: { orderBy: { date: 'desc' } },
    },
  });

  if (!profile) {
    throw ApiError.notFound('Student profile not found');
  }

  return mapToExtendedDTO(profile);
}

export async function updateStudentProfileExtended(userId: string, data: UpdateStudentExtendedRequest) {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw ApiError.notFound('Student profile not found');
  }

  await prisma.studentProfile.update({
    where: { userId },
    data: {
      ...(data.profilePhoto !== undefined && { profilePhoto: data.profilePhoto }),
      ...(data.motivationVideoUrl !== undefined && { motivationVideoUrl: data.motivationVideoUrl }),
      ...(data.motivationLetter !== undefined && { motivationLetter: data.motivationLetter }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.nationality !== undefined && { nationality: data.nationality }),
    },
  });

  await recalculateCompleteness(profile.id);
  return getStudentProfileExtended(userId);
}

// ============================================
// SCHOOLS
// ============================================

export async function addSchool(userId: string, data: { name: string; level?: string; startYear?: number; endYear?: number; isCurrent?: boolean }) {
  const profile = await getProfileOrThrow(userId);

  return prisma.studentSchool.create({
    data: {
      studentId: profile.id,
      name: data.name,
      level: data.level,
      startYear: data.startYear,
      endYear: data.endYear,
      isCurrent: data.isCurrent ?? false,
    },
  });
}

export async function removeSchool(userId: string, schoolId: string) {
  const profile = await getProfileOrThrow(userId);
  const school = await prisma.studentSchool.findFirst({ where: { id: schoolId, studentId: profile.id } });
  if (!school) throw ApiError.notFound('School not found');
  await prisma.studentSchool.delete({ where: { id: schoolId } });
}

// ============================================
// SKILLS
// ============================================

export async function addSkill(userId: string, name: string) {
  const profile = await getProfileOrThrow(userId);
  return prisma.studentSkill.create({ data: { studentId: profile.id, name } });
}

export async function removeSkill(userId: string, skillId: string) {
  const profile = await getProfileOrThrow(userId);
  const skill = await prisma.studentSkill.findFirst({ where: { id: skillId, studentId: profile.id } });
  if (!skill) throw ApiError.notFound('Skill not found');
  await prisma.studentSkill.delete({ where: { id: skillId } });
}

// ============================================
// LANGUAGES
// ============================================

export async function addLanguage(userId: string, data: { language: string; proficiency: string }) {
  const profile = await getProfileOrThrow(userId);
  return prisma.studentLanguage.create({
    data: { studentId: profile.id, language: data.language, proficiency: data.proficiency },
  });
}

export async function removeLanguage(userId: string, languageId: string) {
  const profile = await getProfileOrThrow(userId);
  const lang = await prisma.studentLanguage.findFirst({ where: { id: languageId, studentId: profile.id } });
  if (!lang) throw ApiError.notFound('Language not found');
  await prisma.studentLanguage.delete({ where: { id: languageId } });
}

// ============================================
// SCHNUPPERLEHREN
// ============================================

export async function addSchnupperlehre(
  userId: string,
  data: { companyName: string; beruf?: string; canton?: string; date?: string; notes?: string },
) {
  const profile = await getProfileOrThrow(userId);
  return prisma.schnupperlehreEntry.create({
    data: {
      studentId: profile.id,
      companyName: data.companyName,
      beruf: data.beruf,
      canton: data.canton,
      date: data.date ? new Date(data.date) : undefined,
      notes: data.notes,
    },
  });
}

export async function removeSchnupperlehre(userId: string, entryId: string) {
  const profile = await getProfileOrThrow(userId);
  const entry = await prisma.schnupperlehreEntry.findFirst({ where: { id: entryId, studentId: profile.id } });
  if (!entry) throw ApiError.notFound('Schnupperlehre entry not found');
  await prisma.schnupperlehreEntry.delete({ where: { id: entryId } });
}

// ============================================
// PASSENDE BERUFE (RIASEC matching)
// ============================================

export async function getPassendeBerufe(userId: string): Promise<PassendeBerufDTO[]> {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Student profile not found');

  const berufe = await prisma.beruf.findMany();

  const studentVec = [
    profile.riasecRealistic,
    profile.riasecInvestigative,
    profile.riasecArtistic,
    profile.riasecSocial,
    profile.riasecEnterprising,
    profile.riasecConventional,
  ];

  const scored = berufe.map((b) => {
    const berufVec = [b.riasecR, b.riasecI, b.riasecA, b.riasecS, b.riasecE, b.riasecC];
    const score = cosineSimilarity(studentVec, berufVec);
    return {
      id: b.id,
      name: b.name,
      field: b.field,
      educationType: b.educationType,
      description: b.description ?? undefined,
      riasecR: b.riasecR,
      riasecI: b.riasecI,
      riasecA: b.riasecA,
      riasecS: b.riasecS,
      riasecE: b.riasecE,
      riasecC: b.riasecC,
      matchScore: score,
      matchPercent: Math.round(score * 100),
    };
  });

  return scored.sort((a, b) => b.matchScore - a.matchScore);
}

// ============================================
// HELPERS
// ============================================

async function getProfileOrThrow(userId: string) {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Student profile not found');
  return profile;
}

async function recalculateCompleteness(studentId: string): Promise<number> {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { schools: true, skills: true, languages: true, schnupperlehren: true, desiredFields: true },
  });
  if (!profile) return 0;

  let score = 0;
  if (profile.firstName && profile.lastName) score += 15;
  if (profile.bio) score += 10;
  if (profile.profilePhoto) score += 10;
  if (profile.motivationLetter) score += 15;
  if (profile.quizCompletedAt) score += 20;
  if (profile.schools.length > 0) score += 10;
  if (profile.skills.length > 0) score += 10;
  if (profile.languages.length > 0) score += 5;
  if (profile.schnupperlehren.length > 0) score += 5;

  await prisma.studentProfile.update({ where: { id: studentId }, data: { profileCompleteness: score } });
  return score;
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
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

function mapToExtendedDTO(profile: any): StudentProfileExtendedDTO {
  return {
    ...mapToDTO(profile),
    phone: profile.phone ?? undefined,
    nationality: profile.nationality ?? undefined,
    motivationVideoUrl: profile.motivationVideoUrl ?? undefined,
    motivationLetter: profile.motivationLetter ?? undefined,
    profileCompleteness: profile.profileCompleteness,
    schools: (profile.schools ?? []).map((s: any) => ({
      id: s.id,
      name: s.name,
      level: s.level ?? undefined,
      startYear: s.startYear ?? undefined,
      endYear: s.endYear ?? undefined,
      isCurrent: s.isCurrent,
    })),
    skills: (profile.skills ?? []).map((s: any) => ({ id: s.id, name: s.name })),
    languages: (profile.languages ?? []).map((l: any) => ({
      id: l.id,
      language: l.language,
      proficiency: l.proficiency,
    })),
    schnupperlehren: (profile.schnupperlehren ?? []).map((e: any) => ({
      id: e.id,
      companyName: e.companyName,
      beruf: e.beruf ?? undefined,
      canton: e.canton ?? undefined,
      date: e.date ? e.date.toISOString() : undefined,
      notes: e.notes ?? undefined,
    })),
  };
}
