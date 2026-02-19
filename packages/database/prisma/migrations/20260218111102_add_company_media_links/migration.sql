-- AlterTable
ALTER TABLE "company_profiles" ADD COLUMN     "videoUrl" TEXT;

-- CreateTable
CREATE TABLE "company_photos" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_links" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_photos_companyId_idx" ON "company_photos"("companyId");

-- CreateIndex
CREATE INDEX "company_links_companyId_idx" ON "company_links"("companyId");

-- AddForeignKey
ALTER TABLE "company_photos" ADD CONSTRAINT "company_photos_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_links" ADD CONSTRAINT "company_links_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
