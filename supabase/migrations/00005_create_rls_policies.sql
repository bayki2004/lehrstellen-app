-- ============================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE lehrstellen ENABLE ROW LEVEL SECURITY;
ALTER TABLE berufe ENABLE ROW LEVEL SECURITY;
ALTER TABLE personality_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parental_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_swipe_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE motivation_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Get the student ID for the current authenticated user
CREATE OR REPLACE FUNCTION get_current_student_id()
RETURNS UUID AS $$
    SELECT id FROM students WHERE auth_user_id = auth.uid() AND deleted_at IS NULL LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get the company ID for the current authenticated user
CREATE OR REPLACE FUNCTION get_current_company_id()
RETURNS UUID AS $$
    SELECT id FROM companies WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if a student and company have a mutual match
CREATE OR REPLACE FUNCTION has_match(p_student_id UUID, p_company_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS(
        SELECT 1 FROM matches
        WHERE student_id = p_student_id
          AND company_id = p_company_id
          AND status = 'active'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- BERUFE: Public read access (reference data)
-- ============================================================
CREATE POLICY "berufe_read_all" ON berufe
    FOR SELECT USING (true);

-- ============================================================
-- STUDENTS: Own profile only
-- ============================================================
CREATE POLICY "students_read_own" ON students
    FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "students_insert_own" ON students
    FOR INSERT WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "students_update_own" ON students
    FOR UPDATE USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

-- Companies can read student profiles only if they have a match or mutual swipe
CREATE POLICY "students_read_by_matched_company" ON students
    FOR SELECT USING (
        EXISTS(
            SELECT 1 FROM matches m
            WHERE m.student_id = students.id
              AND m.company_id = get_current_company_id()
              AND m.status = 'active'
        )
    );

-- ============================================================
-- COMPANIES: Public read for verified companies
-- ============================================================
CREATE POLICY "companies_read_verified" ON companies
    FOR SELECT USING (verified = true);

CREATE POLICY "companies_read_own" ON companies
    FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "companies_insert_own" ON companies
    FOR INSERT WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "companies_update_own" ON companies
    FOR UPDATE USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

-- ============================================================
-- LEHRSTELLEN: Public read for active positions
-- ============================================================
CREATE POLICY "lehrstellen_read_active" ON lehrstellen
    FOR SELECT USING (status = 'active');

CREATE POLICY "lehrstellen_read_own_company" ON lehrstellen
    FOR SELECT USING (company_id = get_current_company_id());

CREATE POLICY "lehrstellen_insert_own_company" ON lehrstellen
    FOR INSERT WITH CHECK (company_id = get_current_company_id());

CREATE POLICY "lehrstellen_update_own_company" ON lehrstellen
    FOR UPDATE USING (company_id = get_current_company_id())
    WITH CHECK (company_id = get_current_company_id());

CREATE POLICY "lehrstellen_delete_own_company" ON lehrstellen
    FOR DELETE USING (company_id = get_current_company_id());

-- ============================================================
-- PERSONALITY PROFILES: Own only
-- ============================================================
CREATE POLICY "personality_read_own" ON personality_profiles
    FOR SELECT USING (student_id = get_current_student_id());

CREATE POLICY "personality_insert_own" ON personality_profiles
    FOR INSERT WITH CHECK (student_id = get_current_student_id());

CREATE POLICY "personality_update_own" ON personality_profiles
    FOR UPDATE USING (student_id = get_current_student_id());

-- ============================================================
-- PARENTAL CONSENTS: Students can read own, system can write
-- ============================================================
CREATE POLICY "consent_read_own" ON parental_consents
    FOR SELECT USING (student_id = get_current_student_id());

CREATE POLICY "consent_insert_own" ON parental_consents
    FOR INSERT WITH CHECK (student_id = get_current_student_id());

-- No update/delete by users — managed by backend functions

-- ============================================================
-- SWIPES: Students can insert own, never see others' swipes
-- ============================================================
CREATE POLICY "swipes_insert_own" ON swipes
    FOR INSERT WITH CHECK (student_id = get_current_student_id());

CREATE POLICY "swipes_read_own" ON swipes
    FOR SELECT USING (student_id = get_current_student_id());

-- Companies CANNOT see individual student swipes (privacy)
-- They only learn about interest through matches

-- ============================================================
-- COMPANY SWIPES: Companies can insert own
-- ============================================================
CREATE POLICY "company_swipes_insert_own" ON company_swipes
    FOR INSERT WITH CHECK (company_id = get_current_company_id());

CREATE POLICY "company_swipes_read_own" ON company_swipes
    FOR SELECT USING (company_id = get_current_company_id());

-- Students CANNOT see company swipes until a match

-- ============================================================
-- MATCHES: Both parties can read their matches
-- ============================================================
CREATE POLICY "matches_read_student" ON matches
    FOR SELECT USING (student_id = get_current_student_id());

CREATE POLICY "matches_read_company" ON matches
    FOR SELECT USING (company_id = get_current_company_id());

CREATE POLICY "matches_update_student" ON matches
    FOR UPDATE USING (student_id = get_current_student_id());

CREATE POLICY "matches_update_company" ON matches
    FOR UPDATE USING (company_id = get_current_company_id());

-- ============================================================
-- DAILY SWIPE COUNTS: Own only
-- ============================================================
CREATE POLICY "daily_swipes_read_own" ON daily_swipe_counts
    FOR SELECT USING (student_id = get_current_student_id());

CREATE POLICY "daily_swipes_upsert_own" ON daily_swipe_counts
    FOR INSERT WITH CHECK (student_id = get_current_student_id());

CREATE POLICY "daily_swipes_update_own" ON daily_swipe_counts
    FOR UPDATE USING (student_id = get_current_student_id());

-- ============================================================
-- MESSAGES: Only match participants can read/write
-- ============================================================
CREATE POLICY "messages_read_match_participant" ON messages
    FOR SELECT USING (
        EXISTS(
            SELECT 1 FROM matches m
            WHERE m.id = messages.match_id
              AND (
                  m.student_id = get_current_student_id()
                  OR m.company_id = get_current_company_id()
              )
              AND m.status = 'active'
        )
    );

CREATE POLICY "messages_insert_match_participant" ON messages
    FOR INSERT WITH CHECK (
        EXISTS(
            SELECT 1 FROM matches m
            WHERE m.id = match_id
              AND m.chat_enabled = true
              AND m.status = 'active'
              AND (
                  (sender_type = 'student' AND m.student_id = get_current_student_id() AND sender_id = get_current_student_id())
                  OR (sender_type = 'company' AND m.company_id = get_current_company_id() AND sender_id = get_current_company_id())
              )
        )
    );

-- ============================================================
-- MOTIVATION VIDEOS: Own only
-- ============================================================
CREATE POLICY "videos_read_own" ON motivation_videos
    FOR SELECT USING (student_id = get_current_student_id());

CREATE POLICY "videos_insert_own" ON motivation_videos
    FOR INSERT WITH CHECK (student_id = get_current_student_id());

CREATE POLICY "videos_update_own" ON motivation_videos
    FOR UPDATE USING (student_id = get_current_student_id());

-- ============================================================
-- REPORTS: Anyone can insert, only admins can read
-- ============================================================
CREATE POLICY "reports_insert_any" ON reports
    FOR INSERT WITH CHECK (true);

-- ============================================================
-- BLOCKED USERS: Own blocks only
-- ============================================================
CREATE POLICY "blocked_insert_own" ON blocked_users
    FOR INSERT WITH CHECK (
        blocker_id = get_current_student_id()
        OR blocker_id = get_current_company_id()
    );

CREATE POLICY "blocked_read_own" ON blocked_users
    FOR SELECT USING (
        blocker_id = get_current_student_id()
        OR blocker_id = get_current_company_id()
    );

CREATE POLICY "blocked_delete_own" ON blocked_users
    FOR DELETE USING (
        blocker_id = get_current_student_id()
        OR blocker_id = get_current_company_id()
    );
