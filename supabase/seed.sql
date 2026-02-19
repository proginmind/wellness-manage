-- =====================================================
-- Seed Script for Wellness Management System
-- This creates a complete organization with owner, members, and sample data
-- =====================================================
--
-- IMPORTANT: For REMOTE databases, manually create a user via Supabase Dashboard
-- or sign-up first. User auto-creation only works on LOCAL databases.
--
-- For LOCAL: This script will auto-create test users
-- For REMOTE: This script will use existing users only
--
-- =====================================================

DO $$
DECLARE
  v_user_id uuid;
  v_user_email text;
  v_org_id uuid;
  v_owner_profile_id uuid;
  v_category_wellness_id uuid;
  v_category_therapy_id uuid;
  v_category_fitness_id uuid;
  v_event_type_massage_id uuid;
  v_event_type_yoga_id uuid;
  v_test_user_exists boolean;
BEGIN
  -- =====================================================
  -- 1. GET OR CREATE TEST USER FOR LOCAL DEVELOPMENT
  -- =====================================================
  
  -- Check if test user already exists
  SELECT id, email INTO v_user_id, v_user_email
  FROM auth.users
  WHERE email = 'test@example.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    -- No test user exists, try to get any existing user
    SELECT id, email INTO v_user_id, v_user_email 
    FROM auth.users 
    ORDER BY created_at 
    LIMIT 1;
    
    IF v_user_id IS NULL THEN
      -- No users found - exit gracefully
      RAISE NOTICE '⚠️  No users found in database.';
      RAISE NOTICE '📝 Please create a user first:';
      RAISE NOTICE '   - Sign up at your app URL';
      RAISE NOTICE '   - Or use Supabase Dashboard > Authentication > Add User';
      RAISE NOTICE '   Then run this seed script again';
      RETURN;
    ELSE
      RAISE NOTICE '📌 Using existing user: % (ID: %)', v_user_email, v_user_id;
    END IF;
  ELSE
    RAISE NOTICE '📌 Using test user: test@example.com (ID: %)', v_user_id;
  END IF;

  -- =====================================================
  -- 2. CREATE ORGANIZATION (if not exists)
  -- =====================================================
  
  -- Check if organization already exists for this user
  SELECT id INTO v_org_id 
  FROM public.organizations 
  WHERE owner_id = v_user_id
  LIMIT 1;

  IF v_org_id IS NULL THEN
    -- Create organization
    INSERT INTO public.organizations (name, owner_id)
    VALUES ('Wellness Center Demo', v_user_id)
    RETURNING id INTO v_org_id;

    RAISE NOTICE 'Created organization: Wellness Center Demo (ID: %)', v_org_id;
  ELSE
    RAISE NOTICE 'Using existing organization (ID: %)', v_org_id;
  END IF;

  -- =====================================================
  -- 3. CREATE OWNER PROFILE (if not exists)
  -- =====================================================
  
  -- Check if profile exists
  SELECT id INTO v_owner_profile_id
  FROM public.profiles
  WHERE user_id = v_user_id AND organization_id = v_org_id;

  IF v_owner_profile_id IS NULL THEN
    INSERT INTO public.profiles (user_id, organization_id, role, email, first_name, last_name, description, date_of_birth, phone_number)
    VALUES (v_user_id, v_org_id, 'owner', v_user_email, 'Test', 'User', 'Test owner account for local development', '1990-01-01', '+1234567890')
    RETURNING id INTO v_owner_profile_id;

    RAISE NOTICE 'Created owner profile for: %', v_user_email;
  ELSE
    RAISE NOTICE 'Owner profile already exists';
  END IF;

  -- =====================================================
  -- 3.5. STAFF TEST USERS (Use app invitation feature instead)
  -- =====================================================
  -- For remote databases, staff should be added via:
  -- Settings > Team > Invite Staff Member
  RAISE NOTICE 'ℹ️  To add staff: Use Settings > Team > Invite in the app';

  -- =====================================================
  -- 4. CREATE EVENT CATEGORIES (if not exist)
  -- =====================================================
  
  -- Delete existing categories for clean slate
  DELETE FROM public.event_categories WHERE organization_id = v_org_id;
  
  -- Insert categories one by one to get their IDs
  INSERT INTO public.event_categories (organization_id, name, description, color)
  VALUES (v_org_id, 'Massage Therapy', 'Therapeutic massage services', '#9333EA')
  RETURNING id INTO v_category_therapy_id;
  
  INSERT INTO public.event_categories (organization_id, name, description, color)
  VALUES (v_org_id, 'Yoga & Fitness', 'Yoga classes and fitness programs', '#059669')
  RETURNING id INTO v_category_fitness_id;
  
  INSERT INTO public.event_categories (organization_id, name, description, color)
  VALUES (v_org_id, 'Wellness Consultation', 'Health and wellness consultations', '#2563EB')
  RETURNING id INTO v_category_wellness_id;

  RAISE NOTICE 'Created 3 event categories';

  -- =====================================================
  -- 5. CREATE EVENT TYPES (if not exist)
  -- =====================================================
  
  -- Delete existing event types for clean slate
  DELETE FROM public.event_types WHERE organization_id = v_org_id;

  INSERT INTO public.event_types (organization_id, name, description, duration, price, color, category_id)
  VALUES 
    (v_org_id, 'Swedish Massage', 'Relaxing full-body massage', 60, 80.00, '#9333EA', v_category_therapy_id),
    (v_org_id, 'Deep Tissue Massage', 'Therapeutic deep tissue work', 90, 120.00, '#7E22CE', v_category_therapy_id),
    (v_org_id, 'Vinyasa Yoga', 'Dynamic flowing yoga practice', 60, 25.00, '#059669', v_category_fitness_id),
    (v_org_id, 'Wellness Consultation', 'Personalized health assessment', 45, 60.00, '#2563EB', v_category_wellness_id);

  RAISE NOTICE 'Created event types';

  -- =====================================================
  -- 6. INSERT MEMBERS (if not exist)
  -- =====================================================
  
  -- Delete existing members for clean slate
  DELETE FROM public.members WHERE organization_id = v_org_id;

  INSERT INTO public.members (
    organization_id, 
    first_name, 
    last_name, 
    email, 
    date_of_birth, 
    date_joined, 
    status
  )
  VALUES
    (v_org_id, 'Emma', 'Johnson', 'emma.johnson@example.com', '1992-05-20', '2024-01-15', 'active'),
    (v_org_id, 'Liam', 'Smith', 'liam.smith@example.com', '1988-11-03', '2024-02-20', 'active'),
    (v_org_id, 'Olivia', 'Brown', 'olivia.brown@example.com', '1995-03-14', '2024-03-10', 'active'),
    (v_org_id, 'Noah', 'Davis', 'noah.davis@example.com', '1990-07-22', '2024-04-05', 'active'),
    (v_org_id, 'Ava', 'Martinez', 'ava.martinez@example.com', '1993-09-18', '2024-05-12', 'active'),
    (v_org_id, 'Ethan', 'Garcia', 'ethan.garcia@example.com', '1987-01-30', '2024-06-08', 'active'),
    (v_org_id, 'Sophia', 'Wilson', 'sophia.wilson@example.com', '1996-12-05', '2024-07-22', 'active'),
    (v_org_id, 'Mason', 'Anderson', 'mason.anderson@example.com', '1991-04-17', '2024-08-14', 'active'),
    (v_org_id, 'Isabella', 'Taylor', 'isabella.taylor@example.com', '1994-08-25', '2024-11-03', 'active'),
    (v_org_id, 'James', 'Thomas', 'james.thomas@example.com', '1989-06-12', '2025-01-08', 'active');

  RAISE NOTICE 'Created 10 members';

  -- =====================================================
  -- 7. STAFF EVENT TYPE ASSIGNMENTS (Skipped - no staff in seed)
  -- =====================================================
  -- Staff members and their service assignments should be managed via the app
  RAISE NOTICE 'ℹ️  To assign services to staff: Edit team member in app';

  -- =====================================================
  -- 8. SUMMARY
  -- =====================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Seed completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🏢 Organization: Wellness Center Demo';
  RAISE NOTICE '';
  RAISE NOTICE '👤 Owner: %', v_user_email;
  RAISE NOTICE '';
  RAISE NOTICE '📊 Data Created:';
  RAISE NOTICE '   • 10 Client Members';
  RAISE NOTICE '   • 3 Event Categories (Massage, Yoga, Wellness)';
  RAISE NOTICE '   • 4 Event Types/Services';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Next Steps:';
  RAISE NOTICE '   1. Add staff: Settings > Team > Invite Staff Member';
  RAISE NOTICE '   2. Assign services: Team > [Member] > Edit';
  RAISE NOTICE '   3. Create visits: Visits > Add New Visit';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Show organizations
SELECT 'Organizations:' as info;
SELECT id, name, owner_id FROM public.organizations;

-- Show profiles
SELECT 'Profiles:' as info;
SELECT p.id, p.email, p.role, o.name as organization
FROM public.profiles p
JOIN public.organizations o ON p.organization_id = o.id;

-- Show members
SELECT 'Members:' as info;
SELECT first_name, last_name, email, date_joined, status
FROM public.members
ORDER BY date_joined;

-- Show event categories
SELECT 'Event Categories:' as info;
SELECT name, description, color, is_active
FROM public.event_categories
ORDER BY name;

-- Show event types
SELECT 'Event Types:' as info;
SELECT et.name, et.duration, et.price, ec.name as category
FROM public.event_types et
LEFT JOIN public.event_categories ec ON et.category_id = ec.id
ORDER BY et.name;
