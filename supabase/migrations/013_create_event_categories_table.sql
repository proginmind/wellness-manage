-- =====================================================
-- Wellness Center Member Management System
-- Migration: Create event_categories table
-- =====================================================

-- Create event_categories table
CREATE TABLE IF NOT EXISTS public.event_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic Information
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3b82f6', -- hex color for visual identification
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Index on organization_id for multi-tenancy
CREATE INDEX IF NOT EXISTS idx_event_categories_organization_id ON public.event_categories(organization_id);

-- Index on is_active for filtering active categories
CREATE INDEX IF NOT EXISTS idx_event_categories_is_active ON public.event_categories(is_active);

-- Composite index for active categories by organization
CREATE INDEX IF NOT EXISTS idx_event_categories_org_active 
  ON public.event_categories(organization_id, is_active);

-- =====================================================
-- Automatic Timestamp Updates
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_event_categories_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before any update
CREATE TRIGGER update_event_categories_updated_at 
BEFORE UPDATE ON public.event_categories 
FOR EACH ROW 
EXECUTE FUNCTION public.update_event_categories_updated_at_column();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view categories in their organization
CREATE POLICY "Users can view categories in their organization"
  ON public.event_categories FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can create categories in their organization
CREATE POLICY "Users can create categories in their organization"
  ON public.event_categories FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update categories in their organization
CREATE POLICY "Users can update categories in their organization"
  ON public.event_categories FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Only owners can delete categories
CREATE POLICY "Owners can delete categories in their organization"
  ON public.event_categories FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT o.id 
      FROM public.organizations o
      INNER JOIN public.profiles p ON p.user_id = o.owner_id
      WHERE p.user_id = auth.uid()
    )
  );

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE public.event_categories IS 'Event type categories for organizing services (e.g., Massage, Consultation, Therapy)';
COMMENT ON COLUMN public.event_categories.id IS 'Unique category identifier';
COMMENT ON COLUMN public.event_categories.organization_id IS 'Organization this category belongs to';
COMMENT ON COLUMN public.event_categories.name IS 'Name of the category';
COMMENT ON COLUMN public.event_categories.description IS 'Detailed description of the category';
COMMENT ON COLUMN public.event_categories.color IS 'Hex color code for visual identification';
COMMENT ON COLUMN public.event_categories.is_active IS 'Whether the category is currently active';

-- =====================================================
-- Grant Permissions
-- =====================================================

-- Grant usage on the table to authenticated users
GRANT ALL ON public.event_categories TO authenticated;
GRANT ALL ON public.event_categories TO service_role;
