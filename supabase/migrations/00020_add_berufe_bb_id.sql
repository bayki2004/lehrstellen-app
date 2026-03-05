-- Add berufsberatung.ch reference ID to berufe table
ALTER TABLE berufe ADD COLUMN IF NOT EXISTS bb_id TEXT;
