-- ============================================================
-- BEWERBUNGEN (Applications) - Core V2 Feature
-- ============================================================

-- Status state machine for applications
CREATE TYPE bewerbung_status AS ENUM (
    'sent',                      -- Student swiped right, profile sent
    'viewed',                    -- Company opened the application
    'interview_invited',         -- Company invited student to interview
    'rejected',                  -- Company rejected
    'schnupperlehre_scheduled',  -- Trial day/Schnupperlehre scheduled
    'offer',                     -- Company made an offer
    'accepted',                  -- Student accepted the offer
    'withdrawn'                  -- Student withdrew application
);

-- ============================================================
-- BEWERBUNGEN TABLE
-- ============================================================
CREATE TABLE bewerbungen (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES lehrstellen(id) ON DELETE CASCADE,
    status bewerbung_status NOT NULL DEFAULT 'sent',
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    viewed_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, listing_id)
);

CREATE INDEX idx_bewerbungen_student ON bewerbungen(student_id);
CREATE INDEX idx_bewerbungen_listing ON bewerbungen(listing_id);
CREATE INDEX idx_bewerbungen_status ON bewerbungen(status);
CREATE INDEX idx_bewerbungen_sent_at ON bewerbungen(sent_at DESC);
CREATE INDEX idx_bewerbungen_student_status ON bewerbungen(student_id, status);

-- ============================================================
-- ZEUGNISSE (Student documents / certificates)
-- ============================================================
CREATE TABLE zeugnisse (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'image')),
    file_size_bytes BIGINT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_zeugnisse_student ON zeugnisse(student_id);

-- ============================================================
-- SKIPPED LISTINGS (Left swipes)
-- ============================================================
CREATE TABLE skipped_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES lehrstellen(id) ON DELETE CASCADE,
    skipped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, listing_id)
);

CREATE INDEX idx_skipped_student ON skipped_listings(student_id);

-- ============================================================
-- TRIGGER: Auto-update updated_at on bewerbungen
-- ============================================================
CREATE TRIGGER trg_bewerbungen_updated_at
    BEFORE UPDATE ON bewerbungen
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE bewerbungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE zeugnisse ENABLE ROW LEVEL SECURITY;
ALTER TABLE skipped_listings ENABLE ROW LEVEL SECURITY;

-- Students: can create and read own bewerbungen
CREATE POLICY "bewerbungen_insert_own" ON bewerbungen
    FOR INSERT WITH CHECK (student_id = get_current_student_id());

CREATE POLICY "bewerbungen_read_own_student" ON bewerbungen
    FOR SELECT USING (student_id = get_current_student_id());

-- Students can withdraw (update status to 'withdrawn')
CREATE POLICY "bewerbungen_update_own_student" ON bewerbungen
    FOR UPDATE USING (student_id = get_current_student_id());

-- Companies: can read bewerbungen for their listings
CREATE POLICY "bewerbungen_read_company" ON bewerbungen
    FOR SELECT USING (
        EXISTS(
            SELECT 1 FROM lehrstellen l
            WHERE l.id = bewerbungen.listing_id
              AND l.company_id = get_current_company_id()
        )
    );

-- Companies: can update status (viewed, interview_invited, rejected, etc.)
CREATE POLICY "bewerbungen_update_company" ON bewerbungen
    FOR UPDATE USING (
        EXISTS(
            SELECT 1 FROM lehrstellen l
            WHERE l.id = bewerbungen.listing_id
              AND l.company_id = get_current_company_id()
        )
    );

-- Zeugnisse: students own their documents
CREATE POLICY "zeugnisse_insert_own" ON zeugnisse
    FOR INSERT WITH CHECK (student_id = get_current_student_id());

CREATE POLICY "zeugnisse_read_own" ON zeugnisse
    FOR SELECT USING (student_id = get_current_student_id());

CREATE POLICY "zeugnisse_delete_own" ON zeugnisse
    FOR DELETE USING (student_id = get_current_student_id());

-- Companies can read zeugnisse for students who applied to their listings
CREATE POLICY "zeugnisse_read_via_bewerbung" ON zeugnisse
    FOR SELECT USING (
        EXISTS(
            SELECT 1 FROM bewerbungen b
            JOIN lehrstellen l ON l.id = b.listing_id
            WHERE b.student_id = zeugnisse.student_id
              AND l.company_id = get_current_company_id()
        )
    );

-- Skipped listings: students only
CREATE POLICY "skipped_insert_own" ON skipped_listings
    FOR INSERT WITH CHECK (student_id = get_current_student_id());

CREATE POLICY "skipped_read_own" ON skipped_listings
    FOR SELECT USING (student_id = get_current_student_id());

-- ============================================================
-- UPDATE students RLS: Companies can read students who applied
-- ============================================================
CREATE POLICY "students_read_by_bewerbung_company" ON students
    FOR SELECT USING (
        EXISTS(
            SELECT 1 FROM bewerbungen b
            JOIN lehrstellen l ON l.id = b.listing_id
            WHERE b.student_id = students.id
              AND l.company_id = get_current_company_id()
        )
    );
