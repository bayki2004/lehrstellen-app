-- ============================================================
-- SWIPES: Student swipe actions on lehrstellen
-- ============================================================
CREATE TABLE swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    lehrstelle_id UUID NOT NULL REFERENCES lehrstellen(id) ON DELETE CASCADE,
    direction swipe_direction NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, lehrstelle_id)
);

CREATE INDEX idx_swipes_student ON swipes(student_id);
CREATE INDEX idx_swipes_lehrstelle ON swipes(lehrstelle_id);
CREATE INDEX idx_swipes_direction ON swipes(direction) WHERE direction IN ('right', 'super_like');
CREATE INDEX idx_swipes_created ON swipes(created_at);

-- ============================================================
-- COMPANY SWIPES: Company swipe actions on students
-- ============================================================
CREATE TABLE company_swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    lehrstelle_id UUID NOT NULL REFERENCES lehrstellen(id) ON DELETE CASCADE,
    direction swipe_direction NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(company_id, student_id, lehrstelle_id)
);

CREATE INDEX idx_company_swipes_company ON company_swipes(company_id);
CREATE INDEX idx_company_swipes_student ON company_swipes(student_id);
CREATE INDEX idx_company_swipes_lehrstelle ON company_swipes(lehrstelle_id);

-- ============================================================
-- MATCHES: Mutual interest = match
-- ============================================================
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    lehrstelle_id UUID NOT NULL REFERENCES lehrstellen(id) ON DELETE CASCADE,
    student_swipe_id UUID REFERENCES swipes(id),
    company_swipe_id UUID REFERENCES company_swipes(id),
    status match_status NOT NULL DEFAULT 'active',
    compatibility_score DOUBLE PRECISION CHECK (compatibility_score >= 0 AND compatibility_score <= 1),
    chat_enabled BOOLEAN NOT NULL DEFAULT true,
    matched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, company_id, lehrstelle_id)
);

CREATE INDEX idx_matches_student ON matches(student_id);
CREATE INDEX idx_matches_company ON matches(company_id);
CREATE INDEX idx_matches_lehrstelle ON matches(lehrstelle_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_active_student ON matches(student_id) WHERE status = 'active';
CREATE INDEX idx_matches_active_company ON matches(company_id) WHERE status = 'active';

-- ============================================================
-- DAILY SWIPE TRACKING: Enforce daily swipe limits
-- ============================================================
CREATE TABLE daily_swipe_counts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    swipe_date DATE NOT NULL DEFAULT CURRENT_DATE,
    right_swipes INTEGER NOT NULL DEFAULT 0,
    super_likes INTEGER NOT NULL DEFAULT 0,
    UNIQUE(student_id, swipe_date)
);

CREATE INDEX idx_daily_swipes_student_date ON daily_swipe_counts(student_id, swipe_date);
