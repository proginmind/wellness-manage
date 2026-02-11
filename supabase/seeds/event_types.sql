-- =====================================================
-- Event Types Seed Data for Wellness Center
-- =====================================================
-- Note: Replace 'YOUR_ORGANIZATION_ID' with actual organization UUID when seeding
-- Or use the helper function at the bottom to seed for all organizations

-- Insert wellness center event types
INSERT INTO public.event_types (
  organization_id,
  name,
  description,
  color,
  category,
  duration,
  buffer_before,
  buffer_after,
  price,
  currency,
  is_active,
  is_bookable,
  requires_approval,
  max_advance_booking_days,
  min_advance_booking_hours
) VALUES
  -- Massage Services
  (
    'YOUR_ORGANIZATION_ID',
    'Swedish Massage - 60 min',
    'A gentle, relaxing full-body massage using long, flowing strokes to promote relaxation and improve circulation. Perfect for stress relief and overall wellness.',
    '#10b981', -- green
    'massage',
    60,
    10,
    10,
    85.00,
    'USD',
    true,
    true,
    false,
    30,
    24
  ),
  (
    'YOUR_ORGANIZATION_ID',
    'Deep Tissue Massage - 90 min',
    'Intensive therapeutic massage targeting deep muscle layers to relieve chronic tension and pain. Uses firm pressure and slow strokes for maximum benefit.',
    '#059669', -- dark green
    'massage',
    90,
    15,
    10,
    125.00,
    'USD',
    true,
    true,
    false,
    30,
    48
  ),
  
  -- Consultations
  (
    'YOUR_ORGANIZATION_ID',
    'Initial Wellness Consultation',
    'Comprehensive first-time consultation to assess your health goals, lifestyle, and create a personalized wellness plan. Includes health history review and goal setting.',
    '#3b82f6', -- blue
    'consultation',
    45,
    5,
    5,
    75.00,
    'USD',
    true,
    true,
    true,
    60,
    48
  ),
  (
    'YOUR_ORGANIZATION_ID',
    'Follow-up Consultation',
    'Progress check-in to review your wellness journey, adjust your plan, and address any questions or concerns. Includes goal reassessment.',
    '#60a5fa', -- light blue
    'consultation',
    30,
    5,
    5,
    50.00,
    'USD',
    true,
    true,
    false,
    60,
    24
  ),
  
  -- Yoga & Fitness
  (
    'YOUR_ORGANIZATION_ID',
    'Private Yoga Session',
    'One-on-one personalized yoga instruction tailored to your skill level and goals. Includes breathing exercises, poses, and relaxation techniques.',
    '#8b5cf6', -- purple
    'fitness',
    60,
    10,
    5,
    70.00,
    'USD',
    true,
    true,
    false,
    14,
    12
  ),
  
  -- Acupuncture
  (
    'YOUR_ORGANIZATION_ID',
    'Acupuncture Treatment',
    'Traditional Chinese medicine treatment using fine needles to restore energy flow and balance. Effective for pain relief, stress reduction, and overall wellness.',
    '#f59e0b', -- amber
    'therapy',
    60,
    10,
    10,
    95.00,
    'USD',
    true,
    true,
    false,
    21,
    24
  ),
  
  -- Meditation & Mindfulness
  (
    'YOUR_ORGANIZATION_ID',
    'Guided Meditation Session',
    'Learn mindfulness and meditation techniques to reduce stress and improve mental clarity. Suitable for beginners and experienced practitioners.',
    '#ec4899', -- pink
    'mindfulness',
    45,
    5,
    5,
    45.00,
    'USD',
    true,
    true,
    false,
    30,
    12
  ),
  
  -- Nutrition
  (
    'YOUR_ORGANIZATION_ID',
    'Nutritional Counseling',
    'Work with a certified nutritionist to develop a customized meal plan and nutritional strategy aligned with your health goals and dietary needs.',
    '#14b8a6', -- teal
    'consultation',
    60,
    5,
    5,
    90.00,
    'USD',
    true,
    true,
    true,
    30,
    48
  ),
  
  -- Physical Therapy
  (
    'YOUR_ORGANIZATION_ID',
    'Physical Therapy Session',
    'Professional rehabilitation and therapeutic exercises to recover from injury, improve mobility, and prevent future issues. Personalized treatment plan.',
    '#ef4444', -- red
    'therapy',
    60,
    10,
    10,
    110.00,
    'USD',
    true,
    true,
    true,
    45,
    24
  ),
  
  -- Spa Treatment
  (
    'YOUR_ORGANIZATION_ID',
    'Aromatherapy Spa Treatment',
    'Luxurious spa experience combining essential oils, gentle massage, and relaxation techniques. Promotes deep relaxation and skin rejuvenation.',
    '#a855f7', -- violet
    'spa',
    75,
    15,
    15,
    105.00,
    'USD',
    true,
    true,
    false,
    21,
    24
  );

