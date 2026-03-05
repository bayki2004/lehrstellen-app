-- Add Anforderungen & Lohn columns to berufe table
ALTER TABLE berufe ADD COLUMN IF NOT EXISTS anforderung_mathematik INTEGER;
ALTER TABLE berufe ADD COLUMN IF NOT EXISTS anforderung_schulsprache INTEGER;
ALTER TABLE berufe ADD COLUMN IF NOT EXISTS anforderung_naturwissenschaften INTEGER;
ALTER TABLE berufe ADD COLUMN IF NOT EXISTS anforderung_fremdsprachen INTEGER;
ALTER TABLE berufe ADD COLUMN IF NOT EXISTS lohn_lehrjahre JSONB;
