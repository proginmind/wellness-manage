-- =====================================================
-- Make profiles.user_id and organization_id optional (nullable)
-- Allows profiles to exist before auth accounts or organizations are created
-- This supports flexible seed scripts and invitation flows
-- =====================================================

-- Drop unique constraint on user_id
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_user_id_key;

-- Make user_id nullable
ALTER TABLE public.profiles
  ALTER COLUMN user_id DROP NOT NULL;

-- Make organization_id nullable
ALTER TABLE public.profiles
  ALTER COLUMN organization_id DROP NOT NULL;

-- Add unique constraint that allows multiple NULLs but enforces uniqueness for non-NULL values
-- This allows multiple "unlinked" profiles but prevents duplicate auth account links
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_unique 
  ON public.profiles(user_id) 
  WHERE user_id IS NOT NULL;

-- Update RLS policies to handle NULL user_id and NULL organization_id
-- Drop all old SELECT policies to avoid conflicts
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are readable by authenticated users in same organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Policy 1: Users can view their own profile (highest priority, simple check)
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can view profiles in their organization (uses SECURITY DEFINER function to avoid recursion)
CREATE POLICY "Users can view profiles in their organization"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    organization_id IS NOT NULL 
    AND organization_id = public.user_organization_id()
  );

-- Policy 3: Users can update their own profile (if linked to auth)
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Update comments
COMMENT ON COLUMN public.profiles.user_id IS 'Auth user ID (nullable - linked when user accepts invitation or signs up)';
COMMENT ON COLUMN public.profiles.organization_id IS 'Organization ID (nullable during profile creation, set before activation)';

-- =====================================================
-- UPDATE TRIGGER: Allow organization_id to be set from NULL
-- =====================================================

-- Update the trigger function to allow setting fields from NULL to a value
-- This is needed for seed scripts and auth linking where profiles are created before auth/org
CREATE OR REPLACE FUNCTION public.prevent_profile_critical_field_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow setting user_id from NULL to a value (for auth linking)
  -- But prevent changing between two non-NULL values
  IF OLD.user_id IS NOT NULL AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Cannot change user_id';
  END IF;
  
  -- Allow setting organization_id from NULL to a value (for seed scripts)
  -- But prevent changing between two non-NULL values
  IF OLD.organization_id IS NOT NULL AND NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
    RAISE EXCEPTION 'Cannot change organization_id';
  END IF;
  
  -- Prevent changes to role
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Cannot change role';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update handle_new_user function to only create profile if one doesn't exist
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile if user doesn't have one yet
  -- This allows seed script to pre-create profiles that get linked on signup
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = NEW.email) THEN
    INSERT INTO public.profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
  ELSE
    -- Profile exists (from seed or invitation), link it to this auth user
    UPDATE public.profiles
    SET user_id = NEW.id
    WHERE email = NEW.email AND user_id IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user IS 'Links new auth users to existing profiles by email, or creates new profile';
