-- Migration: Map feature — berufsschulen table + geo columns on lehrstellen & students

-- =============================================================================
-- 1. Create berufsschulen reference table
-- =============================================================================
CREATE TABLE IF NOT EXISTS berufsschulen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    canton TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    postal_code TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: public read access
ALTER TABLE berufsschulen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "berufsschulen_public_read"
    ON berufsschulen FOR SELECT
    USING (true);

-- =============================================================================
-- 2. Extend lehrstellen table with geo & berufsschule fields
-- =============================================================================
ALTER TABLE lehrstellen
    ADD COLUMN IF NOT EXISTS workplace_address TEXT,
    ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS berufsschule_id UUID REFERENCES berufsschulen(id),
    ADD COLUMN IF NOT EXISTS berufsschule_days TEXT,
    ADD COLUMN IF NOT EXISTS beruf_category TEXT;

-- Indexes for geo queries and filtering
CREATE INDEX IF NOT EXISTS idx_lehrstellen_lat_lng ON lehrstellen (lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lehrstellen_beruf_category ON lehrstellen (beruf_category) WHERE beruf_category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lehrstellen_berufsschule_id ON lehrstellen (berufsschule_id) WHERE berufsschule_id IS NOT NULL;

-- =============================================================================
-- 3. Extend students table with home address fields
-- =============================================================================
ALTER TABLE students
    ADD COLUMN IF NOT EXISTS home_address TEXT,
    ADD COLUMN IF NOT EXISTS home_lat DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS home_lng DOUBLE PRECISION;
