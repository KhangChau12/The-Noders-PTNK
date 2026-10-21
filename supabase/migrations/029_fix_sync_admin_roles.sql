-- =====================================================
-- 029: sync_admin_roles() must have a WHERE clause
-- =====================================================
-- Supabase's API rejects UPDATE statements without WHERE (pg_safeupdate), so
-- calling make_term_current() from the site failed with
-- "UPDATE requires a WHERE clause". It worked in the SQL editor, which is why
-- migration 028 itself ran fine. Now only rows whose role actually changes are
-- updated.

CREATE OR REPLACE FUNCTION public.sync_admin_roles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Callable by admins (and migrations, which run as the owner)
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  PERFORM set_config('app.sync_roles', 'on', true);
  WITH wanted AS (
    SELECT p.id,
      CASE WHEN EXISTS (
        SELECT 1 FROM public.positions pos
        LEFT JOIN public.terms t ON t.id = pos.term_id
        WHERE pos.profile_id = p.id
          AND (pos.kind = 'founder' OR (t.is_current AND pos.kind IN ('president', 'vice_president', 'head')))
      ) THEN 'admin' ELSE 'member' END AS role
    FROM public.profiles p
  )
  UPDATE public.profiles p SET role = w.role
  FROM wanted w
  WHERE w.id = p.id AND p.role IS DISTINCT FROM w.role;
  PERFORM set_config('app.sync_roles', 'off', true);
END;
$$;
REVOKE ALL ON FUNCTION public.sync_admin_roles() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.sync_admin_roles() TO authenticated;
