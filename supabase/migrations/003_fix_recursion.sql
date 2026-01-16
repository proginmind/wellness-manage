-- Fix: Infinite Recursion in RLS Policies
-- This script fixes the circular dependency in profiles and members policies

-- ============================================================================
-- 1. DROP PROBLEMATIC POLICIES
-- ============================================================================

-- Drop profiles policies that cause recursion
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Drop members policies that reference profiles
DROP POLICY IF EXISTS "Users can view members in their organization" ON public.members;
DROP POLICY IF EXISTS "Users can create members in their organization" ON public.members;
DROP POLICY IF EXISTS "Users can update members in their organization" ON public.members;
DROP POLICY IF EXISTS "Owners can delete members in their organization" ON public.members;

-- ============================================================================
-- 2. CREATE SECURITY DEFINER FUNCTION (Bypasses RLS)
-- ============================================================================

-- This function runs with elevated privileges and bypasses RLS
-- It's safe because it only returns the current user's organization_id
CREATE OR REPLACE FUNCTION public.user_organization_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id 
  FROM public.profiles 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.user_organization_id() TO authenticated;

-- ============================================================================
-- 3. RECREATE PROFILES POLICIES (No Recursion)
-- ============================================================================

-- Users can view profiles in their organization
CREATE POLICY "Users can view profiles in their organization"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
  );

-- Users can view their own profile (alternative path)
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
  );

-- No updates allowed via app (only via Dashboard/SQL)
CREATE POLICY "Profiles cannot be modified via app"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (false);

-- No deletes allowed via app
CREATE POLICY "Profiles cannot be deleted via app"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (false);

-- ============================================================================
-- 4. RECREATE MEMBERS POLICIES (Using Helper Function)
-- ============================================================================

-- SELECT: Users can view members in their organization
CREATE POLICY "Users can view members in their organization"
  ON public.members FOR SELECT
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
  );

-- INSERT: Users can create members in their organization
CREATE POLICY "Users can create members in their organization"
  ON public.members FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id = public.user_organization_id()
  );

-- UPDATE: Users can update members in their organization
CREATE POLICY "Users can update members in their organization"
  ON public.members FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
  )
  WITH CHECK (
    organization_id = public.user_organization_id()
  );

-- DELETE: Only owners can delete members
CREATE POLICY "Owners can delete members in their organization"
  ON public.members FOR DELETE
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
    AND
    public.is_owner(auth.uid())
  );

-- ============================================================================
-- 5. RECREATE INVITATIONS POLICIES (Using Helper Function)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view invitations in their organization" ON public.invitations;
DROP POLICY IF EXISTS "Owners can create invitations" ON public.invitations;
DROP POLICY IF EXISTS "Owners can update invitations" ON public.invitations;

-- Users can view invitations in their organization
CREATE POLICY "Users can view invitations in their organization"
  ON public.invitations FOR SELECT
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
  );

-- Only owners can create invitations
CREATE POLICY "Owners can create invitations"
  ON public.invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_owner(auth.uid())
    AND organization_id = public.user_organization_id()
  );

-- Only owners can update invitations
CREATE POLICY "Owners can update invitations"
  ON public.invitations FOR UPDATE
  TO authenticated
  USING (
    public.is_owner(auth.uid())
    AND organization_id = public.user_organization_id()
  );

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Test the helper function
SELECT 'Testing public.user_organization_id():' as test;
SELECT public.user_organization_id() as my_org_id;

-- Show all policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
