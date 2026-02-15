-- =====================================================
-- Wellness Center Member Management System
-- Migration: Update visits to use event_types
-- =====================================================

-- ============================================================================
-- 1. ADD EVENT_TYPE_ID AND SNAPSHOT COLUMNS
-- ============================================================================

-- Add event_type_id column with foreign key to event_types
ALTER TABLE public.visits 
  ADD COLUMN event_type_id UUID REFERENCES public.event_types(id) ON DELETE RESTRICT;

-- Add snapshot columns to preserve event type data at booking time
-- These fields capture the state of the event type when the visit was created
ALTER TABLE public.visits 
  ADD COLUMN event_type_name TEXT,
  ADD COLUMN event_type_duration INTEGER,
  ADD COLUMN event_type_price DECIMAL(10, 2),
  ADD COLUMN event_type_category TEXT;

-- Create index for performance
CREATE INDEX idx_visits_event_type_id ON public.visits(event_type_id);

-- ============================================================================
-- 2. REMOVE OLD COLUMNS
-- ============================================================================

-- Drop the type column (replaced by event_type_id)
ALTER TABLE public.visits 
  DROP COLUMN IF EXISTS type;

-- Drop the duration column (will use event_types.duration)
ALTER TABLE public.visits 
  DROP COLUMN IF EXISTS duration;

-- ============================================================================
-- 3. DATA MIGRATION INSTRUCTIONS
-- ============================================================================

-- IMPORTANT: Before making event_type_id NOT NULL, you must:
--
-- Option A: If you have existing visits:
--   1. Map old 'type' values to event_type IDs
--   2. Run: UPDATE public.visits SET event_type_id = 'MAPPED_EVENT_TYPE_ID' WHERE event_type_id IS NULL;
--
-- Option B: If you want a clean start:
--   1. Run: TRUNCATE public.visits CASCADE;
--   2. Add new visits through the app
--
-- After data migration, uncomment and run the following line:

-- Make columns required (uncomment after data migration)
-- ALTER TABLE public.visits ALTER COLUMN event_type_id SET NOT NULL;
-- ALTER TABLE public.visits ALTER COLUMN event_type_name SET NOT NULL;
-- ALTER TABLE public.visits ALTER COLUMN event_type_duration SET NOT NULL;
-- ALTER TABLE public.visits ALTER COLUMN event_type_price SET NOT NULL;

-- ============================================================================
-- 4. UPDATE COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN public.visits.event_type_id IS 'Reference to the event type (service) for this visit';
COMMENT ON COLUMN public.visits.event_type_name IS 'Snapshot: Event type name at booking time';
COMMENT ON COLUMN public.visits.event_type_duration IS 'Snapshot: Duration in minutes at booking time';
COMMENT ON COLUMN public.visits.event_type_price IS 'Snapshot: Price at booking time';
COMMENT ON COLUMN public.visits.event_type_category IS 'Snapshot: Category at booking time';

-- ============================================================================
-- VERIFICATION QUERIES (commented out, run manually if needed)
-- ============================================================================

-- Check visits without event_type_id
-- SELECT id, member_id, event_type_id, date, time FROM public.visits WHERE event_type_id IS NULL;

-- Check visits with event type details
-- SELECT v.id, v.date, v.time, v.status, et.name as event_type_name, et.duration
-- FROM public.visits v
-- LEFT JOIN public.event_types et ON v.event_type_id = et.id;
