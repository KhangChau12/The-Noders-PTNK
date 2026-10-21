-- =====================================================
-- 026: Enforce permissions in the database, not only in API routes
-- =====================================================
-- Before this migration:
--   * projects / project_contributors accepted INSERT, UPDATE and DELETE from
--     anyone holding the public anon key (policies with USING (true)).
--   * any signed-in member could edit or delete any post, block, certificate
--     or activity log directly through the Supabase SDK.
--   * "Users can update own profile" let a member set their own role to
--     'admin' or change their contest_count.
--
-- After it, every write is checked against the row's owner or the admin role.
-- API routes that act for a user must send that user's token
-- (createTokenClient / setSession); service-role clients still bypass RLS.
--
-- Run in the Supabase SQL editor or with `supabase db push`.

BEGIN;

-- -----------------------------------------------------
-- Helpers
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- Drop every existing policy on a table, so the set below is the whole truth.
CREATE OR REPLACE FUNCTION pg_temp.drop_policies(tbl text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
  END LOOP;
END;
$$;

-- -----------------------------------------------------
-- profiles: members edit their own row, but not role or contest_count
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_admin() THEN
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

DROP TRIGGER IF EXISTS protect_profile_privileges ON public.profiles;
CREATE TRIGGER protect_profile_privileges
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileges();

-- -----------------------------------------------------
-- projects
-- -----------------------------------------------------
SELECT pg_temp.drop_policies('projects');

CREATE POLICY "Projects are public"
  ON public.projects FOR SELECT USING (true);

CREATE POLICY "Members create their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators, contributors and admins edit projects"
  ON public.projects FOR UPDATE
  USING (
    auth.uid() = created_by
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.project_contributors pc
      WHERE pc.project_id = projects.id AND pc.user_id = auth.uid()
    )
  );

CREATE POLICY "Creators and admins delete projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = created_by OR public.is_admin());

-- -----------------------------------------------------
-- project_contributors: the project's creator (or an admin) manages credits
-- -----------------------------------------------------
SELECT pg_temp.drop_policies('project_contributors');

CREATE POLICY "Credits are public"
  ON public.project_contributors FOR SELECT USING (true);

CREATE POLICY "Project creators and admins manage credits"
  ON public.project_contributors FOR ALL
  USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_contributors.project_id AND p.created_by = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_contributors.project_id AND p.created_by = auth.uid()
    )
  );

-- -----------------------------------------------------
-- posts
-- -----------------------------------------------------
SELECT pg_temp.drop_policies('posts');

CREATE POLICY "Published posts are public; authors and admins see the rest"
  ON public.posts FOR SELECT
  USING (status = 'published' OR auth.uid() = author_id OR public.is_admin());

CREATE POLICY "Members write posts as themselves"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors and admins edit posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = author_id OR public.is_admin());

CREATE POLICY "Authors and admins delete posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = author_id OR public.is_admin());

-- View counts go through increment_post_view_count() (SECURITY DEFINER, 015).
-- Upvote counts go through this one: readers can't update someone else's post.
CREATE OR REPLACE FUNCTION public.sync_post_upvote_count(post_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM public.post_upvotes WHERE post_id = post_id_param;
  UPDATE public.posts SET upvote_count = n WHERE id = post_id_param;
  RETURN n;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_post_upvote_count(uuid) TO authenticated;

-- A view or an upvote is not an edit: keep updated_at when only counters change,
-- so "last edited" in the dashboard means what it says.
CREATE OR REPLACE FUNCTION public.posts_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (to_jsonb(NEW) - 'view_count' - 'upvote_count' - 'updated_at')
     = (to_jsonb(OLD) - 'view_count' - 'upvote_count' - 'updated_at') THEN
    NEW.updated_at = OLD.updated_at;
  ELSIF NEW.updated_at IS NOT DISTINCT FROM OLD.updated_at THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.posts_touch_updated_at();

-- -----------------------------------------------------
-- post_blocks
-- -----------------------------------------------------
SELECT pg_temp.drop_policies('post_blocks');

CREATE POLICY "Blocks follow their post's visibility"
  ON public.post_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_blocks.post_id
        AND (p.status = 'published' OR p.author_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Authors and admins manage blocks"
  ON public.post_blocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_blocks.post_id
        AND (p.author_id = auth.uid() OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_blocks.post_id
        AND (p.author_id = auth.uid() OR public.is_admin())
    )
  );

-- -----------------------------------------------------
-- certificates: public to read, only admins issue or change them
-- -----------------------------------------------------
SELECT pg_temp.drop_policies('certificates');

CREATE POLICY "Certificates are public"
  ON public.certificates FOR SELECT USING (true);

CREATE POLICY "Admins manage certificates"
  ON public.certificates FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------
-- Activity system: public to read, only admins log points
-- -----------------------------------------------------
SELECT pg_temp.drop_policies('task_templates');
CREATE POLICY "Task templates are public" ON public.task_templates FOR SELECT USING (true);
CREATE POLICY "Admins manage task templates" ON public.task_templates FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

SELECT pg_temp.drop_policies('task_logs');
CREATE POLICY "Task logs are public" ON public.task_logs FOR SELECT USING (true);
CREATE POLICY "Admins manage task logs" ON public.task_logs FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

SELECT pg_temp.drop_policies('task_log_members');
CREATE POLICY "Task log members are public" ON public.task_log_members FOR SELECT USING (true);
CREATE POLICY "Admins manage task log members" ON public.task_log_members FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

COMMIT;
