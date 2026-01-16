-- Setup Script: Create Organization and Profile for Current User
-- Run this in Supabase SQL Editor to fix "user profile not found" error

DO $$
DECLARE
  v_user_id uuid;
  v_user_email text;
  v_org_id uuid;
BEGIN
  -- Get the current authenticated user (the one you're logged in as)
  -- If running from SQL Editor, replace this with your actual user ID
  -- You can find it by running: SELECT id, email FROM auth.users;
  
  -- Option 1: Get first user (if you only have one user)
  SELECT id, email INTO v_user_id, v_user_email 
  FROM auth.users 
  ORDER BY created_at 
  LIMIT 1;
  
  -- Option 2: Get specific user by email (uncomment and replace email)
  -- SELECT id, email INTO v_user_id, v_user_email 
  -- FROM auth.users 
  -- WHERE email = 'your-email@example.com';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found. Please sign up first at your app login page.';
  END IF;

  RAISE NOTICE 'Found user: % (ID: %)', v_user_email, v_user_id;

  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = v_user_id) THEN
    RAISE NOTICE 'Profile already exists for this user!';
    
    -- Show existing profile
    RAISE NOTICE 'Existing profile:';
    PERFORM * FROM public.profiles WHERE user_id = v_user_id;
  ELSE
    -- Create organization
    INSERT INTO public.organizations (name, owner_id)
    VALUES ('My Wellness Center', v_user_id)
    RETURNING id INTO v_org_id;

    RAISE NOTICE 'Created organization: % (ID: %)', 'My Wellness Center', v_org_id;

    -- Create profile for owner
    INSERT INTO public.profiles (user_id, organization_id, role)
    VALUES (v_user_id, v_org_id, 'owner');

    RAISE NOTICE '✅ Profile created successfully for: %', v_user_email;
    RAISE NOTICE '✅ You are now the owner of: My Wellness Center';
    
    -- Update any existing members to belong to this organization
    UPDATE public.members 
    SET organization_id = v_org_id
    WHERE organization_id IS NULL;
    
    GET DIAGNOSTICS v_org_id = ROW_COUNT;
    RAISE NOTICE '✅ Updated % existing members to belong to your organization', v_org_id;
  END IF;

END $$;

-- Verification: Show your profile
SELECT 
  u.email as user_email,
  p.role,
  o.name as organization_name,
  o.id as organization_id
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id
JOIN public.organizations o ON p.organization_id = o.id;
