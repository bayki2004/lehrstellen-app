-- ============================================================
-- Migration 00015: Align Supabase schema with Prisma (Kaan)
-- Adds company_photos, company_links, and extends companies
-- and lehrstellen tables for Express API company features.
-- ============================================================

-- ============================================================
-- EXTEND COMPANIES TABLE
-- Add fields from Prisma CompanyProfile model
-- ============================================================
ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS company_size TEXT,
    ADD COLUMN IF NOT EXISTS contact_person_name TEXT,
    ADD COLUMN IF NOT EXISTS contact_person_role TEXT;

-- Migrate existing contact_person data to contact_person_name
UPDATE companies
SET contact_person_name = contact_person
WHERE contact_person IS NOT NULL
  AND contact_person_name IS NULL;

-- ============================================================
-- COMPANY PHOTOS: Gallery images for company profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS company_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_photos_company ON company_photos(company_id);

-- ============================================================
-- COMPANY LINKS: Social/web links for company profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS company_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_links_company ON company_links(company_id);

-- ============================================================
-- EXTEND LEHRSTELLEN: Ideal personality fields for matching
-- Companies can set their ideal OCEAN + RIASEC profile
-- ============================================================
ALTER TABLE lehrstellen
    ADD COLUMN IF NOT EXISTS ideal_ocean_openness FLOAT,
    ADD COLUMN IF NOT EXISTS ideal_ocean_conscientiousness FLOAT,
    ADD COLUMN IF NOT EXISTS ideal_ocean_extraversion FLOAT,
    ADD COLUMN IF NOT EXISTS ideal_ocean_agreeableness FLOAT,
    ADD COLUMN IF NOT EXISTS ideal_ocean_neuroticism FLOAT,
    ADD COLUMN IF NOT EXISTS ideal_riasec_realistic FLOAT,
    ADD COLUMN IF NOT EXISTS ideal_riasec_investigative FLOAT,
    ADD COLUMN IF NOT EXISTS ideal_riasec_artistic FLOAT,
    ADD COLUMN IF NOT EXISTS ideal_riasec_social FLOAT,
    ADD COLUMN IF NOT EXISTS ideal_riasec_enterprising FLOAT,
    ADD COLUMN IF NOT EXISTS ideal_riasec_conventional FLOAT;

-- ============================================================
-- APPLICATION STATUS ENUM (Prisma model)
-- Separate from the existing bewerbung_status for Express API
-- ============================================================
DO $$ BEGIN
    CREATE TYPE application_status AS ENUM (
        'PENDING',
        'VIEWED',
        'SHORTLISTED',
        'INTERVIEW_SCHEDULED',
        'ACCEPTED',
        'REJECTED',
        'WITHDRAWN'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- APPLICATIONS TABLE (Prisma model — used by Express API)
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES lehrstellen(id) ON DELETE CASCADE,
    match_id UUID UNIQUE,
    status application_status NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    timeline JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_listing ON applications(listing_id);

-- Auto-update updated_at
CREATE TRIGGER trg_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS POLICIES for new tables
-- ============================================================
ALTER TABLE company_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Company photos: companies manage their own photos
CREATE POLICY "company_photos_read_all" ON company_photos
    FOR SELECT USING (true);

CREATE POLICY "company_photos_manage_own" ON company_photos
    FOR ALL USING (
        company_id = get_current_company_id()
    );

-- Company links: companies manage their own links
CREATE POLICY "company_links_read_all" ON company_links
    FOR SELECT USING (true);

CREATE POLICY "company_links_manage_own" ON company_links
    FOR ALL USING (
        company_id = get_current_company_id()
    );

-- Applications: students see their own, companies see for their listings
CREATE POLICY "applications_read_own_student" ON applications
    FOR SELECT USING (student_id = get_current_student_id());

CREATE POLICY "applications_insert_own_student" ON applications
    FOR INSERT WITH CHECK (student_id = get_current_student_id());

CREATE POLICY "applications_read_company" ON applications
    FOR SELECT USING (
        EXISTS(
            SELECT 1 FROM lehrstellen l
            WHERE l.id = applications.listing_id
              AND l.company_id = get_current_company_id()
        )
    );

CREATE POLICY "applications_update_company" ON applications
    FOR UPDATE USING (
        EXISTS(
            SELECT 1 FROM lehrstellen l
            WHERE l.id = applications.listing_id
              AND l.company_id = get_current_company_id()
        )
    );
