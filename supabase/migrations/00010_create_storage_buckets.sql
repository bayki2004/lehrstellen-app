-- ============================================================
-- SUPABASE STORAGE BUCKETS for V2
-- ============================================================

-- Profile photos (public, viewable by anyone)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-photos',
    'profile-photos',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/heic']
) ON CONFLICT (id) DO NOTHING;

-- Motivation videos (public, viewable by companies)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'motivation-videos',
    'motivation-videos',
    true,
    52428800, -- 50MB
    ARRAY['video/mp4', 'video/quicktime']
) ON CONFLICT (id) DO NOTHING;

-- Zeugnisse / certificates (private, only accessible via authenticated requests)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'zeugnisse',
    'zeugnisse',
    false,
    10485760, -- 10MB
    ARRAY['application/pdf', 'image/jpeg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE RLS POLICIES
-- ============================================================

-- Profile photos: authenticated users can upload to their own folder
CREATE POLICY "profile_photos_upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'profile-photos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "profile_photos_read" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'profile-photos');

CREATE POLICY "profile_photos_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'profile-photos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Motivation videos: authenticated users upload own, public read
CREATE POLICY "motivation_videos_upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'motivation-videos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "motivation_videos_read" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'motivation-videos');

CREATE POLICY "motivation_videos_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'motivation-videos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Zeugnisse: authenticated users upload own, only accessible via auth
CREATE POLICY "zeugnisse_upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'zeugnisse'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "zeugnisse_read_own" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'zeugnisse'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "zeugnisse_delete_own" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'zeugnisse'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
