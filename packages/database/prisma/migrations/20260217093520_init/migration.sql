-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'COMPANY', 'ADMIN');

-- CreateEnum
CREATE TYPE "SwipeDirection" AS ENUM ('LEFT', 'RIGHT', 'SUPER');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'VIEWED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'SYSTEM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "canton" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "bio" TEXT,
    "profilePhoto" TEXT,
    "oceanOpenness" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "oceanConscientiousness" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "oceanExtraversion" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "oceanAgreeableness" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "oceanNeuroticism" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "riasecRealistic" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riasecInvestigative" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riasecArtistic" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riasecSocial" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riasecEnterprising" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riasecConventional" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quizCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_desired_fields" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "student_desired_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "companySize" TEXT NOT NULL,
    "website" TEXT,
    "logoUrl" TEXT,
    "canton" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "contactPersonName" TEXT NOT NULL,
    "contactPersonRole" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "berufsfeld" TEXT NOT NULL DEFAULT '',
    "requiredSchoolLevel" TEXT,
    "requiredLanguages" TEXT[] DEFAULT ARRAY['de']::TEXT[],
    "startDate" TIMESTAMP(3),
    "durationYears" INTEGER NOT NULL DEFAULT 3,
    "spotsAvailable" INTEGER NOT NULL DEFAULT 1,
    "idealOceanOpenness" DOUBLE PRECISION,
    "idealOceanConscientiousness" DOUBLE PRECISION,
    "idealOceanExtraversion" DOUBLE PRECISION,
    "idealOceanAgreeableness" DOUBLE PRECISION,
    "idealOceanNeuroticism" DOUBLE PRECISION,
    "idealRiasecRealistic" DOUBLE PRECISION,
    "idealRiasecInvestigative" DOUBLE PRECISION,
    "idealRiasecArtistic" DOUBLE PRECISION,
    "idealRiasecSocial" DOUBLE PRECISION,
    "idealRiasecEnterprising" DOUBLE PRECISION,
    "idealRiasecConventional" DOUBLE PRECISION,
    "canton" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "swipes" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "direction" "SwipeDirection" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "swipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "compatibilityScore" DOUBLE PRECISION NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "timeline" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_userId_key" ON "student_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "student_desired_fields_studentId_field_key" ON "student_desired_fields"("studentId", "field");

-- CreateIndex
CREATE UNIQUE INDEX "company_profiles_userId_key" ON "company_profiles"("userId");

-- CreateIndex
CREATE INDEX "listings_companyId_idx" ON "listings"("companyId");

-- CreateIndex
CREATE INDEX "listings_field_idx" ON "listings"("field");

-- CreateIndex
CREATE INDEX "listings_canton_idx" ON "listings"("canton");

-- CreateIndex
CREATE INDEX "listings_isActive_idx" ON "listings"("isActive");

-- CreateIndex
CREATE INDEX "swipes_studentId_idx" ON "swipes"("studentId");

-- CreateIndex
CREATE INDEX "swipes_listingId_idx" ON "swipes"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "swipes_studentId_listingId_key" ON "swipes"("studentId", "listingId");

-- CreateIndex
CREATE INDEX "matches_studentId_idx" ON "matches"("studentId");

-- CreateIndex
CREATE INDEX "matches_listingId_idx" ON "matches"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "matches_studentId_listingId_key" ON "matches"("studentId", "listingId");

-- CreateIndex
CREATE INDEX "messages_matchId_idx" ON "messages"("matchId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX "applications_matchId_key" ON "applications"("matchId");

-- CreateIndex
CREATE INDEX "applications_studentId_idx" ON "applications"("studentId");

-- CreateIndex
CREATE INDEX "applications_listingId_idx" ON "applications"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "applications_studentId_listingId_key" ON "applications"("studentId", "listingId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_desired_fields" ADD CONSTRAINT "student_desired_fields_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
