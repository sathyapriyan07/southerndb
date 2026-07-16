-- ============================================================
-- SOUTHERND B — STORAGE BUCKETS & POLICIES
-- ============================================================
-- Run AFTER the schema and RLS policies files.
-- ============================================================

-- ============================================================
-- 1. CREATE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', TRUE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('banners', 'banners', TRUE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('news', 'news', TRUE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('admin-uploads', 'admin-uploads', FALSE, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. AVATARS — Public read, owner write
-- ============================================================

-- Anyone can view avatars
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Users can upload to their own folder (avatars/{user_id}/*)
CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own avatar
CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own avatar
CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 3. BANNERS — Public read, admin write
-- ============================================================

CREATE POLICY "banners_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

CREATE POLICY "banners_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'banners'
    AND (
      auth.role() = 'service_role'
      OR public.is_admin()
    )
  );

CREATE POLICY "banners_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'banners'
    AND (
      auth.role() = 'service_role'
      OR public.is_admin()
    )
  );

-- ============================================================
-- 4. NEWS IMAGES — Public read, admin write
-- ============================================================

CREATE POLICY "news_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'news');

CREATE POLICY "news_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'news'
    AND (
      auth.role() = 'service_role'
      OR public.is_admin()
    )
  );

CREATE POLICY "news_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'news'
    AND (
      auth.role() = 'service_role'
      OR public.is_admin()
    )
  );

-- ============================================================
-- 5. ADMIN UPLOADS — Admin only (private)
-- ============================================================

CREATE POLICY "admin_uploads_admin_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'admin-uploads'
    AND (
      auth.role() = 'service_role'
      OR public.is_admin()
    )
  );

CREATE POLICY "admin_uploads_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'admin-uploads'
    AND (
      auth.role() = 'service_role'
      OR public.is_admin()
    )
  );

CREATE POLICY "admin_uploads_admin_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'admin-uploads'
    AND (
      auth.role() = 'service_role'
      OR public.is_admin()
    )
  );

CREATE POLICY "admin_uploads_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'admin-uploads'
    AND (
      auth.role() = 'service_role'
      OR public.is_admin()
    )
  );

-- ============================================================
-- 6. STORAGE HELPERS
-- ============================================================

-- Get public URL for a storage object
CREATE OR REPLACE FUNCTION public.get_storage_url(
  bucket TEXT,
  path TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT value FROM settings WHERE key = 'supabase_url'
  ) || '/storage/v1/object/public/' || bucket || '/' || path;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
