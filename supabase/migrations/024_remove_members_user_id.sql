-- =====================================================
-- Remove user_id from members table
-- Members are clients/customers, not auth users
-- Note: organization_id already exists from migration 004
-- =====================================================

-- Drop the old user_id index
DROP INDEX IF EXISTS idx_members_user_id;

-- Remove user_id column
ALTER TABLE public.members
  DROP COLUMN user_id;

-- RLS policies already use organization_id from migration 004
-- No policy updates needed

-- Update comments
COMMENT ON COLUMN public.members.organization_id IS 'Organization that owns this member record';
COMMENT ON TABLE public.members IS 'Client/customer records for wellness center members (not auth users)';
