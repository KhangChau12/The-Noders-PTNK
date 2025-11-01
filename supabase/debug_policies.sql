-- Check all current RLS policies for posts tables
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('posts', 'post_blocks', 'post_upvotes')
ORDER BY tablename, policyname;
