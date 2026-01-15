-- =====================================================
-- Supabase Storage: Member Images Bucket Policies
-- Migration: Create storage policies for member-images bucket
-- 
-- NOTE: The bucket itself must be created via Supabase Dashboard
-- Go to Storage → New Bucket → Create 'member-images' bucket
-- =====================================================

-- =====================================================
-- Storage Policies (Run AFTER creating bucket in Dashboard)
-- =====================================================

-- Policy: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload member images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'member-images' 
  AND (STORAGE.extension(name) = ANY (ARRAY['jpg', 'jpeg', 'png', 'webp']))
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

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE storage.buckets IS 'Storage buckets for member profile images with 5MB limit';
