-- =====================================================
-- Wellness Center Member Management System
-- Migration: Create event_types table with RLS and indexes
-- =====================================================

-- Create event_types table
CREATE TABLE IF NOT EXISTS public.event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic Information
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6', -- hex color for calendar display
  category TEXT, -- e.g., 'massage', 'consultation', 'therapy'
  
  -- Scheduling Configuration
  duration INTEGER NOT NULL, -- in minutes
  buffer_before INTEGER DEFAULT 0, -- prep time in minutes
  buffer_after INTEGER DEFAULT 0, -- cleanup time in minutes
  
  -- Pricing
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Availability Settings
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_bookable BOOLEAN NOT NULL DEFAULT true, -- can customers book online
  requires_approval BOOLEAN NOT NULL DEFAULT false, -- manual approval needed
  
  -- Booking Limits
  max_advance_booking_days INTEGER, -- how far in advance bookings allowed
  min_advance_booking_hours INTEGER DEFAULT 24, -- minimum notice required
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Index on organization_id for multi-tenancy
CREATE INDEX IF NOT EXISTS idx_event_types_organization_id ON public.event_types(organization_id);

-- Index on is_active for filtering active event types
CREATE INDEX IF NOT EXISTS idx_event_types_is_active ON public.event_types(is_active);

-- Index on is_bookable for filtering bookable event types
CREATE INDEX IF NOT EXISTS idx_event_types_is_bookable ON public.event_types(is_bookable);

-- Index on category for filtering by service category
CREATE INDEX IF NOT EXISTS idx_event_types_category ON public.event_types(category);

-- Composite index for active, bookable event types by organization
CREATE INDEX IF NOT EXISTS idx_event_types_active_bookable 
  ON public.event_types(organization_id, is_active, is_bookable);

-- =====================================================
-- Automatic Timestamp Updates
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_event_types_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before any update
CREATE TRIGGER update_event_types_updated_at 
BEFORE UPDATE ON public.event_types 
FOR EACH ROW 
EXECUTE FUNCTION public.update_event_types_updated_at_column();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view event types in their organization
CREATE POLICY "Users can view event types in their organization"
  ON public.event_types FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Policy: Users can create event types in their organization
CREATE POLICY "Users can create event types in their organization"
  ON public.event_types FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Policy: Users can update event types in their organization
CREATE POLICY "Users can update event types in their organization"
  ON public.event_types FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Policy: Only owners can delete event types
CREATE POLICY "Owners can delete event types in their organization"
  ON public.event_types FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT o.id 
      FROM public.organizations o
      INNER JOIN public.profiles p ON p.user_id = o.owner_id
      WHERE p.id = auth.uid()
    )
  );

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE public.event_types IS 'Event types/service templates for bookings (similar to Calendly event types)';
COMMENT ON COLUMN public.event_types.id IS 'Unique event type identifier';
COMMENT ON COLUMN public.event_types.organization_id IS 'Organization this event type belongs to';
COMMENT ON COLUMN public.event_types.name IS 'Name of the service/event type';
COMMENT ON COLUMN public.event_types.description IS 'Detailed description of the service';
COMMENT ON COLUMN public.event_types.color IS 'Hex color code for calendar display';
COMMENT ON COLUMN public.event_types.category IS 'Service category (e.g., massage, consultation)';
COMMENT ON COLUMN public.event_types.duration IS 'Service duration in minutes';
COMMENT ON COLUMN public.event_types.buffer_before IS 'Preparation time before service in minutes';
COMMENT ON COLUMN public.event_types.buffer_after IS 'Cleanup time after service in minutes';
COMMENT ON COLUMN public.event_types.price IS 'Service price';
COMMENT ON COLUMN public.event_types.currency IS 'Currency code (USD, EUR, etc.)';
COMMENT ON COLUMN public.event_types.is_active IS 'Whether the event type is currently active';
COMMENT ON COLUMN public.event_types.is_bookable IS 'Whether customers can book this online';
COMMENT ON COLUMN public.event_types.requires_approval IS 'Whether bookings need manual approval';
COMMENT ON COLUMN public.event_types.max_advance_booking_days IS 'Maximum days in advance bookings can be made';
COMMENT ON COLUMN public.event_types.min_advance_booking_hours IS 'Minimum hours notice required for booking';

-- =====================================================
-- Grant Permissions
-- =====================================================

-- Grant usage on the table to authenticated users
GRANT ALL ON public.event_types TO authenticated;
GRANT ALL ON public.event_types TO service_role;
