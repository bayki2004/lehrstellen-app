-- ============================================================
-- Add motivation_questions to lehrstellen + storage bucket
-- ============================================================

-- Motivation questions for each lehrstelle (company-defined, 3 per listing)
ALTER TABLE lehrstellen ADD COLUMN IF NOT EXISTS motivation_questions JSONB DEFAULT '[]';

-- Storage bucket for uploaded Motivationsschreiben (PDF/images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'motivationsschreiben',
    'motivationsschreiben',
    false,
    5242880, -- 5MB
    ARRAY['application/pdf', 'image/jpeg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

-- RLS: authenticated students can upload to their own folder
CREATE POLICY "motivationsschreiben_upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'motivationsschreiben'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "motivationsschreiben_read_own" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'motivationsschreiben'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "motivationsschreiben_delete_own" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'motivationsschreiben'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
