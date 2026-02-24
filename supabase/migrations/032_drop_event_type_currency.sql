-- =====================================================
-- Remove currency column from event_types
-- Currency is now inherited from the organization
-- =====================================================

ALTER TABLE public.event_types DROP COLUMN currency;
