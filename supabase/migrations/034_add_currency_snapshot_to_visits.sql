-- =====================================================
-- Add event_type_currency snapshot column to visits
-- Captures the org's active currency at booking time
-- =====================================================

ALTER TABLE public.visits
  ADD COLUMN event_type_currency text;

COMMENT ON COLUMN public.visits.event_type_currency IS 'Snapshot: org currency code (ISO 4217) at booking time';
