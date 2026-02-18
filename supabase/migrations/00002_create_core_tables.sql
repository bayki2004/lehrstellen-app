-- ============================================================
-- BERUFE: Reference table of Swiss apprenticeship occupations
-- ============================================================
CREATE TABLE berufe (
    code TEXT PRIMARY KEY,                   -- Official SBFI/SERI code
    name_de TEXT NOT NULL,
    name_fr TEXT,
    name_it TEXT,
    field TEXT NOT NULL,                      -- Berufsfeld (e.g., "Informatik", "Gesundheit")
    education_type education_type NOT NULL DEFAULT 'EFZ',
    description_de TEXT,
    description_fr TEXT,
    description_it TEXT,
    personality_fit JSONB DEFAULT '{}',       -- Ideal RIASEC profile for this Beruf
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_berufe_field ON berufe(field);

-- ============================================================
-- STUDENTS: Student profiles
-- ============================================================
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    canton TEXT NOT NULL CHECK (char_length(canton) = 2),
    city TEXT,
    school_name TEXT,
    school_year TEXT,
    preferred_language app_language NOT NULL DEFAULT 'de',
    profile_photo_url TEXT,
    bio TEXT CHECK (char_length(bio) <= 500),
    interests JSONB DEFAULT '[]',
    skills JSONB DEFAULT '[]',
    schnupperlehre_experience JSONB DEFAULT '[]',
    multicheck_score INTEGER CHECK (multicheck_score IS NULL OR (multicheck_score >= 0 AND multicheck_score <= 100)),
    parental_consent_status consent_status NOT NULL DEFAULT 'pending',
    parent_email TEXT,
    profile_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ                   -- Soft delete
);

CREATE INDEX idx_students_auth_user ON students(auth_user_id);
CREATE INDEX idx_students_canton ON students(canton);
CREATE INDEX idx_students_consent ON students(parental_consent_status);
CREATE INDEX idx_students_active ON students(id) WHERE deleted_at IS NULL;

-- ============================================================
-- COMPANIES: Company/training firm profiles
-- ============================================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    canton TEXT NOT NULL CHECK (char_length(canton) = 2),
    city TEXT NOT NULL,
    postal_code TEXT,
    address TEXT,
    website_url TEXT,
    description TEXT,
    logo_url TEXT,
    video_url TEXT,
    company_size company_size,
    culture_tags JSONB DEFAULT '[]',
    culture_description TEXT,
    contact_person TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    verified BOOLEAN NOT NULL DEFAULT false,
    premium BOOLEAN NOT NULL DEFAULT false,
    premium_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_companies_canton ON companies(canton);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_verified ON companies(verified);

-- ============================================================
-- LEHRSTELLEN: Apprenticeship positions
-- ============================================================
CREATE TABLE lehrstellen (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    beruf_code TEXT NOT NULL REFERENCES berufe(code),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements JSONB DEFAULT '[]',
    ideal_candidate JSONB DEFAULT '{}',
    education_type education_type NOT NULL DEFAULT 'EFZ',
    start_date DATE,
    duration_years INTEGER NOT NULL DEFAULT 3 CHECK (duration_years BETWEEN 1 AND 5),
    canton TEXT NOT NULL CHECK (char_length(canton) = 2),
    city TEXT NOT NULL,
    postal_code TEXT,
    video_url TEXT,
    photos JSONB DEFAULT '[]',
    culture_description TEXT,
    lena_reference_id TEXT,                  -- Link to official LENA data
    status lehrstelle_status NOT NULL DEFAULT 'active',
    positions_available INTEGER NOT NULL DEFAULT 1 CHECK (positions_available > 0),
    daily_views_count INTEGER NOT NULL DEFAULT 0,
    total_swipes_right INTEGER NOT NULL DEFAULT 0,
    total_swipes_left INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lehrstellen_company ON lehrstellen(company_id);
CREATE INDEX idx_lehrstellen_beruf ON lehrstellen(beruf_code);
CREATE INDEX idx_lehrstellen_canton ON lehrstellen(canton);
CREATE INDEX idx_lehrstellen_status ON lehrstellen(status);
CREATE INDEX idx_lehrstellen_active ON lehrstellen(id) WHERE status = 'active';
CREATE INDEX idx_lehrstellen_start_date ON lehrstellen(start_date);

-- ============================================================
-- PERSONALITY PROFILES: Quiz results (RIASEC model)
-- ============================================================
CREATE TABLE personality_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    holland_codes JSONB NOT NULL DEFAULT '{
        "realistic": 0, "investigative": 0, "artistic": 0,
        "social": 0, "enterprising": 0, "conventional": 0
    }',
    big_five JSONB DEFAULT '{}',
    work_values JSONB DEFAULT '{
        "teamwork": 0, "independence": 0, "creativity": 0,
        "stability": 0, "variety": 0, "helping_others": 0,
        "physical_activity": 0, "technology": 0
    }',
    interests JSONB DEFAULT '[]',
    quiz_answers_raw JSONB DEFAULT '[]',
    computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_personality_student ON personality_profiles(student_id);

-- ============================================================
-- PARENTAL CONSENTS: Consent records for minors
-- ============================================================
CREATE TABLE parental_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_email TEXT NOT NULL,
    consent_token UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    status consent_status NOT NULL DEFAULT 'pending',
    consent_scope JSONB NOT NULL DEFAULT '{
        "profile_data": true,
        "ai_matching": true,
        "company_communication": true,
        "ai_video_generation": false
    }',
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    reminder_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_consent_student ON parental_consents(student_id);
CREATE INDEX idx_consent_token ON parental_consents(consent_token);
CREATE INDEX idx_consent_status ON parental_consents(status);
