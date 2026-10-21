-- Drop create_user_with_profile().
--
-- It is SECURITY DEFINER and was granted to every authenticated user, so any
-- signed-in member could call it to create new accounts — including ones with
-- role 'admin'. The app no longer uses it: accounts are created through
-- /api/admin/create-user, which checks the caller is an admin and uses the
-- service-role key.

DROP FUNCTION IF EXISTS public.create_user_with_profile(TEXT, TEXT, JSONB);
