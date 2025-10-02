-- Allow anyone to update view_count and upvote_count for published posts
-- This is needed for incrementing view count when viewing posts

DROP POLICY IF EXISTS "Anyone can update view count for published posts" ON public.posts;

CREATE POLICY "Anyone can update view count for published posts"
    ON public.posts FOR UPDATE
    USING (status = 'published')
    WITH CHECK (status = 'published');
