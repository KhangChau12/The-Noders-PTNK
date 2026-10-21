-- =====================================================
-- 027: Certificate batches + awards, and context on points logs
-- =====================================================
-- * certificate_batches: one row per event a set of certificates was issued
--   for (e.g. "PTNK AI Challenge 2026"). certificates.batch_id points to it.
-- * certificates.award: participation | first | second | third | gold |
--   silver | bronze. The title is built from award + event.
-- * task_logs gets created_at, created_by and an optional post_id, so a post
--   can't be rewarded twice and logs have a date.
-- Existing rows are backfilled from their titles. Requires 026 (is_admin()).

BEGIN;

-- -----------------------------------------------------
-- Certificate batches
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificate_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  contest_slug text,
  award_style text NOT NULL DEFAULT 'none' CHECK (award_style IN ('places', 'medals', 'none')),
  issued_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.certificate_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Certificate batches are public" ON public.certificate_batches;
CREATE POLICY "Certificate batches are public"
  ON public.certificate_batches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage certificate batches" ON public.certificate_batches;
CREATE POLICY "Admins manage certificate batches"
  ON public.certificate_batches FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

GRANT SELECT ON public.certificate_batches TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.certificate_batches TO authenticated;

ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS batch_id uuid REFERENCES public.certificate_batches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS award text NOT NULL DEFAULT 'participation';

ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS certificates_award_check;
ALTER TABLE public.certificates ADD CONSTRAINT certificates_award_check
  CHECK (award IN ('participation', 'first', 'second', 'third', 'gold', 'silver', 'bronze'));

CREATE INDEX IF NOT EXISTS idx_certificates_batch_id ON public.certificates(batch_id);

-- Backfill: awards from the existing titles
UPDATE public.certificates SET award = 'gold'   WHERE title ILIKE 'Gold Medal%';
UPDATE public.certificates SET award = 'silver' WHERE title ILIKE 'Silver Medal%';
UPDATE public.certificates SET award = 'bronze' WHERE title ILIKE 'Bronze Medal%';

-- Backfill: one batch per existing event
DO $$
DECLARE naic uuid; community uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM public.certificates WHERE title ILIKE '%NAIC%' AND batch_id IS NULL) THEN
    INSERT INTO public.certificate_batches (event_name, contest_slug, award_style, issued_at)
    SELECT 'Noders AI Challenge 2025', 'naic-2025', 'medals', min(issued_at)
    FROM public.certificates WHERE title ILIKE '%NAIC%'
    RETURNING id INTO naic;
    UPDATE public.certificates SET batch_id = naic WHERE title ILIKE '%NAIC%' AND batch_id IS NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM public.certificates WHERE title ILIKE '%Participation in The Noders Community%' AND batch_id IS NULL) THEN
    INSERT INTO public.certificate_batches (event_name, contest_slug, award_style, issued_at)
    SELECT 'The Noders Community', NULL, 'none', min(issued_at)
    FROM public.certificates WHERE title ILIKE '%Participation in The Noders Community%'
    RETURNING id INTO community;
    UPDATE public.certificates SET batch_id = community
    WHERE title ILIKE '%Participation in The Noders Community%' AND batch_id IS NULL;
  END IF;
END $$;

-- -----------------------------------------------------
-- Points logs: when, by whom, and for which post
-- -----------------------------------------------------
ALTER TABLE public.task_logs
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS post_id uuid REFERENCES public.posts(id) ON DELETE SET NULL;

-- Older logs have no real date; keep them NULL rather than pretend they're from today.
UPDATE public.task_logs SET created_at = NULL WHERE created_by IS NULL AND post_id IS NULL
  AND created_at >= now() - interval '1 minute';

CREATE UNIQUE INDEX IF NOT EXISTS uniq_task_logs_post ON public.task_logs(post_id) WHERE post_id IS NOT NULL;

COMMIT;
