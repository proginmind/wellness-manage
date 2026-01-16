-- Migration 004: Update Members Table with Organization Support
-- This migration adds organization_id to members and updates RLS policies

-- ============================================================================
-- 1. ADD ORGANIZATION_ID TO MEMBERS
-- ============================================================================

-- Add column as nullable first (for existing data migration)
ALTER TABLE public.members 
  ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_members_organization_id ON public.members(organization_id);

-- ============================================================================
-- 2. DATA MIGRATION INSTRUCTIONS
-- ============================================================================

-- IMPORTANT: Before making organization_id NOT NULL, you must:
--
-- Option A: If you have existing members and want to keep them:
--   1. Create an organization in Supabase Dashboard (organizations table)
--   2. Create a profile linking your user to that organization
--   3. Run: UPDATE public.members SET organization_id = 'YOUR_ORG_ID' WHERE organization_id IS NULL;
--
-- Option B: If you want a clean start:
--   1. Run: TRUNCATE public.members CASCADE;
--   2. Create organization and profile as above
--   3. Add new members through the app
--
-- After data migration, uncomment and run the following lines:

-- Make organization_id required (uncomment after data migration)
-- ALTER TABLE public.members ALTER COLUMN organization_id SET NOT NULL;

-- ============================================================================
-- 3. UPDATE RLS POLICIES FOR MEMBERS
-- ============================================================================

-- Drop old policies that don't check organization
DROP POLICY IF EXISTS "Authenticated users can read members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can create members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can update members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can delete members" ON public.members;

-- New organization-scoped policies

-- SELECT: Users can view members in their organization
CREATE POLICY "Users can view members in their organization"
  ON public.members FOR SELECT
  TO authenticated
  USING (
    organization_id = (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- INSERT: Users can create members in their organization
CREATE POLICY "Users can create members in their organization"
  ON public.members FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id = (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- UPDATE: Users can update members in their organization
CREATE POLICY "Users can update members in their organization"
  ON public.members FOR UPDATE
  TO authenticated
  USING (
    organization_id = (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id = (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- DELETE: Only owners can delete members
CREATE POLICY "Owners can delete members in their organization"
  ON public.members FOR DELETE
  TO authenticated
  USING (
    organization_id = (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- ============================================================================
-- 4. UPDATE TRIGGER FOR AUTOMATIC USER_ID REMOVAL (optional cleanup)
-- ============================================================================

-- Note: We keep user_id in members table for audit trail, but organization_id
-- is now the primary association. Consider removing user_id in future migrations
-- if it's no longer needed.

-- ============================================================================
-- VERIFICATION QUERIES (commented out, run manually if needed)
-- ============================================================================

-- Check members without organization
-- SELECT id, first_name, last_name, email, organization_id FROM public.members WHERE organization_id IS NULL;

-- Check members by organization
-- SELECT m.*, o.name as organization_name 
-- FROM public.members m
-- JOIN public.organizations o ON m.organization_id = o.id;
