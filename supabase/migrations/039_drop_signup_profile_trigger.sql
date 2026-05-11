-- The handle_new_user trigger was designed to auto-create a placeholder profile
-- on every new auth signup. It is now superseded by onboarding (/api/organization/setup)
-- for new owners.
--
-- The trigger also inserts without a `role` value, which violates the NOT NULL
-- constraint added in a later migration, causing errors for every new signup.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
