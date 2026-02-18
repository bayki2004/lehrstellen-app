-- ============================================================
-- EXTEND STUDENT PROFILES for V2 (Bewerbung = Profile)
-- ============================================================

-- New columns for enhanced student profile
ALTER TABLE students ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS motivation_video_url TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS video_thumbnail_url TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS video_duration_seconds INTEGER;
ALTER TABLE students ADD COLUMN IF NOT EXISTS motivation_letter TEXT CHECK (motivation_letter IS NULL OR char_length(motivation_letter) <= 2000);
ALTER TABLE students ADD COLUMN IF NOT EXISTS hobbies JSONB DEFAULT '[]';
ALTER TABLE students ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]';
ALTER TABLE students ADD COLUMN IF NOT EXISTS schools JSONB DEFAULT '[]';
ALTER TABLE students ADD COLUMN IF NOT EXISTS references_list JSONB DEFAULT '[]';
ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_completeness INTEGER NOT NULL DEFAULT 0 CHECK (profile_completeness >= 0 AND profile_completeness <= 100);

-- ============================================================
-- PROFILE COMPLETENESS CALCULATION
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_profile_completeness(student_row students)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    zeugnis_count INTEGER;
BEGIN
    -- Basic info (25%)
    IF student_row.first_name IS NOT NULL AND student_row.last_name IS NOT NULL THEN score := score + 5; END IF;
    IF student_row.date_of_birth IS NOT NULL THEN score := score + 5; END IF;
    IF student_row.phone IS NOT NULL AND char_length(student_row.phone) > 0 THEN score := score + 5; END IF;
    IF student_row.canton IS NOT NULL THEN score := score + 5; END IF;
    IF student_row.profile_photo_url IS NOT NULL AND char_length(student_row.profile_photo_url) > 0 THEN score := score + 5; END IF;

    -- Motivation video (20%)
    IF student_row.motivation_video_url IS NOT NULL AND char_length(student_row.motivation_video_url) > 0 THEN score := score + 20; END IF;

    -- Motivation letter (15%)
    IF student_row.motivation_letter IS NOT NULL AND char_length(student_row.motivation_letter) > 100 THEN score := score + 15; END IF;

    -- CV components (30%)
    IF student_row.schools IS NOT NULL AND jsonb_array_length(student_row.schools) > 0 THEN score := score + 10; END IF;
    IF student_row.schnupperlehre_experience IS NOT NULL AND jsonb_array_length(student_row.schnupperlehre_experience) > 0 THEN score := score + 5; END IF;
    IF student_row.languages IS NOT NULL AND jsonb_array_length(student_row.languages) > 0 THEN score := score + 5; END IF;
    IF student_row.skills IS NOT NULL AND jsonb_array_length(student_row.skills) > 0 THEN score := score + 5; END IF;
    IF student_row.hobbies IS NOT NULL AND jsonb_array_length(student_row.hobbies) > 0 THEN score := score + 5; END IF;

    -- Documents (10%)
    SELECT COUNT(*) INTO zeugnis_count FROM zeugnisse WHERE student_id = student_row.id;
    IF zeugnis_count > 0 THEN score := score + 10; END IF;

    RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- TRIGGER: Auto-update profile_completeness on student update
-- ============================================================
CREATE OR REPLACE FUNCTION update_profile_completeness()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profile_completeness := calculate_profile_completeness(NEW);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_profile_completeness
    BEFORE INSERT OR UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_completeness();
