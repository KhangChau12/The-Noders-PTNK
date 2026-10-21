-- =====================================================
-- 028: Terms, departments and positions
-- =====================================================
-- The club runs in terms. Each term has its own departments and its own
-- holders: advisor, president, vice presidents, heads and members. The founder
-- is a standing position outside any term.
--
-- Admin access follows positions: founder + the current term's president,
-- vice presidents and heads. sync_admin_roles() writes that into
-- profiles.role, so is_admin() and every RLS policy from 026 keep working.
--
-- Backfills Term 1 from today's data and clears hand-written role bios
-- ("Member of Generation 1", "Head of AI Department_Generation 1").
-- Requires 026.

BEGIN;

CREATE TABLE IF NOT EXISTS public.terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number int NOT NULL UNIQUE,
  name text NOT NULL,
  starts_on date,
  ends_on date,
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_current_term ON public.terms (is_current) WHERE is_current;

CREATE TABLE IF NOT EXISTS public.term_departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_id uuid NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_id uuid REFERENCES public.terms(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('founder', 'advisor', 'president', 'vice_president', 'head', 'member')),
  department_id uuid REFERENCES public.term_departments(id) ON DELETE SET NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- For people shown on the site without an account (advisors)
  display_name text,
  display_title text,
  avatar_url text,
  sort int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT positions_has_person CHECK (profile_id IS NOT NULL OR display_name IS NOT NULL),
  CONSTRAINT positions_term_rule CHECK ((kind = 'founder') = (term_id IS NULL))
);
CREATE INDEX IF NOT EXISTS idx_positions_term ON public.positions(term_id);
CREATE INDEX IF NOT EXISTS idx_positions_profile ON public.positions(profile_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_position_person_term
  ON public.positions (term_id, profile_id, kind, coalesce(department_id, '00000000-0000-0000-0000-000000000000'::uuid))
  WHERE profile_id IS NOT NULL;

ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.term_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['terms', 'term_departments', 'positions'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s are public" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "%s are public" ON public.%I FOR SELECT USING (true)', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins manage %s" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Admins manage %s" ON public.%I FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin())', t, t);
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', t);
    EXECUTE format('GRANT INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
  END LOOP;
END $$;

-- -----------------------------------------------------
-- Admin access follows positions
-- -----------------------------------------------------
-- Let role changes made by sync_admin_roles() through the 026 trigger.
CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_admin() OR current_setting('app.sync_roles', true) = 'on' THEN
    RETURN NEW;
  END IF;
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Only admins can change a member''s role';
  END IF;
  IF NEW.contest_count IS DISTINCT FROM OLD.contest_count THEN
    RAISE EXCEPTION 'Only admins can change contest_count';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_admin_roles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Callable by admins (and the migration itself, which runs as the owner)
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  PERFORM set_config('app.sync_roles', 'on', true);
  UPDATE public.profiles p SET role = CASE WHEN EXISTS (
      SELECT 1 FROM public.positions pos
      LEFT JOIN public.terms t ON t.id = pos.term_id
      WHERE pos.profile_id = p.id
        AND (pos.kind = 'founder' OR (t.is_current AND pos.kind IN ('president', 'vice_president', 'head')))
    ) THEN 'admin' ELSE 'member' END;
  PERFORM set_config('app.sync_roles', 'off', true);
END;
$$;
REVOKE ALL ON FUNCTION public.sync_admin_roles() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.sync_admin_roles() TO authenticated;

-- Make a term current (ending the previous one) and move admin access with it.
CREATE OR REPLACE FUNCTION public.make_term_current(term_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  UPDATE public.terms SET is_current = false, ends_on = coalesce(ends_on, current_date)
    WHERE is_current AND id <> term_id_param;
  UPDATE public.terms SET is_current = true, starts_on = coalesce(starts_on, current_date) WHERE id = term_id_param;
  PERFORM public.sync_admin_roles();
END;
$$;
REVOKE ALL ON FUNCTION public.make_term_current(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.make_term_current(uuid) TO authenticated;

-- -----------------------------------------------------
-- Backfill Term 1 from today's profiles
-- -----------------------------------------------------
DO $$
DECLARE
  t1 uuid;
  r record;
  dept uuid;
  n int := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM public.terms) THEN
    RETURN;
  END IF;

  INSERT INTO public.terms (number, name, starts_on, is_current)
  SELECT 1, 'Term 1', min(created_at)::date, true FROM public.profiles
  RETURNING id INTO t1;

  -- Departments from "Head of X Department" bios, alphabetical
  FOR r IN
    SELECT DISTINCT trim(substring(bio FROM '(?i)head of ([a-z ]+?) department')) AS name
    FROM public.profiles WHERE bio ~* 'head of [a-z ]+ department' ORDER BY 1
  LOOP
    n := n + 1;
    INSERT INTO public.term_departments (term_id, name, sort) VALUES (t1, r.name, n);
  END LOOP;

  -- Founder (standing) and Term 1 president: the "Founder of …" bio
  INSERT INTO public.positions (term_id, kind, profile_id, sort)
  SELECT NULL, 'founder', id, 0 FROM public.profiles WHERE bio ~* '^founder';
  INSERT INTO public.positions (term_id, kind, profile_id, sort)
  SELECT t1, 'president', id, 1 FROM public.profiles WHERE bio ~* '^founder';

  -- Advisor: keep the profile, carry the school title onto the position
  INSERT INTO public.positions (term_id, kind, profile_id, display_title, sort)
  SELECT t1, 'advisor', id,
         nullif(trim(regexp_replace(regexp_replace(bio, '(?i)club''?s advisor', '', 'g'), '\s*[\r\n]+\s*', ' · ', 'g'), ' ·'), ''),
         0
  FROM public.profiles WHERE bio ~* 'advisor';

  -- Heads
  FOR r IN
    SELECT id, trim(substring(bio FROM '(?i)head of ([a-z ]+?) department')) AS dname
    FROM public.profiles WHERE bio ~* 'head of [a-z ]+ department'
  LOOP
    SELECT id INTO dept FROM public.term_departments WHERE term_id = t1 AND name = r.dname;
    INSERT INTO public.positions (term_id, kind, department_id, profile_id, sort) VALUES (t1, 'head', dept, r.id, 2);
  END LOOP;

  -- Everyone else is a member of Term 1
  INSERT INTO public.positions (term_id, kind, profile_id, sort)
  SELECT t1, 'member', p.id, 9 FROM public.profiles p
  WHERE NOT EXISTS (SELECT 1 FROM public.positions pos WHERE pos.profile_id = p.id AND pos.term_id = t1);
END $$;

-- Hand-written role bios are now generated from positions
UPDATE public.profiles SET bio = NULL
WHERE bio ~* '^\s*member of generation \d+\.?\s*$'
   OR bio ~* '^\s*head of [a-z ]+ department_generation \d+\s*$';

SELECT public.sync_admin_roles();

COMMIT;
