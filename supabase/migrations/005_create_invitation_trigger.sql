-- Migration 005: Invitation Acceptance Trigger
-- This migration creates a trigger to automatically create profiles when users accept invitations

-- ============================================================================
-- 1. FUNCTION TO HANDLE INVITATION ACCEPTANCE
-- ============================================================================

-- This function is called when a user accepts an invitation
-- It creates a profile with 'staff' role and links them to the organization
CREATE OR REPLACE FUNCTION public.handle_invitation_acceptance()
RETURNS trigger AS $$
DECLARE
  v_organization_id uuid;
  v_email text;
BEGIN
  -- Only proceed if status changed to 'accepted'
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    
    -- Get invitation details
    v_organization_id := NEW.organization_id;
    v_email := NEW.email;
    
    -- Find the user with this email
    -- Note: This assumes the user has already signed up with the invited email
    INSERT INTO public.profiles (user_id, organization_id, role)
    SELECT id, v_organization_id, 'staff'::user_role
    FROM auth.users
    WHERE email = v_email
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE user_id = auth.users.id
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. CREATE TRIGGER
-- ============================================================================

CREATE TRIGGER on_invitation_accepted
  AFTER UPDATE ON public.invitations
  FOR EACH ROW
  WHEN (NEW.status = 'accepted' AND OLD.status = 'pending')
  EXECUTE FUNCTION public.handle_invitation_acceptance();

-- ============================================================================
-- 3. FUNCTION TO AUTO-EXPIRE OLD INVITATIONS
-- ============================================================================

-- This function can be called periodically to expire old invitations
CREATE OR REPLACE FUNCTION public.expire_old_invitations()
RETURNS integer AS $$
DECLARE
  expired_count integer;
BEGIN
  UPDATE public.invitations
  SET status = 'expired'
  WHERE status = 'pending'
  AND expires_at < now();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. OPTIONAL: CREATE CRON JOB (requires pg_cron extension)
-- ============================================================================

-- Uncomment the following if you want automatic expiration
-- Note: pg_cron must be enabled in Supabase Dashboard > Database > Extensions

-- SELECT cron.schedule(
--   'expire-old-invitations',
--   '0 * * * *', -- Every hour
--   $$SELECT public.expire_old_invitations();$$
-- );

-- ============================================================================
-- VERIFICATION QUERIES (commented out, run manually if needed)
-- ============================================================================

-- Manually expire old invitations
-- SELECT public.expire_old_invitations();

-- Check invitation status
-- SELECT email, status, expires_at, created_at FROM public.invitations;
