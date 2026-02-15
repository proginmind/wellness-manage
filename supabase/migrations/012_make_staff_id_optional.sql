-- =====================================================
-- Wellness Center Member Management System
-- Migration: Make staff_id optional in visits table
-- =====================================================

-- ============================================================================
-- 1. MAKE STAFF_ID NULLABLE
-- ============================================================================

-- Allow staff_id to be NULL (optional field)
ALTER TABLE public.visits 
  ALTER COLUMN staff_id DROP NOT NULL;

-- ============================================================================
-- 2. UPDATE COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN public.visits.staff_id IS 'Optional: Reference to the staff member performing the service';
