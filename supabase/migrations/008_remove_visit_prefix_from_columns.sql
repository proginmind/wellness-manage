-- =====================================================
-- Wellness Center Member Management System
-- Migration: Remove visit_ prefix from visits table columns
-- =====================================================

-- Rename columns to remove visit_ prefix
ALTER TABLE public.visits 
  RENAME COLUMN visit_date TO date;

ALTER TABLE public.visits 
  RENAME COLUMN visit_time TO time;

ALTER TABLE public.visits 
  RENAME COLUMN visit_duration TO duration;

ALTER TABLE public.visits 
  RENAME COLUMN visit_type TO type;

ALTER TABLE public.visits 
  RENAME COLUMN visit_status TO status;

ALTER TABLE public.visits 
  RENAME COLUMN visit_notes TO notes;

-- =====================================================
-- Update CHECK constraint
-- =====================================================

-- Drop old constraint
ALTER TABLE public.visits 
  DROP CONSTRAINT IF EXISTS visits_visit_status_check;

-- Add new constraint with updated column name
ALTER TABLE public.visits 
  ADD CONSTRAINT visits_status_check 
  CHECK (status IN ('pending', 'completed', 'cancelled'));

-- =====================================================
-- Update Indexes
-- =====================================================

-- Drop old indexes
DROP INDEX IF EXISTS idx_visits_status;
DROP INDEX IF EXISTS idx_visits_visit_date;

-- Create new indexes with updated column names
CREATE INDEX idx_visits_status ON public.visits(status);
CREATE INDEX idx_visits_date ON public.visits(date DESC);

-- =====================================================
-- Update Comments for Documentation
-- =====================================================

COMMENT ON COLUMN public.visits.date IS 'Date of the visit';
COMMENT ON COLUMN public.visits.time IS 'Time of the visit';
COMMENT ON COLUMN public.visits.duration IS 'Duration of the visit';
COMMENT ON COLUMN public.visits.type IS 'Type of the visit';
COMMENT ON COLUMN public.visits.status IS 'Status of the visit';
COMMENT ON COLUMN public.visits.notes IS 'Notes about the visit';
