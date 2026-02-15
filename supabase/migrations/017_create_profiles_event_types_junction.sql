-- =====================================================
-- Wellness Center Member Management System
-- Migration: Create profiles_event_types junction table
-- =====================================================
-- 
-- Purpose: Establish many-to-many relationship between profiles 
--          and event types (services) for qualification tracking
-- 
-- =====================================================

-- =====================================================
-- 1. CREATE JUNCTION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles_event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type_id UUID REFERENCES public.event_types(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure a profile can't be assigned to the same event type twice
  CONSTRAINT unique_profile_event_type UNIQUE (profile_id, event_type_id)
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for looking up event types by profile
-- Use case: "What services can this profile perform?"
CREATE INDEX IF NOT EXISTS idx_profiles_event_types_profile_id 
  ON public.profiles_event_types(profile_id);

-- Index for looking up profiles by event type
-- Use case: "Which profiles can perform this service?"
CREATE INDEX IF NOT EXISTS idx_profiles_event_types_event_type_id 
  ON public.profiles_event_types(event_type_id);

-- Index for organization scoping
-- Use case: Multi-tenancy filtering
CREATE INDEX IF NOT EXISTS idx_profiles_event_types_organization_id 
  ON public.profiles_event_types(organization_id);

-- Composite index for common queries
-- Use case: "What services can this profile perform in this organization?"
CREATE INDEX IF NOT EXISTS idx_profiles_event_types_org_profile 
  ON public.profiles_event_types(organization_id, profile_id);

-- =====================================================
-- 3. DATA INTEGRITY CONSTRAINTS
-- =====================================================

-- Note: Data integrity is enforced through:
-- 1. Foreign key constraints on profile_id, event_type_id, and organization_id
-- 2. RLS policies that scope queries to user's organization
-- 3. Application logic that validates organization_id matches
-- 
-- We cannot use CHECK constraints with subqueries in PostgreSQL.
-- If strict validation is needed, implement a trigger function instead.

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.profiles_event_types ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view assignments in their organization
CREATE POLICY "Users can view profile event type assignments in their organization"
  ON public.profiles_event_types FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Only owners can insert assignments
CREATE POLICY "Owners can create profile event type assignments"
  ON public.profiles_event_types FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT o.id 
      FROM public.organizations o
      WHERE o.owner_id = auth.uid()
    )
  );

-- Policy: Only owners can delete assignments
CREATE POLICY "Owners can delete profile event type assignments"
  ON public.profiles_event_types FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT o.id 
      FROM public.organizations o
      WHERE o.owner_id = auth.uid()
    )
  );

-- =====================================================
-- 5. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.profiles_event_types IS 'Junction table for many-to-many relationship between profiles and event types';
COMMENT ON COLUMN public.profiles_event_types.id IS 'Unique assignment identifier';
COMMENT ON COLUMN public.profiles_event_types.profile_id IS 'Profile who can perform this service';
COMMENT ON COLUMN public.profiles_event_types.event_type_id IS 'Event type (service) the profile is qualified for';
COMMENT ON COLUMN public.profiles_event_types.organization_id IS 'Organization context for multi-tenancy';
COMMENT ON COLUMN public.profiles_event_types.created_at IS 'When the assignment was created';

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

-- Grant usage on the table to authenticated users
GRANT ALL ON public.profiles_event_types TO authenticated;
GRANT ALL ON public.profiles_event_types TO service_role;

-- =====================================================
-- USAGE EXAMPLES (for reference)
-- =====================================================

-- Example 1: Get all event types a profile can perform
-- SELECT et.* 
-- FROM public.event_types et
-- INNER JOIN public.profiles_event_types set ON et.id = set.event_type_id
-- WHERE set.profile_id = 'profile-uuid-here';

-- Example 2: Get all profiles who can perform a specific event type
-- SELECT p.* 
-- FROM public.profiles p
-- INNER JOIN public.profiles_event_types set ON p.id = set.profile_id
-- WHERE set.event_type_id = 'event-type-uuid-here';

-- Example 3: Assign a profile to an event type
-- INSERT INTO public.profiles_event_types (profile_id, event_type_id, organization_id)
-- VALUES ('profile-uuid', 'event-type-uuid', 'org-uuid');

-- Example 4: Remove an assignment
-- DELETE FROM public.profiles_event_types 
-- WHERE profile_id = 'profile-uuid' AND event_type_id = 'event-type-uuid';
