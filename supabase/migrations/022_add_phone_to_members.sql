-- ============================================================================
-- Migration: Add Phone Number to Members
-- Description: Adds phone_number field to members table
-- ============================================================================

-- Add phone_number column to members table
ALTER TABLE public.members
  ADD COLUMN phone_number TEXT;

-- Add column comment
COMMENT ON COLUMN public.members.phone_number IS 'Member phone number for contact purposes';
