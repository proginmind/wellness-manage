-- =====================================================
-- Add organization_contact table
-- Stores contact info (phone, email, address, social links)
-- for an organization as a 1:1 relationship using JSONB
-- for flexible nested fields.
-- =====================================================

CREATE TABLE public.organization_contact (
  organization_id uuid PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  phone           text,
  email           text,
  address         jsonb,
  social_links    jsonb,
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL,

  CONSTRAINT valid_email CHECK (
    email IS NULL OR email = '' OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  )
);

COMMENT ON TABLE public.organization_contact IS 'Contact information for an organization (1:1 with organizations)';
COMMENT ON COLUMN public.organization_contact.address IS 'Structured address: { line1, line2, city, state, postalCode, country }';
COMMENT ON COLUMN public.organization_contact.social_links IS 'Social/web links: { website, instagram, facebook, twitter, linkedin }';

-- Index for FK lookup
CREATE INDEX idx_organization_contact_organization_id ON public.organization_contact(organization_id);

-- Auto-update updated_at
CREATE TRIGGER update_organization_contact_updated_at
  BEFORE UPDATE ON public.organization_contact
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.organization_contact ENABLE ROW LEVEL SECURITY;

-- All org members can view their organization's contact info
CREATE POLICY "Org members can view organization contact"
  ON public.organization_contact FOR SELECT
  TO authenticated
  USING (organization_id = public.user_organization_id());

-- Only owners can insert contact info
CREATE POLICY "Owners can insert organization contact"
  ON public.organization_contact FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_owner(auth.uid())
    AND organization_id = public.user_organization_id()
  );

-- Only owners can update contact info
CREATE POLICY "Owners can update organization contact"
  ON public.organization_contact FOR UPDATE
  TO authenticated
  USING (
    public.is_owner(auth.uid())
    AND organization_id = public.user_organization_id()
  );

-- =====================================================
-- PERMISSIONS
-- =====================================================

GRANT ALL ON public.organization_contact TO authenticated;
GRANT ALL ON public.organization_contact TO service_role;
