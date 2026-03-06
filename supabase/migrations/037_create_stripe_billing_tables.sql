-- =====================================================
-- Stripe billing integration
-- Adds stripe_customer_id to organizations and subscriptions table
-- for subscription history (multiple rows per org)
-- =====================================================

-- =====================================================
-- 1. Add stripe_customer_id to organizations
-- =====================================================

ALTER TABLE public.organizations
  ADD COLUMN stripe_customer_id text UNIQUE;

COMMENT ON COLUMN public.organizations.stripe_customer_id IS 'Stripe Customer ID for billing; set by webhook on checkout.session.completed';

-- =====================================================
-- 2. Create subscriptions table
-- =====================================================

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  stripe_subscription_id text NOT NULL,
  stripe_price_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'unpaid')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  canceled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.subscriptions IS 'Subscription history - one row per webhook event; current = latest per org';
COMMENT ON COLUMN public.subscriptions.stripe_subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN public.subscriptions.stripe_price_id IS 'Stripe price ID (maps to plan)';

-- Index for efficient "get latest subscription per org" query
CREATE INDEX idx_subscriptions_org_created_desc
  ON public.subscriptions(organization_id, created_at DESC);

-- Auto-update updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. Row Level Security
-- =====================================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Org members can view subscription rows for their organization
CREATE POLICY "Org members can view subscriptions for their org"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (organization_id = public.user_organization_id());

-- No INSERT/UPDATE/DELETE for authenticated - webhooks use service_role
-- (service_role bypasses RLS)

-- =====================================================
-- 4. Permissions
-- =====================================================

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
