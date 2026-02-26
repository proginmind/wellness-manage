-- =====================================================
-- Fix staff_availability RLS: scope by user's organization
-- Previously policies used using (true) allowing cross-org access
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can read staff availability" ON public.staff_availability;
DROP POLICY IF EXISTS "Authenticated users can create staff availability" ON public.staff_availability;
DROP POLICY IF EXISTS "Authenticated users can update staff availability" ON public.staff_availability;
DROP POLICY IF EXISTS "Authenticated users can delete staff availability" ON public.staff_availability;

CREATE POLICY "Users can read staff availability in their organization"
  ON public.staff_availability FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create staff availability in their organization"
  ON public.staff_availability FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update staff availability in their organization"
  ON public.staff_availability FOR UPDATE TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete staff availability in their organization"
  ON public.staff_availability FOR DELETE TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );
