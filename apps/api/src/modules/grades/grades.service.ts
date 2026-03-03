import { prisma } from '@lehrstellen/database';
import type { StudentGradeDTO, SaveGradeRequest } from '@lehrstellen/shared';
import { ApiError } from '../../utils/ApiError';

export async function getStudentGrades(userId: string): Promise<StudentGradeDTO[]> {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw ApiError.notFound('Student profile not found');
  }

  const grades = await prisma.studentGrade.findMany({
    where: { studentId: profile.id },
    orderBy: { createdAt: 'desc' },
  });

  return grades.map(mapToDTO);
}

export async function saveGrade(userId: string, data: SaveGradeRequest): Promise<StudentGradeDTO> {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw ApiError.notFound('Student profile not found');
  }

  validateGrades(data);

  // Check for existing record to upsert
  const existing = await findExisting(profile.id, data);

  if (existing) {
    const updated = await prisma.studentGrade.update({
      where: { id: existing.id },
      data: {
        ...buildData(data),
        isVerified: true,
        verifiedAt: new Date(),
      },
    });
    return mapToDTO(updated);
  }

  const created = await prisma.studentGrade.create({
    data: {
      studentId: profile.id,
      ...buildData(data),
      isVerified: true,
      verifiedAt: new Date(),
    },
  });

  return mapToDTO(created);
}

export async function deleteGrade(userId: string, gradeId: string): Promise<void> {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw ApiError.notFound('Student profile not found');
  }

  const grade = await prisma.studentGrade.findUnique({ where: { id: gradeId } });
  if (!grade) {
    throw ApiError.notFound('Grade not found');
  }
  if (grade.studentId !== profile.id) {
    throw ApiError.forbidden('Not authorized to delete this grade');
  }

  await prisma.studentGrade.delete({ where: { id: gradeId } });
}

// --- Helpers ---

function findExisting(studentId: string, data: SaveGradeRequest) {
  if (data.documentType === 'zeugnis') {
    return prisma.studentGrade.findFirst({
      where: {
        studentId,
        documentType: 'zeugnis',
        schoolYear: data.schoolYear,
        semester: data.semester,
      },
    });
  }
  // Multicheck, Basic-Check, Stellwerk: one per variant
  return prisma.studentGrade.findFirst({
    where: {
      studentId,
      documentType: data.documentType,
      testVariant: data.testVariant,
    },
  });
}

function buildData(data: SaveGradeRequest) {
  return {
    documentType: data.documentType,
    entryMethod: data.entryMethod,
    canton: data.canton ?? null,
    niveau: data.niveau ?? null,
    semester: data.semester ?? null,
    schoolYear: data.schoolYear ?? null,
    testVariant: data.testVariant ?? null,
    testDate: data.testDate ? new Date(data.testDate) : null,
    grades: data.grades as any,
  };
}

function validateGrades(data: SaveGradeRequest) {
  if (data.documentType === 'zeugnis') {
    const grades = data.grades as Record<string, number | undefined>;
    for (const [subject, value] of Object.entries(grades)) {
      if (value != null && (value < 1 || value > 6)) {
        throw ApiError.badRequest(`Ungültige Note für ${subject}: ${value} (muss zwischen 1 und 6 sein)`);
      }
    }
    if (!data.schoolYear) {
      throw ApiError.badRequest('Schuljahr ist erforderlich');
    }
    if (!data.semester) {
      throw ApiError.badRequest('Semester ist erforderlich');
    }
  } else if (data.documentType === 'multicheck' || data.documentType === 'basic_check') {
    const grades = data.grades as any;
    for (const section of ['schulisches_wissen', 'potenzial']) {
      if (grades[section]) {
        for (const [field, value] of Object.entries(grades[section])) {
          if (value != null && (typeof value !== 'number' || value < 0 || value > 100)) {
            throw ApiError.badRequest(`Ungültiger Wert für ${field}: ${value} (muss zwischen 0 und 100 sein)`);
          }
        }
      }
    }
    if (!data.testVariant) {
      throw ApiError.badRequest('Test-Variante ist erforderlich');
    }
  }
}

function mapToDTO(grade: any): StudentGradeDTO {
  return {
    id: grade.id,
    documentType: grade.documentType,
    entryMethod: grade.entryMethod,
    canton: grade.canton ?? undefined,
    niveau: grade.niveau ?? undefined,
    semester: grade.semester ?? undefined,
    schoolYear: grade.schoolYear ?? undefined,
    testVariant: grade.testVariant ?? undefined,
    testDate: grade.testDate?.toISOString() ?? undefined,
    grades: grade.grades,
    isVerified: grade.isVerified,
    verifiedAt: grade.verifiedAt?.toISOString() ?? undefined,
    createdAt: grade.createdAt.toISOString(),
  };
}
