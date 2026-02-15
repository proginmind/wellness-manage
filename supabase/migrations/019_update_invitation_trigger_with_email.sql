-- =====================================================
-- Update invitation acceptance trigger to include email
-- =====================================================

-- Replace the invitation acceptance function to include email in profile creation
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
    
    -- Create profile with email included
    INSERT INTO public.profiles (user_id, organization_id, role, email)
    SELECT id, v_organization_id, 'staff'::user_role, email
    FROM auth.users
    WHERE email = v_email
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.users.id 
        AND organization_id = v_organization_id
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Trigger on_invitation_accepted already exists from migration 005
-- This just updates the function logic
