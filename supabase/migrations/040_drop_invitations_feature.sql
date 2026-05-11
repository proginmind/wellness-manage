-- Drop staff-invitation storage and automation (feature removed from application).
-- CASCADE removes triggers and policies on public.invitations.

DROP TABLE IF EXISTS public.invitations CASCADE;

DROP FUNCTION IF EXISTS public.handle_invitation_acceptance();

DROP FUNCTION IF EXISTS public.expire_old_invitations();

DROP TYPE IF EXISTS public.invitation_status;
