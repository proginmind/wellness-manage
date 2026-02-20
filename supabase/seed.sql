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
  v_org_id uuid;
  v_owner_profile_id uuid;
  v_staff1_profile_id uuid;
  v_staff2_profile_id uuid;
  v_category_wellness_id uuid;
  v_category_therapy_id uuid;
  v_category_fitness_id uuid;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🌱 Seeding Wellness Management System';
  RAISE NOTICE '========================================';

  -- =====================================================
  -- 1. CREATE OWNER PROFILE (without organization first)
  -- =====================================================

  -- Check if owner profile exists
  SELECT id, organization_id INTO v_owner_profile_id, v_org_id
  FROM public.profiles
  WHERE email = 'owner@example.com' AND role = 'owner'
  LIMIT 1;

  IF v_owner_profile_id IS NULL THEN
    -- Create owner profile without organization_id
    INSERT INTO public.profiles (
      role,
      email,
      first_name,
      last_name,
      description,
      date_of_birth,
      phone_number
    )
    VALUES (
      'owner',
      'owner@example.com',
      'John',
      'Smith',
      'Wellness center owner and manager',
      '1985-06-15',
      '+1234567890'
    )
    RETURNING id INTO v_owner_profile_id;

    RAISE NOTICE '✅ Created owner profile: owner@example.com';
  ELSE
    RAISE NOTICE '📌 Owner profile already exists';
  END IF;

  -- =====================================================
  -- 2. CREATE ORGANIZATION
  -- =====================================================

  -- Check if organization already exists
  IF v_org_id IS NULL THEN
    SELECT id INTO v_org_id
    FROM public.organizations
    WHERE name = 'Wellness Center Demo'
    LIMIT 1;
  END IF;

  IF v_org_id IS NULL THEN
    -- Create organization with owner profile ID
    INSERT INTO public.organizations (name, owner_id)
    VALUES ('Wellness Center Demo', v_owner_profile_id)
    RETURNING id INTO v_org_id;

    -- Update owner profile with organization_id
    UPDATE public.profiles
    SET organization_id = v_org_id
    WHERE id = v_owner_profile_id;

    RAISE NOTICE '✅ Created organization: Wellness Center Demo';
  ELSE
    RAISE NOTICE '📌 Using existing organization: Wellness Center Demo';
  END IF;

  -- =====================================================
  -- 3. CREATE STAFF PROFILES
  -- =====================================================

  -- Delete existing staff profiles for clean slate
  DELETE FROM public.profiles
  WHERE email IN ('staff1@example.com', 'staff2@example.com') AND role = 'staff';

  -- Staff Member 1: Alice Johnson (Massage Therapist)
  INSERT INTO public.profiles (
    organization_id,
    role,
    email,
    first_name,
    last_name,
    description,
    date_of_birth,
    phone_number
  )
  VALUES (
    v_org_id,
    'staff',
    'staff1@example.com',
    'Alice',
    'Johnson',
    'Certified massage therapist with 5 years experience',
    '1992-03-15',
    '+1234567891'
  )
  RETURNING id INTO v_staff1_profile_id;

  -- Staff Member 2: Bob Martinez (Yoga Instructor)
  INSERT INTO public.profiles (
    organization_id,
    role,
    email,
    first_name,
    last_name,
    description,
    date_of_birth,
    phone_number
  )
  VALUES (
    v_org_id,
    'staff',
    'staff2@example.com',
    'Bob',
    'Martinez',
    'Experienced yoga instructor and wellness coach',
    '1988-07-22',
    '+1234567892'
  )
  RETURNING id INTO v_staff2_profile_id;

  RAISE NOTICE '✅ Created 2 staff profiles (Alice Johnson, Bob Martinez)';

  -- =====================================================
  -- 3.1. CREATE STAFF AVAILABILITY
  -- =====================================================

  -- Delete existing staff availability for clean slate
  DELETE FROM public.staff_availability WHERE organization_id = v_org_id;

  -- Insert staff availability for Alice Johnson
  INSERT INTO public.staff_availability (organization_id, profile_id, day_of_week, start_time, end_time)
  VALUES (v_org_id, v_staff1_profile_id, 0, '09:00:00', '17:00:00');

  -- Insert staff availability for Bob Martinez
  INSERT INTO public.staff_availability (organization_id, profile_id, day_of_week, start_time, end_time)
  VALUES (v_org_id, v_staff2_profile_id, 0, '09:00:00', '17:00:00');

  RAISE NOTICE '✅ Created 2 staff availability records';

  -- =====================================================
  -- 4. CREATE EVENT CATEGORIES
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

  RAISE NOTICE '✅ Created 3 event categories';

  -- =====================================================
  -- 5. CREATE EVENT TYPES
  -- =====================================================

  -- Delete existing event types for clean slate
  DELETE FROM public.event_types WHERE organization_id = v_org_id;

  INSERT INTO public.event_types (organization_id, name, description, duration, price, color, category_id)
  VALUES
    (v_org_id, 'Swedish Massage', 'Relaxing full-body massage', 60, 80.00, '#9333EA', v_category_therapy_id),
    (v_org_id, 'Deep Tissue Massage', 'Therapeutic deep tissue work', 90, 120.00, '#7E22CE', v_category_therapy_id),
    (v_org_id, 'Vinyasa Yoga', 'Dynamic flowing yoga practice', 60, 25.00, '#059669', v_category_fitness_id),
    (v_org_id, 'Wellness Consultation', 'Personalized health assessment', 45, 60.00, '#2563EB', v_category_wellness_id);

  RAISE NOTICE '✅ Created 4 event types';

  -- =====================================================
  -- 6. CREATE CLIENT MEMBERS
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

  RAISE NOTICE '✅ Created 10 client members';

  -- =====================================================
  -- 7. SUMMARY
  -- =====================================================

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Seeding Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🏢 Organization: Wellness Center Demo';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Data Created:';
  RAISE NOTICE '   • 1 Owner profile: owner@example.com';
  RAISE NOTICE '   • 2 Staff profiles: staff1@example.com, staff2@example.com';
  RAISE NOTICE '   • 10 Client members';
  RAISE NOTICE '   • 3 Event Categories';
  RAISE NOTICE '   • 4 Event Types';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Next Steps:';
  RAISE NOTICE '   1. Sign up with owner@example.com (any password)';
  RAISE NOTICE '   2. Profile auto-links by email on signup';
  RAISE NOTICE '   3. Staff can sign up with staff1@ or staff2@example.com';
  RAISE NOTICE '   4. Assign services: Team > [Staff] > Edit';
  RAISE NOTICE '   5. Create visits and enjoy!';
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
