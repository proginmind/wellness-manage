-- Seed script with organization structure
-- This script creates a complete organization with owner, staff, and members

-- STEP 1: Find your user ID (the person who will be the owner)
-- Run this first to get your user_id:
-- SELECT id, email FROM auth.users LIMIT 1;

-- STEP 2: Create an organization
-- Replace 'YOUR_USER_ID' with the actual user ID from step 1
DO $$
DECLARE
  v_user_id uuid;
  v_org_id uuid;
  v_staff_user_id uuid;
BEGIN
  -- Get the first user from auth (will be the owner)
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please create a user account first.';
  END IF;

  -- Create organization
  INSERT INTO public.organizations (name, owner_id)
  VALUES ('Wellness Center', v_user_id)
  RETURNING id INTO v_org_id;

  RAISE NOTICE 'Created organization: %', v_org_id;

  -- Create profile for owner
  INSERT INTO public.profiles (user_id, organization_id, role)
  VALUES (v_user_id, v_org_id, 'owner');

  RAISE NOTICE 'Created owner profile for user: %', v_user_id;

  -- Insert 10 fake members tied to this organization
  INSERT INTO public.members (
    user_id, 
    organization_id, 
    first_name, 
    last_name, 
    email, 
    date_of_birth, 
    date_joined, 
    status
  )
  VALUES
    (v_user_id, v_org_id, 'Emma', 'Johnson', 'emma.johnson@example.com', '1992-05-20', '2024-01-15', 'active'),
    (v_user_id, v_org_id, 'Liam', 'Smith', 'liam.smith@example.com', '1988-11-03', '2024-02-20', 'active'),
    (v_user_id, v_org_id, 'Olivia', 'Brown', 'olivia.brown@example.com', '1995-03-14', '2024-03-10', 'active'),
    (v_user_id, v_org_id, 'Noah', 'Davis', 'noah.davis@example.com', '1990-07-22', '2024-04-05', 'active'),
    (v_user_id, v_org_id, 'Ava', 'Martinez', 'ava.martinez@example.com', '1993-09-18', '2024-05-12', 'active'),
    (v_user_id, v_org_id, 'Ethan', 'Garcia', 'ethan.garcia@example.com', '1987-01-30', '2024-06-08', 'active'),
    (v_user_id, v_org_id, 'Sophia', 'Wilson', 'sophia.wilson@example.com', '1996-12-05', '2024-07-22', 'active'),
    (v_user_id, v_org_id, 'Mason', 'Anderson', 'mason.anderson@example.com', '1991-04-17', '2024-08-14', 'active'),
    (v_user_id, v_org_id, 'Isabella', 'Taylor', 'isabella.taylor@example.com', '1994-08-25', '2024-11-03', 'active'),
    (v_user_id, v_org_id, 'James', 'Thomas', 'james.thomas@example.com', '1989-06-12', '2025-01-08', 'active');

  RAISE NOTICE 'Created 10 members for organization: %', v_org_id;

  -- Optional: Create a sample invitation
  INSERT INTO public.invitations (organization_id, email, invited_by)
  VALUES (v_org_id, 'staff@example.com', v_user_id);

  RAISE NOTICE 'Created sample invitation for: staff@example.com';

END $$;

-- Verification queries
SELECT 'Organizations:' as info;
SELECT id, name, owner_id FROM public.organizations;

SELECT 'Profiles:' as info;
SELECT p.id, p.role, u.email, o.name as organization
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id
JOIN public.organizations o ON p.organization_id = o.id;

SELECT 'Members:' as info;
SELECT first_name, last_name, email, date_joined, status, organization_id
FROM public.members
ORDER BY date_joined DESC;

SELECT 'Invitations:' as info;
SELECT email, status, expires_at FROM public.invitations;
