-- =====================================================
-- Add visit overlap constraint
-- Prevents staff from having overlapping visits
-- =====================================================

-- ============================================================================
-- 1. CREATE OVERLAP CHECK FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION check_staff_visit_overlap()
RETURNS TRIGGER AS $$
DECLARE
  new_end_time TIME;
BEGIN
  -- Skip check if no staff assigned or visit is cancelled
  IF NEW.staff_id IS NULL OR NEW.status = 'cancelled' THEN
    RETURN NEW;
  END IF;

  -- Calculate end time for the new visit
  new_end_time := NEW.time + (COALESCE(NEW.event_type_duration, 0) || ' minutes')::interval;

  -- Check for overlapping visits
  IF EXISTS (
    SELECT 1 FROM public.visits
    WHERE staff_id = NEW.staff_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND date = NEW.date
      AND status != 'cancelled'
      AND (
        (time, time + (COALESCE(event_type_duration, 0) || ' minutes')::interval)
        OVERLAPS
        (NEW.time, new_end_time)
      )
  ) THEN
    RAISE EXCEPTION 'Staff member already has a visit scheduled during this time';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. CREATE TRIGGER
-- ============================================================================

CREATE TRIGGER prevent_staff_visit_overlap
  BEFORE INSERT OR UPDATE ON public.visits
  FOR EACH ROW
  EXECUTE FUNCTION check_staff_visit_overlap();

-- ============================================================================
-- 3. DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION check_staff_visit_overlap() IS 'Prevents overlapping visits for the same staff member. Skips check for cancelled visits or visits without staff assigned.';