-- =====================================================
-- Helper Function: Seed Event Types for All Organizations
-- =====================================================
-- This function can be called to automatically create default event types
-- for all existing organizations in the database

CREATE OR REPLACE FUNCTION seed_default_event_types_for_organization(org_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.event_types (
    organization_id,
    name,
    description,
    color,
    category,
    duration,
    buffer_before,
    buffer_after,
    price,
    currency,
    is_active,
    is_bookable,
    requires_approval,
    max_advance_booking_days,
    min_advance_booking_hours
  ) VALUES
    -- Massage Services
    (org_id, 'Swedish Massage - 60 min', 'A gentle, relaxing full-body massage using long, flowing strokes to promote relaxation and improve circulation. Perfect for stress relief and overall wellness.', '#10b981', 'massage', 60, 10, 10, 85.00, 'USD', true, true, false, 30, 24),
    (org_id, 'Deep Tissue Massage - 90 min', 'Intensive therapeutic massage targeting deep muscle layers to relieve chronic tension and pain. Uses firm pressure and slow strokes for maximum benefit.', '#059669', 'massage', 90, 15, 10, 125.00, 'USD', true, true, false, 30, 48),
    
    -- Consultations
    (org_id, 'Initial Wellness Consultation', 'Comprehensive first-time consultation to assess your health goals, lifestyle, and create a personalized wellness plan. Includes health history review and goal setting.', '#3b82f6', 'consultation', 45, 5, 5, 75.00, 'USD', true, true, true, 60, 48),
    (org_id, 'Follow-up Consultation', 'Progress check-in to review your wellness journey, adjust your plan, and address any questions or concerns. Includes goal reassessment.', '#60a5fa', 'consultation', 30, 5, 5, 50.00, 'USD', true, true, false, 60, 24),
    
    -- Yoga & Fitness
    (org_id, 'Private Yoga Session', 'One-on-one personalized yoga instruction tailored to your skill level and goals. Includes breathing exercises, poses, and relaxation techniques.', '#8b5cf6', 'fitness', 60, 10, 5, 70.00, 'USD', true, true, false, 14, 12),
    
    -- Acupuncture
    (org_id, 'Acupuncture Treatment', 'Traditional Chinese medicine treatment using fine needles to restore energy flow and balance. Effective for pain relief, stress reduction, and overall wellness.', '#f59e0b', 'therapy', 60, 10, 10, 95.00, 'USD', true, true, false, 21, 24),
    
    -- Meditation & Mindfulness
    (org_id, 'Guided Meditation Session', 'Learn mindfulness and meditation techniques to reduce stress and improve mental clarity. Suitable for beginners and experienced practitioners.', '#ec4899', 'mindfulness', 45, 5, 5, 45.00, 'USD', true, true, false, 30, 12),
    
    -- Nutrition
    (org_id, 'Nutritional Counseling', 'Work with a certified nutritionist to develop a customized meal plan and nutritional strategy aligned with your health goals and dietary needs.', '#14b8a6', 'consultation', 60, 5, 5, 90.00, 'USD', true, true, true, 30, 48),
    
    -- Physical Therapy
    (org_id, 'Physical Therapy Session', 'Professional rehabilitation and therapeutic exercises to recover from injury, improve mobility, and prevent future issues. Personalized treatment plan.', '#ef4444', 'therapy', 60, 10, 10, 110.00, 'USD', true, true, true, 45, 24),
    
    -- Spa Treatment
    (org_id, 'Aromatherapy Spa Treatment', 'Luxurious spa experience combining essential oils, gentle massage, and relaxation techniques. Promotes deep relaxation and skin rejuvenation.', '#a855f7', 'spa', 75, 15, 15, 105.00, 'USD', true, true, false, 21, 24);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Usage Examples
-- =====================================================

-- Example 1: Seed for a specific organization
-- SELECT seed_default_event_types_for_organization('your-org-uuid-here');

-- Example 2: Seed for all existing organizations
-- DO $$
-- DECLARE
--   org_record RECORD;
-- BEGIN
--   FOR org_record IN SELECT id FROM public.organizations LOOP
--     PERFORM seed_default_event_types_for_organization(org_record.id);
--   END LOOP;
-- END $$;

-- Example 3: Seed only for organizations without event types
-- DO $$
-- DECLARE
--   org_record RECORD;
-- BEGIN
--   FOR org_record IN 
--     SELECT o.id 
--     FROM public.organizations o
--     LEFT JOIN public.event_types et ON et.organization_id = o.id
--     WHERE et.id IS NULL
--     GROUP BY o.id
--   LOOP
--     PERFORM seed_default_event_types_for_organization(org_record.id);
--   END LOOP;
-- END $$;

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify the seed data was inserted correctly:
-- SELECT 
--   name, 
--   category, 
--   duration, 
--   price, 
--   is_active, 
--   is_bookable 
-- FROM public.event_types 
-- ORDER BY category, price;
