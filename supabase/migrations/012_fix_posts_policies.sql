-- =====================================================
-- Fix posts RLS policies by removing ALL old policies
-- and keeping only the simple authenticated user policies
-- =====================================================

-- First, drop ALL existing policies on posts table
DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can view own posts" ON public.posts;
DROP POLICY IF EXISTS "Members can create posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Anyone can update view count for published posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update all posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete all posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can update posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can delete posts" ON public.posts;

-- Drop ALL existing policies on post_blocks table
DROP POLICY IF EXISTS "Users can view blocks of accessible posts" ON public.post_blocks;
DROP POLICY IF EXISTS "Post authors can manage blocks" ON public.post_blocks;
DROP POLICY IF EXISTS "Admins can view all post blocks" ON public.post_blocks;
DROP POLICY IF EXISTS "Admins can manage all post blocks" ON public.post_blocks;
DROP POLICY IF EXISTS "Authenticated users can view all blocks" ON public.post_blocks;
DROP POLICY IF EXISTS "Authenticated users can manage blocks" ON public.post_blocks;

-- Now create ONLY the simple policies (no circular dependencies)
-- These policies allow all authenticated users, with security handled at API layer

-- Posts policies for SELECT - allow both public and authenticated
-- Public can view published posts (for /api/posts without auth)
CREATE POLICY "Public can view published posts"
    ON public.posts FOR SELECT
    USING (status = 'published');

-- Authenticated users can view all posts (including drafts)
CREATE POLICY "Authenticated users can view all posts"
    ON public.posts FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Only authenticated users can create/update/delete
CREATE POLICY "Authenticated users can create posts"
    ON public.posts FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update posts"
    ON public.posts FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete posts"
    ON public.posts FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Post blocks policies
-- Public can view blocks of published posts
CREATE POLICY "Public can view blocks of published posts"
    ON public.post_blocks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE posts.id = post_blocks.post_id
                AND posts.status = 'published'
        )
    );

-- Authenticated users can view all blocks
CREATE POLICY "Authenticated users can view all blocks"
    ON public.post_blocks FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Only authenticated users can manage blocks
CREATE POLICY "Authenticated users can manage blocks"
    ON public.post_blocks FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Security is now handled at the application layer:
-- - /api/admin/posts checks if user.role === 'admin'
-- - /api/posts/[id] checks if user is author OR admin
-- - Public can view published posts and their blocks
-- - Authenticated users can view all posts (API filters by author for members)
-- This approach prevents circular dependency with profiles table
