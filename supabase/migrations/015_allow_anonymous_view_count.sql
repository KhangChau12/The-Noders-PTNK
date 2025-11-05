-- =====================================================
-- Allow anonymous users to increment view_count
-- Using PostgreSQL function with SECURITY DEFINER
-- =====================================================

-- Create a function to increment view count that bypasses RLS
CREATE OR REPLACE FUNCTION increment_post_view_count(post_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER  -- This runs with the privileges of the function creator (bypasses RLS)
SET search_path = public
AS $$
DECLARE
    new_view_count INTEGER;
BEGIN
    -- Only increment for published posts
    UPDATE posts
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = post_id_param
        AND status = 'published'
    RETURNING view_count INTO new_view_count;

    -- Return the new view count (or NULL if post not found/not published)
    RETURN new_view_count;
END;
$$;

-- Grant execute permission to anonymous users and authenticated users
GRANT EXECUTE ON FUNCTION increment_post_view_count(UUID) TO anon, authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Now the API can call this function to increment view count without auth
-- Example: SELECT increment_post_view_count('post-uuid-here')
