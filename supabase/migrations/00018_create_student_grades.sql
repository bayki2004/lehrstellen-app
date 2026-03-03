-- ============================================================
-- STUDENT GRADES (Zeugnis, Multicheck, Basic-Check, Stellwerk)
-- ============================================================
-- Note: FK to student_profiles is managed by Prisma, not here.
-- This migration creates the table; Prisma db push handles FKs.

CREATE TABLE IF NOT EXISTS student_grades (
    id TEXT PRIMARY KEY,
    "studentId" TEXT NOT NULL,

    -- Document metadata
    "documentType" TEXT NOT NULL,   -- 'zeugnis' | 'multicheck' | 'basic_check' | 'stellwerk'
    "entryMethod" TEXT NOT NULL,    -- 'scan' | 'manual'

    -- Zeugnis-specific
    canton TEXT,
    niveau TEXT,                     -- 'Sek A', 'Sek B', 'Sek C', 'Bezirksschule'
    semester INTEGER,                -- 1 or 2
    "schoolYear" TEXT,               -- '2025/2026'

    -- Multicheck/Stellwerk-specific
    "testVariant" TEXT,              -- 'Multicheck ICT', 'Basic-Check', 'Stellwerk'
    "testDate" TIMESTAMPTZ,

    -- Actual grades (flexible JSONB)
    grades JSONB NOT NULL,

    -- Verification
    "isVerified" BOOLEAN DEFAULT false,
    "verifiedAt" TIMESTAMPTZ,
    "verificationMethod" TEXT DEFAULT 'self',

    -- OCR metadata (scan entries only)
    "ocrConfidence" DOUBLE PRECISION,
    "ocrLowConfidenceFields" TEXT[] DEFAULT '{}',

    "createdAt" TIMESTAMPTZ DEFAULT now(),
    "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_student_grades_student ON student_grades("studentId");
CREATE INDEX IF NOT EXISTS idx_student_grades_type ON student_grades("documentType");
