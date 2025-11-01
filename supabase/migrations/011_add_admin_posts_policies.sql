-- =====================================================
-- Relax RLS policies for posts to allow API-level auth
-- Similar to projects approach (004_rls_policies.sql)
-- =====================================================

-- Drop the restrictive policies created in 009_create_posts_system.sql
DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can view own posts" ON public.posts;
DROP POLICY IF EXISTS "Members can create posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Anyone can update view count for published posts" ON public.posts;

DROP POLICY IF EXISTS "Users can view blocks of accessible posts" ON public.post_blocks;
DROP POLICY IF EXISTS "Post authors can manage blocks" ON public.post_blocks;

-- Create simpler policies that allow authenticated users
-- Security is handled at API layer (same as projects)

-- Anyone can view all posts (including drafts) if authenticated
CREATE POLICY "Authenticated users can view all posts"
    ON public.posts FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Authenticated users can insert posts (API validates ownership)
CREATE POLICY "Authenticated users can create posts"
    ON public.posts FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update posts (API validates ownership/admin)
CREATE POLICY "Authenticated users can update posts"
    ON public.posts FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- Authenticated users can delete posts (API validates ownership/admin)
CREATE POLICY "Authenticated users can delete posts"
    ON public.posts FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Post blocks - simple policies
CREATE POLICY "Authenticated users can view all blocks"
    ON public.post_blocks FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage blocks"
    ON public.post_blocks FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Note: Security is now handled at the application layer:
-- - API routes validate auth tokens
-- - API checks user roles (admin vs member)
-- - Admin can access all posts, members only their own
-- This prevents circular dependency issues with RLS policies

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
