-- =====================================================
-- Performance Advisor fixes (splinter)
-- 1. Auth RLS Initialization Plan — wrap auth.uid() in (SELECT ...)
-- 2. Unused indexes — drop non-constraint indexes with zero scans on prod
-- =====================================================

-- ============================================================================
-- 1. HELPER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.user_organization_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id
  FROM public.profiles
  WHERE user_id = (SELECT auth.uid())
  LIMIT 1;
$$;

-- ============================================================================
-- 2. RLS POLICIES — profiles
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- 3. RLS POLICIES — members
-- ============================================================================

DROP POLICY IF EXISTS "Owners can delete members in their organization" ON public.members;

CREATE POLICY "Owners can delete members in their organization"
  ON public.members FOR DELETE
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
    AND public.is_owner((SELECT auth.uid()))
  );

-- ============================================================================
-- 4. RLS POLICIES — visits
-- ============================================================================

DROP POLICY IF EXISTS "Owners can delete visits in their organization" ON public.visits;

CREATE POLICY "Owners can delete visits in their organization"
  ON public.visits FOR DELETE
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
    AND public.is_owner((SELECT auth.uid()))
  );

-- ============================================================================
-- 5. RLS POLICIES — organization_contact
-- ============================================================================

DROP POLICY IF EXISTS "Owners can insert organization contact" ON public.organization_contact;
DROP POLICY IF EXISTS "Owners can update organization contact" ON public.organization_contact;

CREATE POLICY "Owners can insert organization contact"
  ON public.organization_contact FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_owner((SELECT auth.uid()))
    AND organization_id = public.user_organization_id()
  );

CREATE POLICY "Owners can update organization contact"
  ON public.organization_contact FOR UPDATE
  TO authenticated
  USING (
    public.is_owner((SELECT auth.uid()))
    AND organization_id = public.user_organization_id()
  );

-- ============================================================================
-- 6. RLS POLICIES — event_types
-- ============================================================================

DROP POLICY IF EXISTS "Users can view event types in their organization" ON public.event_types;
DROP POLICY IF EXISTS "Users can create event types in their organization" ON public.event_types;
DROP POLICY IF EXISTS "Users can update event types in their organization" ON public.event_types;
DROP POLICY IF EXISTS "Owners can delete event types in their organization" ON public.event_types;

CREATE POLICY "Users can view event types in their organization"
  ON public.event_types FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can create event types in their organization"
  ON public.event_types FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update event types in their organization"
  ON public.event_types FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Owners can delete event types in their organization"
  ON public.event_types FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT o.id
      FROM public.organizations o
      JOIN public.profiles p ON o.owner_id = p.id
      WHERE p.user_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- 7. RLS POLICIES — event_categories
-- ============================================================================

DROP POLICY IF EXISTS "Users can view categories in their organization" ON public.event_categories;
DROP POLICY IF EXISTS "Users can create categories in their organization" ON public.event_categories;
DROP POLICY IF EXISTS "Users can update categories in their organization" ON public.event_categories;
DROP POLICY IF EXISTS "Owners can delete categories in their organization" ON public.event_categories;

CREATE POLICY "Users can view categories in their organization"
  ON public.event_categories FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can create categories in their organization"
  ON public.event_categories FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update categories in their organization"
  ON public.event_categories FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Owners can delete categories in their organization"
  ON public.event_categories FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT o.id
      FROM public.organizations o
      JOIN public.profiles p ON o.owner_id = p.id
      WHERE p.user_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- 8. RLS POLICIES — profiles_event_types
-- ============================================================================

DROP POLICY IF EXISTS "Owners can create profile event type assignments" ON public.profiles_event_types;
DROP POLICY IF EXISTS "Users can view profile event type assignments in their organization" ON public.profiles_event_types;
DROP POLICY IF EXISTS "Owners can manage profile event type assignments" ON public.profiles_event_types;
DROP POLICY IF EXISTS "Staff can view their assigned event types" ON public.profiles_event_types;

CREATE POLICY "Users can view profile event type assignments in their organization"
  ON public.profiles_event_types FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Owners can manage profile event type assignments"
  ON public.profiles_event_types
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT o.id
      FROM public.organizations o
      JOIN public.profiles p ON o.owner_id = p.id
      WHERE p.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT o.id
      FROM public.organizations o
      JOIN public.profiles p ON o.owner_id = p.id
      WHERE p.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Staff can view their assigned event types"
  ON public.profiles_event_types FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- 9. RLS POLICIES — staff_availability
-- ============================================================================

DROP POLICY IF EXISTS "Users can read staff availability in their organization" ON public.staff_availability;
DROP POLICY IF EXISTS "Users can create staff availability in their organization" ON public.staff_availability;
DROP POLICY IF EXISTS "Users can update staff availability in their organization" ON public.staff_availability;
DROP POLICY IF EXISTS "Users can delete staff availability in their organization" ON public.staff_availability;

CREATE POLICY "Users can read staff availability in their organization"
  ON public.staff_availability FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can create staff availability in their organization"
  ON public.staff_availability FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update staff availability in their organization"
  ON public.staff_availability FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can delete staff availability in their organization"
  ON public.staff_availability FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- 10. DROP UNUSED INDEXES (zero scans on prod; unique constraints kept)
-- ============================================================================

DROP INDEX IF EXISTS public.idx_event_categories_is_active;
DROP INDEX IF EXISTS public.idx_event_categories_org_active;
DROP INDEX IF EXISTS public.idx_event_categories_organization_id;

DROP INDEX IF EXISTS public.idx_event_types_category_id;
DROP INDEX IF EXISTS public.idx_event_types_is_active;
DROP INDEX IF EXISTS public.idx_event_types_is_bookable;
DROP INDEX IF EXISTS public.idx_event_types_organization_id;

DROP INDEX IF EXISTS public.idx_members_date_joined;
DROP INDEX IF EXISTS public.idx_members_email;
DROP INDEX IF EXISTS public.idx_members_search;
DROP INDEX IF EXISTS public.idx_members_status;

DROP INDEX IF EXISTS public.idx_notification_logs_org_template_status;
DROP INDEX IF EXISTS public.idx_notification_logs_organization_id;

DROP INDEX IF EXISTS public.idx_organizations_owner_id;

DROP INDEX IF EXISTS public.idx_profiles_email;
DROP INDEX IF EXISTS public.idx_profiles_first_name;
DROP INDEX IF EXISTS public.idx_profiles_full_name;
DROP INDEX IF EXISTS public.idx_profiles_last_name;
DROP INDEX IF EXISTS public.idx_profiles_organization_id;
DROP INDEX IF EXISTS public.idx_profiles_role;
DROP INDEX IF EXISTS public.idx_profiles_user_id;

DROP INDEX IF EXISTS public.idx_profiles_event_types_organization_id;
DROP INDEX IF EXISTS public.idx_profiles_event_types_profile_id;

DROP INDEX IF EXISTS public.idx_visits_event_type_id;
DROP INDEX IF EXISTS public.idx_visits_staff_id;
