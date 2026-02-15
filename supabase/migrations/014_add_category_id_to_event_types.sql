-- =====================================================
-- Wellness Center Member Management System
-- Migration: Replace category string with category_id FK
-- =====================================================

-- ============================================================================
-- 1. ADD CATEGORY_ID COLUMN
-- ============================================================================

-- Add category_id column with foreign key to event_categories
ALTER TABLE public.event_types 
  ADD COLUMN category_id UUID REFERENCES public.event_categories(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_event_types_category_id ON public.event_types(category_id);

-- ============================================================================
-- 2. REMOVE OLD CATEGORY COLUMN
-- ============================================================================

-- Drop old category string column
ALTER TABLE public.event_types 
  DROP COLUMN IF EXISTS category;

-- Drop old category index
DROP INDEX IF EXISTS idx_event_types_category;

-- ============================================================================
-- 3. UPDATE COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN public.event_types.category_id IS 'Optional: Reference to event category for organization';
