-- Migration 004 (SAFE): Update Members Table with Organization Support
-- This version handles existing data safely

-- ============================================================================
-- STEP 1: ADD ORGANIZATION_ID COLUMN (if not exists)
-- ============================================================================

DO $$
BEGIN
  -- Check if column exists, add if it doesn't
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'members' 
    AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE public.members 
      ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Added organization_id column to members table';
  ELSE
    RAISE NOTICE 'organization_id column already exists';
  END IF;
END $$;

-- Create index for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_members_organization_id ON public.members(organization_id);

-- ============================================================================
-- STEP 2: DROP OLD RLS POLICIES (Safe with IF EXISTS)
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can read members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can create members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can update members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can delete members" ON public.members;

-- ============================================================================
-- STEP 3: CREATE NEW ORGANIZATION-SCOPED RLS POLICIES
-- ============================================================================

-- SELECT: Users can view members in their organization
CREATE POLICY "Users can view members in their organization"
  ON public.members FOR SELECT
  TO authenticated
  USING (
    organization_id IS NOT NULL AND
    organization_id = (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- INSERT: Users can create members in their organization
CREATE POLICY "Users can create members in their organization"
  ON public.members FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IS NOT NULL AND
    organization_id = (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- UPDATE: Users can update members in their organization
CREATE POLICY "Users can update members in their organization"
  ON public.members FOR UPDATE
  TO authenticated
  USING (
    organization_id IS NOT NULL AND
    organization_id = (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IS NOT NULL AND
    organization_id = (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- DELETE: Only owners can delete members
CREATE POLICY "Owners can delete members in their organization"
  ON public.members FOR DELETE
  TO authenticated
  USING (
    organization_id IS NOT NULL AND
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
-- STEP 4: DATA CLEANUP (Optional)
-- ============================================================================

-- If you have members without organization_id, they won't be visible anymore
-- Check how many:
-- SELECT COUNT(*) FROM public.members WHERE organization_id IS NULL;

-- To delete them (if you want a clean start):
-- DELETE FROM public.members WHERE organization_id IS NULL;

-- To migrate them (after creating org + profile):
-- UPDATE public.members 
-- SET organization_id = (SELECT id FROM public.organizations WHERE owner_id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL'))
-- WHERE organization_id IS NULL;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check the setup
SELECT 'Organizations:' as check_type, COUNT(*) as count FROM public.organizations
UNION ALL
SELECT 'Profiles:', COUNT(*) FROM public.profiles
UNION ALL
SELECT 'Members with org:', COUNT(*) FROM public.members WHERE organization_id IS NOT NULL
UNION ALL
SELECT 'Members without org:', COUNT(*) FROM public.members WHERE organization_id IS NULL;
