# Database Seed Data

This directory contains SQL files for seeding the database with sample data.

## Event Types Seed Data

The `event_types.sql` file contains 10 wellness center service types that can be used for testing and as templates for new organizations.

### Included Event Types

1. **Swedish Massage - 60 min** ($85)
   - Category: massage
   - Duration: 60 min
   - Relaxing full-body massage

2. **Deep Tissue Massage - 90 min** ($125)
   - Category: massage
   - Duration: 90 min
   - Intensive therapeutic massage

3. **Initial Wellness Consultation** ($75)
   - Category: consultation
   - Duration: 45 min
   - Requires approval

4. **Follow-up Consultation** ($50)
   - Category: consultation
   - Duration: 30 min

5. **Private Yoga Session** ($70)
   - Category: fitness
   - Duration: 60 min

6. **Acupuncture Treatment** ($95)
   - Category: therapy
   - Duration: 60 min

7. **Guided Meditation Session** ($45)
   - Category: mindfulness
   - Duration: 45 min

8. **Nutritional Counseling** ($90)
   - Category: consultation
   - Duration: 60 min
   - Requires approval

9. **Physical Therapy Session** ($110)
   - Category: therapy
   - Duration: 60 min
   - Requires approval

10. **Aromatherapy Spa Treatment** ($105)
    - Category: spa
    - Duration: 75 min

## How to Use

### Option 1: Manual Seeding for Specific Organization

Replace `YOUR_ORGANIZATION_ID` in the SQL file with your actual organization UUID, then run:

```sql
-- Run the INSERT statements from event_types.sql
```

### Option 2: Use Helper Function for Single Organization

```sql
-- Seed default event types for a specific organization
SELECT seed_default_event_types_for_organization('your-org-uuid-here');
```

### Option 3: Seed All Organizations

```sql
-- Seed event types for all existing organizations
DO $$
DECLARE
  org_record RECORD;
BEGIN
  FOR org_record IN SELECT id FROM public.organizations LOOP
    PERFORM seed_default_event_types_for_organization(org_record.id);
  END LOOP;
END $$;
```

### Option 4: Seed Only Organizations Without Event Types

```sql
-- Seed only for organizations that don't have any event types yet
DO $$
DECLARE
  org_record RECORD;
BEGIN
  FOR org_record IN
    SELECT o.id
    FROM public.organizations o
    LEFT JOIN public.event_types et ON et.organization_id = o.id
    WHERE et.id IS NULL
    GROUP BY o.id
  LOOP
    PERFORM seed_default_event_types_for_organization(org_record.id);
  END LOOP;
END $$;
```

## Using with Supabase CLI

If using Supabase CLI, you can run the seed file:

```bash
# Run seed file directly
supabase db reset

# Or run specific seed file
psql $DATABASE_URL -f supabase/seeds/event_types.sql
```

## Verification

After seeding, verify the data was inserted correctly:

```sql
SELECT
  name,
  category,
  duration,
  price,
  is_active,
  is_bookable
FROM public.event_types
ORDER BY category, price;
```

## Customization

Feel free to modify the seed data to match your wellness center's services:

- Adjust prices based on your market
- Change durations to match your service offerings
- Modify categories to fit your business model
- Update colors to match your brand
- Adjust booking requirements (approval, advance notice, etc.)

## Notes

- All event types are set to `is_active = true` and `is_bookable = true` by default
- Buffer times are included for preparation and cleanup
- Default currency is USD (modify as needed)
- Minimum advance booking hours vary by service type
- Some services require manual approval (consultations, therapy sessions)
