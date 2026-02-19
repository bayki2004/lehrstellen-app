-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "motivationLetter" TEXT,
ADD COLUMN     "motivationVideoUrl" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profileCompleteness" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "student_schools" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT,
    "startYear" INTEGER,
    "endYear" INTEGER,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "student_schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_skills" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "student_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_languages" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "proficiency" TEXT NOT NULL,

    CONSTRAINT "student_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schnupperlehre_entries" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "beruf" TEXT,
    "canton" TEXT,
    "date" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "schnupperlehre_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "berufe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "educationType" TEXT NOT NULL,
    "description" TEXT,
    "riasecR" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riasecI" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riasecA" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riasecS" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riasecE" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riasecC" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "berufe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_schools_studentId_idx" ON "student_schools"("studentId");

-- CreateIndex
CREATE INDEX "student_skills_studentId_idx" ON "student_skills"("studentId");

-- CreateIndex
CREATE INDEX "student_languages_studentId_idx" ON "student_languages"("studentId");

-- CreateIndex
CREATE INDEX "schnupperlehre_entries_studentId_idx" ON "schnupperlehre_entries"("studentId");

-- AddForeignKey
ALTER TABLE "student_schools" ADD CONSTRAINT "student_schools_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_skills" ADD CONSTRAINT "student_skills_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_languages" ADD CONSTRAINT "student_languages_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schnupperlehre_entries" ADD CONSTRAINT "schnupperlehre_entries_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
