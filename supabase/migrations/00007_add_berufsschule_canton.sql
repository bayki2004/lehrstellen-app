-- ============================================================
-- Add Berufsschule canton to lehrstellen
-- Apprentices attend vocational school 1-2 days/week;
-- proximity to the Berufsschule matters for matching.
-- ============================================================

ALTER TABLE lehrstellen ADD COLUMN berufsschule_canton TEXT CHECK (
    berufsschule_canton IS NULL OR char_length(berufsschule_canton) = 2
);

COMMENT ON COLUMN lehrstellen.berufsschule_canton
    IS 'Canton where Berufsschule (vocational school) takes place, 1-2 days/week';
