-- ============================================================
-- MATCH RESOLUTION: Auto-create match when both parties swipe right
-- ============================================================

-- Trigger: When a student swipes right, check if the company already swiped right
CREATE OR REPLACE FUNCTION check_match_on_student_swipe()
RETURNS TRIGGER AS $$
DECLARE
    v_company_id UUID;
    v_compatibility DOUBLE PRECISION;
BEGIN
    -- Only check for right swipes and super likes
    IF NEW.direction NOT IN ('right', 'super_like') THEN
        RETURN NEW;
    END IF;

    -- Find the company for this lehrstelle
    SELECT company_id INTO v_company_id
    FROM lehrstellen WHERE id = NEW.lehrstelle_id;

    -- Check if company already swiped right on this student for this lehrstelle
    IF EXISTS(
        SELECT 1 FROM company_swipes cs
        WHERE cs.company_id = v_company_id
          AND cs.student_id = NEW.student_id
          AND cs.lehrstelle_id = NEW.lehrstelle_id
          AND cs.direction IN ('right', 'super_like')
    ) THEN
        -- Create a match
        INSERT INTO matches (student_id, company_id, lehrstelle_id, student_swipe_id, compatibility_score)
        VALUES (NEW.student_id, v_company_id, NEW.lehrstelle_id, NEW.id, v_compatibility)
        ON CONFLICT (student_id, company_id, lehrstelle_id) DO NOTHING;
    END IF;

    -- Update swipe counters
    UPDATE lehrstellen
    SET total_swipes_right = total_swipes_right + CASE WHEN NEW.direction IN ('right', 'super_like') THEN 1 ELSE 0 END,
        total_swipes_left = total_swipes_left + CASE WHEN NEW.direction = 'left' THEN 1 ELSE 0 END
    WHERE id = NEW.lehrstelle_id;

    -- Update daily swipe count
    INSERT INTO daily_swipe_counts (student_id, swipe_date, right_swipes, super_likes)
    VALUES (
        NEW.student_id,
        CURRENT_DATE,
        CASE WHEN NEW.direction = 'right' THEN 1 ELSE 0 END,
        CASE WHEN NEW.direction = 'super_like' THEN 1 ELSE 0 END
    )
    ON CONFLICT (student_id, swipe_date)
    DO UPDATE SET
        right_swipes = daily_swipe_counts.right_swipes + CASE WHEN NEW.direction = 'right' THEN 1 ELSE 0 END,
        super_likes = daily_swipe_counts.super_likes + CASE WHEN NEW.direction = 'super_like' THEN 1 ELSE 0 END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_check_match_on_student_swipe
    AFTER INSERT ON swipes
    FOR EACH ROW
    EXECUTE FUNCTION check_match_on_student_swipe();

-- Trigger: When a company swipes right, check if the student already swiped right
CREATE OR REPLACE FUNCTION check_match_on_company_swipe()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.direction NOT IN ('right', 'super_like') THEN
        RETURN NEW;
    END IF;

    -- Check if student already swiped right on this lehrstelle
    IF EXISTS(
        SELECT 1 FROM swipes s
        WHERE s.student_id = NEW.student_id
          AND s.lehrstelle_id = NEW.lehrstelle_id
          AND s.direction IN ('right', 'super_like')
    ) THEN
        -- Create a match
        INSERT INTO matches (student_id, company_id, lehrstelle_id, company_swipe_id)
        VALUES (NEW.student_id, NEW.company_id, NEW.lehrstelle_id, NEW.id)
        ON CONFLICT (student_id, company_id, lehrstelle_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_check_match_on_company_swipe
    AFTER INSERT ON company_swipes
    FOR EACH ROW
    EXECUTE FUNCTION check_match_on_company_swipe();

-- ============================================================
-- AUTO-CREATE SYSTEM MESSAGE ON MATCH
-- ============================================================
CREATE OR REPLACE FUNCTION create_match_system_message()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO messages (match_id, sender_type, sender_id, content, message_type)
    VALUES (
        NEW.id,
        'system',
        NEW.id,  -- system message uses match ID as sender
        'Ihr habt ein Match! Startet eine Unterhaltung.',
        'system'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_create_match_system_message
    AFTER INSERT ON matches
    FOR EACH ROW
    EXECUTE FUNCTION create_match_system_message();

-- ============================================================
-- UPDATED_AT TRIGGER: Auto-update timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_students_updated_at
    BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_companies_updated_at
    BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_lehrstellen_updated_at
    BEFORE UPDATE ON lehrstellen FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_matches_updated_at
    BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_videos_updated_at
    BEFORE UPDATE ON motivation_videos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- DAILY SWIPE LIMIT CHECK: Prevent excessive swiping
-- ============================================================
CREATE OR REPLACE FUNCTION check_daily_swipe_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_daily_count INTEGER;
    v_daily_limit INTEGER := 20;  -- Configurable daily limit
    v_super_like_limit INTEGER := 3;
BEGIN
    IF NEW.direction = 'left' THEN
        RETURN NEW;  -- Left swipes don't count toward limit
    END IF;

    SELECT right_swipes + super_likes INTO v_daily_count
    FROM daily_swipe_counts
    WHERE student_id = NEW.student_id AND swipe_date = CURRENT_DATE;

    IF v_daily_count >= v_daily_limit THEN
        RAISE EXCEPTION 'Tageslimit erreicht. Du kannst morgen wieder swipen.'
            USING ERRCODE = 'P0001';
    END IF;

    IF NEW.direction = 'super_like' THEN
        SELECT super_likes INTO v_daily_count
        FROM daily_swipe_counts
        WHERE student_id = NEW.student_id AND swipe_date = CURRENT_DATE;

        IF v_daily_count >= v_super_like_limit THEN
            RAISE EXCEPTION 'Super-Like Limit erreicht. Du hast 3 Super-Likes pro Tag.'
                USING ERRCODE = 'P0001';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_check_swipe_limit
    BEFORE INSERT ON swipes
    FOR EACH ROW
    EXECUTE FUNCTION check_daily_swipe_limit();

-- ============================================================
-- PARENTAL CONSENT: Grant consent via token
-- ============================================================
CREATE OR REPLACE FUNCTION grant_parental_consent(p_token UUID, p_ip INET DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    v_student_id UUID;
BEGIN
    -- Find and validate the consent record
    SELECT student_id INTO v_student_id
    FROM parental_consents
    WHERE consent_token = p_token AND status = 'pending';

    IF v_student_id IS NULL THEN
        RETURN false;
    END IF;

    -- Grant consent
    UPDATE parental_consents
    SET status = 'granted',
        granted_at = now(),
        ip_address = p_ip
    WHERE consent_token = p_token;

    -- Update student record
    UPDATE students
    SET parental_consent_status = 'granted'
    WHERE id = v_student_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DATA RETENTION: Auto-cleanup old data
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete swipe data older than 12 months
    DELETE FROM swipes WHERE created_at < now() - INTERVAL '12 months';
    DELETE FROM company_swipes WHERE created_at < now() - INTERVAL '12 months';

    -- Delete messages from archived matches older than 6 months
    DELETE FROM messages
    WHERE match_id IN (
        SELECT id FROM matches
        WHERE status = 'archived' AND archived_at < now() - INTERVAL '6 months'
    );

    -- Permanently delete soft-deleted students after 30 days
    DELETE FROM students
    WHERE deleted_at IS NOT NULL AND deleted_at < now() - INTERVAL '30 days';

    -- Clean up old daily swipe counts
    DELETE FROM daily_swipe_counts WHERE swipe_date < now() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
