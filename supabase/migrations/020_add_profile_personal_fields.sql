-- ============================================================================
-- Migration: Add Personal Fields to Profiles
-- Description: Adds name, description, date of birth, phone, and avatar fields
-- ============================================================================

-- 1. Add new columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN first_name TEXT,
  ADD COLUMN last_name TEXT,
  ADD COLUMN description TEXT,
  ADD COLUMN date_of_birth DATE,
  ADD COLUMN phone_number TEXT,
  ADD COLUMN avatar_image TEXT;

-- 2. Add indexes for search performance
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON public.profiles(last_name);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(first_name, last_name);

-- 3. Add column comments
COMMENT ON COLUMN public.profiles.first_name IS 'User first name';
COMMENT ON COLUMN public.profiles.last_name IS 'User last name';
COMMENT ON COLUMN public.profiles.description IS 'User bio or description (max 500 chars recommended)';
COMMENT ON COLUMN public.profiles.date_of_birth IS 'User date of birth';
COMMENT ON COLUMN public.profiles.phone_number IS 'User phone number';
COMMENT ON COLUMN public.profiles.avatar_image IS 'User avatar image URL or path';
