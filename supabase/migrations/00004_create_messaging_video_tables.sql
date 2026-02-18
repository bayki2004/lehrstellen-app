-- ============================================================
-- MESSAGES: Chat messages between matched parties
-- ============================================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    sender_type sender_type NOT NULL,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL CHECK (char_length(content) <= 2000),
    message_type message_type NOT NULL DEFAULT 'text',
    attachment_url TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_match ON messages(match_id);
CREATE INDEX idx_messages_created ON messages(match_id, created_at);
CREATE INDEX idx_messages_unread ON messages(match_id, read_at) WHERE read_at IS NULL;

-- ============================================================
-- MOTIVATION VIDEOS: AI-generated video Motivationsschreiben
-- ============================================================
CREATE TABLE motivation_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    lehrstelle_id UUID REFERENCES lehrstellen(id) ON DELETE SET NULL,
    match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
    script_text TEXT NOT NULL,
    video_url TEXT,
    thumbnail_url TEXT,
    generation_status video_generation_status NOT NULL DEFAULT 'pending',
    language app_language NOT NULL DEFAULT 'de',
    duration_seconds INTEGER,
    heygen_job_id TEXT,                      -- External API reference
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_videos_student ON motivation_videos(student_id);
CREATE INDEX idx_videos_status ON motivation_videos(generation_status);

-- ============================================================
-- REPORTS: Content moderation reports
-- ============================================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_type sender_type NOT NULL,
    reporter_id UUID NOT NULL,
    reported_type TEXT NOT NULL CHECK (reported_type IN ('message', 'profile', 'company')),
    reported_id UUID NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_status ON reports(status);

-- ============================================================
-- BLOCKED USERS: Block list
-- ============================================================
CREATE TABLE blocked_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_type sender_type NOT NULL,
    blocker_id UUID NOT NULL,
    blocked_type sender_type NOT NULL,
    blocked_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_blocked_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_blocked ON blocked_users(blocked_id);
