-- Migration: Extend schema for real data import from RBS, SDBB, and LENA
-- Adds fields needed by Python seed scripts in scripts/seed/

-- =============================================================================
-- 1. Extend berufsschulen with RBS (Register Berufsfachschulen) fields
-- =============================================================================
ALTER TABLE berufsschulen ADD COLUMN IF NOT EXISTS rbs_id TEXT UNIQUE;
ALTER TABLE berufsschulen ADD COLUMN IF NOT EXISTS bsx_id TEXT;
ALTER TABLE berufsschulen ADD COLUMN IF NOT EXISTS ech_id TEXT;
ALTER TABLE berufsschulen ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE berufsschulen ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE berufsschulen ADD COLUMN IF NOT EXISTS institutional_status TEXT;

-- =============================================================================
-- 2. Make companies.auth_user_id nullable for LENA-imported companies
-- =============================================================================
ALTER TABLE companies ALTER COLUMN auth_user_id DROP NOT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'manual';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS lena_company_key TEXT UNIQUE;

-- =============================================================================
-- 3. Add 'micro' to company_size enum (fixes seed 003_companies.sql)
-- =============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'micro'
                   AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'company_size')) THEN
        ALTER TYPE company_size ADD VALUE 'micro';
    END IF;
END$$;

-- =============================================================================
-- 4. Extend berufe table for SDBB profession data
-- =============================================================================
ALTER TABLE berufe ADD COLUMN IF NOT EXISTS duration_years INTEGER;
ALTER TABLE berufe ADD COLUMN IF NOT EXISTS swissdoc_id TEXT;
ALTER TABLE berufe ADD COLUMN IF NOT EXISTS lena_relevant BOOLEAN DEFAULT true;
ALTER TABLE berufe ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'manual';

-- =============================================================================
-- 5. Create berufsschule_beruf_mapping table
-- =============================================================================
CREATE TABLE IF NOT EXISTS berufsschule_beruf_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    berufsschule_id UUID NOT NULL REFERENCES berufsschulen(id) ON DELETE CASCADE,
    beruf_code TEXT NOT NULL REFERENCES berufe(code) ON DELETE CASCADE,
    canton TEXT NOT NULL CHECK (char_length(canton) = 2),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(berufsschule_id, beruf_code)
);

CREATE INDEX IF NOT EXISTS idx_bsb_mapping_schule ON berufsschule_beruf_mapping(berufsschule_id);
CREATE INDEX IF NOT EXISTS idx_bsb_mapping_beruf ON berufsschule_beruf_mapping(beruf_code);
CREATE INDEX IF NOT EXISTS idx_bsb_mapping_canton ON berufsschule_beruf_mapping(canton);

ALTER TABLE berufsschule_beruf_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bsb_mapping_public_read" ON berufsschule_beruf_mapping
    FOR SELECT USING (true);

-- =============================================================================
-- 6. Add unique index on lehrstellen.lena_reference_id for upsert support
-- =============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_lehrstellen_lena_ref
    ON lehrstellen(lena_reference_id) WHERE lena_reference_id IS NOT NULL;

ALTER TABLE lehrstellen ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'manual';
