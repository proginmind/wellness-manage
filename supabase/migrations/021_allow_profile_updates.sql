-- ============================================================================
-- Migration: Allow Users to Update Their Own Profile
-- Description: Replace overly restrictive policy to allow profile updates
--              while still preventing role/organization changes
-- ============================================================================

-- 1. Drop the old restrictive policy
DROP POLICY IF EXISTS "Profiles cannot be modified via app" ON public.profiles;

-- 2. Create new policy allowing users to update their own profile
-- USING: Determines which existing rows can be updated (must be user's own profile)
-- WITH CHECK: Ensures the updated row maintains data integrity (critical fields unchanged)
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- User can only update their own profile
    user_id = auth.uid()
  )
  WITH CHECK (
    -- After update, these fields must still match current user's identity
    -- This prevents users from changing their role, organization, or user_id
    user_id = auth.uid()
  );

-- 3. Add a database trigger to prevent modification of critical fields
-- This ensures role and organization_id cannot be changed via any UPDATE
CREATE OR REPLACE FUNCTION public.prevent_profile_critical_field_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent changes to user_id
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Cannot change user_id';
  END IF;
  
  -- Prevent changes to organization_id
  IF NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
    RAISE EXCEPTION 'Cannot change organization_id';
  END IF;
  
  -- Prevent changes to role
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Cannot change role';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS prevent_profile_critical_changes ON public.profiles;

-- Create trigger that fires before any update
CREATE TRIGGER prevent_profile_critical_changes
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_critical_field_changes();

-- Add comment explaining the policy
COMMENT ON POLICY "Users can update their own profile" ON public.profiles IS 
  'Allows users to update their personal profile information (name, description, avatar, etc.) but prevents changing role, organization, or user_id via trigger';
