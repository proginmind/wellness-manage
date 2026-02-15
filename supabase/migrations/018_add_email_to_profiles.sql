-- =====================================================
-- Wellness Center Member Management System
-- Migration: Add email column to profiles table
-- =====================================================
-- 
-- Purpose: Denormalize email from auth.users to profiles table
--          for better performance and simpler queries
-- 
-- =====================================================

-- =====================================================
-- 1. ADD EMAIL COLUMN
-- =====================================================

-- Add email column (nullable initially for backfill)
ALTER TABLE public.profiles 
  ADD COLUMN email TEXT;

-- =====================================================
-- 2. BACKFILL EXISTING EMAILS
-- =====================================================

-- Populate email from auth.users for existing profiles
UPDATE public.profiles p
SET email = au.email
FROM auth.users au
WHERE p.user_id = au.id
  AND p.email IS NULL;

-- =====================================================
-- 3. MAKE EMAIL REQUIRED
-- =====================================================

-- Make email NOT NULL after backfill
ALTER TABLE public.profiles 
  ALTER COLUMN email SET NOT NULL;

-- =====================================================
-- 4. ADD INDEXES
-- =====================================================

-- Index for email searches
CREATE INDEX IF NOT EXISTS idx_profiles_email 
  ON public.profiles(email);

-- Composite index for organization + email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_org_email 
  ON public.profiles(organization_id, email);

-- =====================================================
-- 5. COMMENTS
-- =====================================================

COMMENT ON COLUMN public.profiles.email IS 'User email address (denormalized from auth.users for performance)';

-- =====================================================
-- VERIFICATION QUERIES (for manual testing)
-- =====================================================

-- Verify all profiles have emails
-- SELECT COUNT(*) as total, COUNT(email) as with_email 
-- FROM public.profiles;

-- Check for any NULL emails (should be 0 after migration)
-- SELECT * FROM public.profiles WHERE email IS NULL;
