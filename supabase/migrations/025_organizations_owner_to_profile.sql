-- =====================================================
-- Change organizations.owner_id to reference profiles instead of auth.users
-- This makes the data model more consistent
-- =====================================================

-- Drop existing constraints
ALTER TABLE public.organizations
  DROP CONSTRAINT IF EXISTS organizations_owner_id_fkey;

ALTER TABLE public.organizations
  DROP CONSTRAINT IF EXISTS unique_owner;

-- Make owner_id nullable temporarily (to handle existing data)
ALTER TABLE public.organizations
  ALTER COLUMN owner_id DROP NOT NULL;

-- For existing organizations, update owner_id to point to the owner's profile
UPDATE public.organizations o
SET owner_id = p.id
FROM public.profiles p
WHERE p.user_id = o.owner_id 
  AND p.role = 'owner'
  AND p.organization_id = o.id;

-- Change owner_id to reference profiles
ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_owner_id_fkey 
  FOREIGN KEY (owner_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Make owner_id required again (organizations must have an owner)
ALTER TABLE public.organizations
  ALTER COLUMN owner_id SET NOT NULL;

-- Add unique constraint (one organization per profile)
ALTER TABLE public.organizations
  ADD CONSTRAINT unique_owner_profile 
  UNIQUE (owner_id);

-- Update comment
COMMENT ON COLUMN public.organizations.owner_id IS 'Profile ID of the organization owner (required)';

-- =====================================================
-- FIX RLS POLICIES THAT CHECK owner_id = auth.uid()
-- =====================================================

-- Fix profiles_event_types junction table policies (from migration 017)
-- These policies were checking o.owner_id = auth.uid(), which no longer works
-- since owner_id now points to profiles.id instead of auth.users.id

DROP POLICY IF EXISTS "Owner can assign event types to profiles" ON public.profiles_event_types;
DROP POLICY IF EXISTS "Owners can delete profile event type assignments" ON public.profiles_event_types;
DROP POLICY IF EXISTS "Staff can view their assigned event types" ON public.profiles_event_types;

-- Policy: Owners can manage all assignments in their organization
CREATE POLICY "Owners can manage profile event type assignments"
  ON public.profiles_event_types
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT o.id 
      FROM public.organizations o
      JOIN public.profiles p ON o.owner_id = p.id
      WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT o.id 
      FROM public.organizations o
      JOIN public.profiles p ON o.owner_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Policy: Staff can view their own assigned event types
CREATE POLICY "Staff can view their assigned event types"
  ON public.profiles_event_types
  FOR SELECT
  TO authenticated
  USING (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );
