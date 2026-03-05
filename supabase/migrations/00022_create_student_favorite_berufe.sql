-- Create student_favorite_berufe table (was missing from migrations)
CREATE TABLE IF NOT EXISTS student_favorite_berufe (
    student_profile_id TEXT NOT NULL,
    beruf_code TEXT NOT NULL REFERENCES berufe(code) ON DELETE CASCADE,
    PRIMARY KEY (student_profile_id, beruf_code)
);

CREATE INDEX IF NOT EXISTS idx_sfb_student ON student_favorite_berufe(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_sfb_beruf ON student_favorite_berufe(beruf_code);
