-- =====================================================
-- Wellness Center Member Management System
-- Migration: Seed event categories with sample data
-- =====================================================

-- IMPORTANT: This seed data assumes you have an organization already created
-- Replace 'YOUR_ORGANIZATION_ID' with your actual organization ID or skip this migration

-- Uncomment the following INSERT statements after replacing with your organization ID

/*
INSERT INTO public.event_categories (organization_id, name, description, color, is_active) VALUES
  -- Massage Therapy Category
  (
    'YOUR_ORGANIZATION_ID',
    'Massage Therapy',
    'Various massage techniques for relaxation and therapeutic purposes',
    '#8B5CF6', -- Purple
    true
  ),
  
  -- Consultation Category
  (
    'YOUR_ORGANIZATION_ID',
    'Consultation',
    'Initial consultations and assessment sessions',
    '#3B82F6', -- Blue
    true
  ),
  
  -- Physical Therapy Category
  (
    'YOUR_ORGANIZATION_ID',
    'Physical Therapy',
    'Rehabilitation and physical therapy services',
    '#10B981', -- Green
    true
  ),
  
  -- Acupuncture Category
  (
    'YOUR_ORGANIZATION_ID',
    'Acupuncture',
    'Traditional Chinese medicine acupuncture treatments',
    '#F59E0B', -- Amber
    true
  ),
  
  -- Yoga & Fitness Category
  (
    'YOUR_ORGANIZATION_ID',
    'Yoga & Fitness',
    'Group and private yoga classes, fitness sessions',
    '#EC4899', -- Pink
    true
  ),
  
  -- Spa Treatments Category
  (
    'YOUR_ORGANIZATION_ID',
    'Spa Treatments',
    'Luxury spa services including facials, body treatments, and wraps',
    '#14B8A6', -- Teal
    true
  ),
  
  -- Mental Health Category
  (
    'YOUR_ORGANIZATION_ID',
    'Mental Health',
    'Counseling, therapy, and mental wellness services',
    '#6366F1', -- Indigo
    true
  ),
  
  -- Nutrition & Diet Category
  (
    'YOUR_ORGANIZATION_ID',
    'Nutrition & Diet',
    'Nutritional counseling and dietary planning services',
    '#EF4444', -- Red
    true
  ),
  
  -- Holistic Healing Category
  (
    'YOUR_ORGANIZATION_ID',
    'Holistic Healing',
    'Alternative healing modalities including reiki, aromatherapy, and energy work',
    '#A855F7', -- Purple
    true
  ),
  
  -- Chiropractic Care Category
  (
    'YOUR_ORGANIZATION_ID',
    'Chiropractic Care',
    'Spinal adjustments and chiropractic treatments',
    '#059669', -- Emerald
    true
  );
*/

-- =====================================================
-- NOTES
-- =====================================================

-- To use this seed data:
-- 1. Get your organization ID: SELECT id FROM public.organizations;
-- 2. Replace 'YOUR_ORGANIZATION_ID' with the actual UUID
-- 3. Uncomment the INSERT statement
-- 4. Run the migration

-- Alternatively, create categories through the UI at /event-categories/new
