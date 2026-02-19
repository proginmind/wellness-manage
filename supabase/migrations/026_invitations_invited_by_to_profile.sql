-- =====================================================
-- Change invitations.invited_by to reference profiles instead of auth.users
-- This makes the data model more consistent
-- =====================================================

-- Drop existing constraint
ALTER TABLE public.invitations
  DROP CONSTRAINT IF EXISTS invitations_invited_by_fkey;

-- Make invited_by nullable temporarily (to handle existing data)
ALTER TABLE public.invitations
  ALTER COLUMN invited_by DROP NOT NULL;

-- For existing invitations, update invited_by to point to the profile
UPDATE public.invitations i
SET invited_by = p.id
FROM public.profiles p
WHERE p.user_id = i.invited_by;

-- Change invited_by to reference profiles
ALTER TABLE public.invitations
  ADD CONSTRAINT invitations_invited_by_fkey 
  FOREIGN KEY (invited_by) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Make invited_by required again
ALTER TABLE public.invitations
  ALTER COLUMN invited_by SET NOT NULL;

-- Update comment
COMMENT ON COLUMN public.invitations.invited_by IS 'Profile ID of the user who sent the invitation';
