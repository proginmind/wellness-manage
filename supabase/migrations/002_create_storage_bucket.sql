-- =====================================================
-- Supabase Storage: Member Images Bucket
-- Migration: Create storage bucket and policies for member-images
-- =====================================================

-- =====================================================
-- 1. CREATE STORAGE BUCKET
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'member-images',
  'member-images',
  true, -- Public bucket for easy image access
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. CREATE STORAGE POLICIES
-- =====================================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Authenticated users can upload member images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to member images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update member images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete member images" ON storage.objects;

-- Policy: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload member images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'member-images'
);

-- Policy: Public read access to images
CREATE POLICY "Public read access to member images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'member-images');

-- Policy: Authenticated users can update their uploaded images
CREATE POLICY "Authenticated users can update member images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'member-images')
WITH CHECK (bucket_id = 'member-images');

-- Policy: Authenticated users can delete images
CREATE POLICY "Authenticated users can delete member images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'member-images');
