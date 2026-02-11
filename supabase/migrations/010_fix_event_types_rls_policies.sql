-- =====================================================
-- Fix Event Types RLS Policies
-- Issue: policies were using profiles.id = auth.uid()
-- Fix: should use profiles.user_id = auth.uid()
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view event types in their organization" ON public.event_types;
DROP POLICY IF EXISTS "Users can create event types in their organization" ON public.event_types;
DROP POLICY IF EXISTS "Users can update event types in their organization" ON public.event_types;
DROP POLICY IF EXISTS "Owners can delete event types in their organization" ON public.event_types;

-- Recreate policies with correct user_id reference

-- Policy: Users can view event types in their organization
CREATE POLICY "Users can view event types in their organization"
  ON public.event_types FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can create event types in their organization
CREATE POLICY "Users can create event types in their organization"
  ON public.event_types FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update event types in their organization
CREATE POLICY "Users can update event types in their organization"
  ON public.event_types FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Only owners can delete event types
CREATE POLICY "Owners can delete event types in their organization"
  ON public.event_types FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT o.id 
      FROM public.organizations o
      INNER JOIN public.profiles p ON p.user_id = o.owner_id
      WHERE p.user_id = auth.uid()
    )
  );
