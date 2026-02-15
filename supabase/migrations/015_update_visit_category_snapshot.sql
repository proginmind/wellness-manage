-- =====================================================
-- Wellness Center Member Management System
-- Migration: Update visit category snapshot fields
-- =====================================================

-- ============================================================================
-- 1. RENAME AND ADD CATEGORY SNAPSHOT FIELDS
-- ============================================================================

-- Rename event_type_category to event_type_category_name for clarity
ALTER TABLE public.visits 
  RENAME COLUMN event_type_category TO event_type_category_name;

-- Add category color snapshot for UI display
ALTER TABLE public.visits 
  ADD COLUMN event_type_category_color TEXT;

-- ============================================================================
-- 2. UPDATE COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN public.visits.event_type_category_name IS 'Snapshot: Category name at booking time';
COMMENT ON COLUMN public.visits.event_type_category_color IS 'Snapshot: Category color at booking time';
