-- =====================================================
-- Add currency column to organizations
-- Represents the default display/billing currency for the org
-- =====================================================

ALTER TABLE public.organizations
  ADD COLUMN currency text NOT NULL DEFAULT 'USD';

COMMENT ON COLUMN public.organizations.currency IS 'Default display/billing currency for the organization (ISO 4217 code)';
