-- =====================================================
-- Allow setting profiles.user_id to NULL (account close / unlink)
-- Keep preventing change from one auth user to another
-- =====================================================

CREATE OR REPLACE FUNCTION public.prevent_profile_critical_field_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow setting user_id from NULL to a value (for auth linking)
  -- Allow setting user_id from value to NULL (for account close / unlink)
  -- Only prevent changing from one non-NULL value to a different non-NULL value
  IF OLD.user_id IS NOT NULL AND NEW.user_id IS NOT NULL AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Cannot change user_id';
  END IF;
  
  -- Allow setting organization_id from NULL to a value (for seed scripts)
  -- But prevent changing between two non-NULL values
  IF OLD.organization_id IS NOT NULL AND NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
    RAISE EXCEPTION 'Cannot change organization_id';
  END IF;
  
  -- Prevent changes to role
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Cannot change role';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.prevent_profile_critical_field_changes IS 'Prevents changing profile critical fields except: user_id/organization_id NULL->value (link), user_id value->NULL (account close)';
