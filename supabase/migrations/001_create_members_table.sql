-- =====================================================
-- Wellness Center Member Management System
-- Migration: Create members table with RLS and indexes
-- =====================================================

-- Create members table
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  image TEXT,
  date_of_birth DATE NOT NULL,
  
  -- Membership Information
  date_joined DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  archived_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Index on status for filtering active/archived members
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);

-- Index on email for quick lookups
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);

-- Index on date_joined for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_members_date_joined ON public.members(date_joined DESC);

-- Index on user_id for filtering by authenticated user (optional, for multi-tenancy)
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);

-- Full-text search index for name and email
CREATE INDEX IF NOT EXISTS idx_members_search ON public.members 
USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || email));

-- =====================================================
-- Automatic Timestamp Updates
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before any update
CREATE TRIGGER update_members_updated_at 
BEFORE UPDATE ON public.members 
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all members
CREATE POLICY "Authenticated users can read members"
ON public.members
FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated users can create members
CREATE POLICY "Authenticated users can create members"
ON public.members
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Authenticated users can update members
CREATE POLICY "Authenticated users can update members"
ON public.members
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Authenticated users can delete members (optional - for future use)
CREATE POLICY "Authenticated users can delete members"
ON public.members
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE public.members IS 'Wellness center members with personal and membership information';
COMMENT ON COLUMN public.members.id IS 'Unique member identifier';
COMMENT ON COLUMN public.members.user_id IS 'Reference to the authenticated user who created this member';
COMMENT ON COLUMN public.members.status IS 'Member status: active or archived';
COMMENT ON COLUMN public.members.archived_at IS 'Timestamp when member was archived (null if active)';
COMMENT ON COLUMN public.members.image IS 'URL or path to member profile image';

-- =====================================================
-- Grant Permissions (if needed)
-- =====================================================

-- Grant usage on the table to authenticated users
GRANT ALL ON public.members TO authenticated;
GRANT ALL ON public.members TO service_role;
