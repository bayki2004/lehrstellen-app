-- Add culture dimension columns to companies table
-- Values range 0-100 (0=left extreme, 100=right extreme)

ALTER TABLE companies ADD COLUMN IF NOT EXISTS culture_hierarchy_focus INTEGER
  CHECK (culture_hierarchy_focus IS NULL OR (culture_hierarchy_focus >= 0 AND culture_hierarchy_focus <= 100));

ALTER TABLE companies ADD COLUMN IF NOT EXISTS culture_punctuality_rigidity INTEGER
  CHECK (culture_punctuality_rigidity IS NULL OR (culture_punctuality_rigidity >= 0 AND culture_punctuality_rigidity <= 100));

ALTER TABLE companies ADD COLUMN IF NOT EXISTS culture_resilience_grit INTEGER
  CHECK (culture_resilience_grit IS NULL OR (culture_resilience_grit >= 0 AND culture_resilience_grit <= 100));

ALTER TABLE companies ADD COLUMN IF NOT EXISTS culture_social_environment INTEGER
  CHECK (culture_social_environment IS NULL OR (culture_social_environment >= 0 AND culture_social_environment <= 100));

ALTER TABLE companies ADD COLUMN IF NOT EXISTS culture_error_culture INTEGER
  CHECK (culture_error_culture IS NULL OR (culture_error_culture >= 0 AND culture_error_culture <= 100));

ALTER TABLE companies ADD COLUMN IF NOT EXISTS culture_client_facing INTEGER
  CHECK (culture_client_facing IS NULL OR (culture_client_facing >= 0 AND culture_client_facing <= 100));

ALTER TABLE companies ADD COLUMN IF NOT EXISTS culture_digital_affinity INTEGER
  CHECK (culture_digital_affinity IS NULL OR (culture_digital_affinity >= 0 AND culture_digital_affinity <= 100));

ALTER TABLE companies ADD COLUMN IF NOT EXISTS culture_pride_focus INTEGER
  CHECK (culture_pride_focus IS NULL OR (culture_pride_focus >= 0 AND culture_pride_focus <= 100));
