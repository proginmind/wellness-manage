-- =====================================================
-- Stripe webhook idempotency
-- Stores processed Stripe event IDs to prevent duplicate handling on retries.
-- =====================================================

CREATE TABLE public.stripe_processed_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.stripe_processed_events IS 'Tracks processed Stripe event IDs for webhook idempotency.';

-- RLS: no authenticated access; webhooks use service_role which bypasses RLS
ALTER TABLE public.stripe_processed_events ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.stripe_processed_events TO service_role;
