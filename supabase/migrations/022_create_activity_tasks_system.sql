-- =====================================================
-- ACTIVITY TASK SYSTEM
-- =====================================================
-- Stores reusable task templates and per-award task logs.
-- No timestamps are stored on task tables as requested.
-- =====================================================

DROP TABLE IF EXISTS public.task_log_members CASCADE;
DROP TABLE IF EXISTS public.task_logs CASCADE;
DROP TABLE IF EXISTS public.task_templates CASCADE;

-- =====================================================
-- 1. TASK TEMPLATES
-- =====================================================
-- Reusable task definitions for admin selection.
-- Same task name can be reused with different point values across task logs.

CREATE TABLE public.task_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT ''
);

ALTER TABLE public.task_templates
ADD CONSTRAINT task_templates_name_description_key UNIQUE (name, description);

CREATE INDEX IF NOT EXISTS idx_task_templates_name ON public.task_templates(name);

-- =====================================================
-- 2. TASK LOGS
-- =====================================================
-- Stores each point-award event as an immutable snapshot.

CREATE TABLE public.task_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_template_id UUID REFERENCES public.task_templates(id) ON DELETE SET NULL,
    task_name TEXT NOT NULL,
    task_description TEXT NOT NULL DEFAULT '',
    points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0)
);

CREATE INDEX IF NOT EXISTS idx_task_logs_template_id ON public.task_logs(task_template_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_task_name ON public.task_logs(task_name);

-- =====================================================
-- 3. TASK LOG MEMBERS
-- =====================================================
-- Links each task log to one or more members.

CREATE TABLE public.task_log_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_log_id UUID NOT NULL REFERENCES public.task_logs(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
    UNIQUE(task_log_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_task_log_members_task_log_id ON public.task_log_members(task_log_id);
CREATE INDEX IF NOT EXISTS idx_task_log_members_member_id ON public.task_log_members(member_id);

-- =====================================================
-- 4. RLS
-- =====================================================

ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_log_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view task templates" ON public.task_templates;
DROP POLICY IF EXISTS "Authenticated users can manage task templates" ON public.task_templates;
DROP POLICY IF EXISTS "Anyone can view task logs" ON public.task_logs;
DROP POLICY IF EXISTS "Authenticated users can manage task logs" ON public.task_logs;
DROP POLICY IF EXISTS "Anyone can view task log members" ON public.task_log_members;
DROP POLICY IF EXISTS "Authenticated users can manage task log members" ON public.task_log_members;

CREATE POLICY "Anyone can view task templates"
    ON public.task_templates FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can manage task templates"
    ON public.task_templates FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view task logs"
    ON public.task_logs FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can manage task logs"
    ON public.task_logs FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view task log members"
    ON public.task_log_members FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can manage task log members"
    ON public.task_log_members FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Grants for anon/public reading and authenticated management.
GRANT SELECT ON public.task_templates TO anon, authenticated;
GRANT SELECT ON public.task_logs TO anon, authenticated;
GRANT SELECT ON public.task_log_members TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.task_templates TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.task_logs TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.task_log_members TO authenticated;
