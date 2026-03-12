-- Add trial_ends_at to organizations
-- NULL = grandfathered org (no trial enforcement, full access)
-- Future date = trial active
-- Past date = trial expired (enforce restrictions unless active subscription exists)

ALTER TABLE public.organizations
  ADD COLUMN trial_ends_at timestamptz DEFAULT NULL;
