-- =====================================================
-- Wellness Center Member Management System
-- Migration: Create visits table with RLS and indexes
-- =====================================================

-- Create members table
CREATE TABLE IF NOT EXISTS public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  
  -- Visit Information
  visit_date DATE NOT NULL,
  visit_time TIME NOT NULL,
  visit_duration TIME NOT NULL,
  visit_type TEXT NOT NULL,
  visit_status TEXT NOT NULL CHECK (visit_status IN ('pending', 'completed', 'cancelled')),
  visit_notes TEXT,
  
  -- Staff Information
  staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Index on status for filtering active/archived members
CREATE INDEX IF NOT EXISTS idx_visits_status ON public.visits(visit_status);

-- Index on visit_date for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_visits_visit_date ON public.visits(visit_date DESC);

-- Index on member_id for filtering by member (optional, for multi-tenancy)
CREATE INDEX IF NOT EXISTS idx_visits_member_id ON public.visits(member_id);

-- Index on staff_id for filtering by staff (optional, for multi-tenancy)
CREATE INDEX IF NOT EXISTS idx_visits_staff_id ON public.visits(staff_id);

-- =====================================================
-- Automatic Timestamp Updates
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_visits_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before any update
CREATE TRIGGER update_visits_updated_at 
BEFORE UPDATE ON public.visits 
FOR EACH ROW 
EXECUTE FUNCTION public.update_visits_updated_at_column();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all visits
CREATE POLICY "Authenticated users can read visits"
ON public.visits
FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated users can create visits
CREATE POLICY "Authenticated users can create visits"
ON public.visits
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Authenticated users can update visits
CREATE POLICY "Authenticated users can update visits"
ON public.visits
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Authenticated users can delete visits (optional - for future use)
CREATE POLICY "Authenticated users can delete visits"
ON public.visits
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE public.visits IS 'Wellness center visits with personal and membership information';
COMMENT ON COLUMN public.visits.id IS 'Unique visit identifier';
COMMENT ON COLUMN public.visits.member_id IS 'Reference to the member who visited';
COMMENT ON COLUMN public.visits.visit_date IS 'Date of the visit';
COMMENT ON COLUMN public.visits.visit_time IS 'Time of the visit';
COMMENT ON COLUMN public.visits.visit_duration IS 'Duration of the visit';
COMMENT ON COLUMN public.visits.visit_type IS 'Type of the visit';
COMMENT ON COLUMN public.visits.visit_status IS 'Status of the visit';
COMMENT ON COLUMN public.visits.visit_notes IS 'Notes about the visit';
COMMENT ON COLUMN public.visits.staff_id IS 'Reference to the staff who attended the visit';

-- =====================================================
-- Grant Permissions (if needed)
-- =====================================================

-- Grant usage on the table to authenticated users
GRANT ALL ON public.visits TO authenticated;
GRANT ALL ON public.visits TO service_role;
