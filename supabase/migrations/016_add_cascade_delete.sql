-- =====================================================
-- ADD CASCADE DELETE TO FOREIGN KEYS
-- =====================================================
-- This migration adds ON DELETE CASCADE to foreign keys
-- that are currently missing it, enabling users to be
-- deleted from Authentication Dashboard without errors.

-- =====================================================
-- 1. FIX projects.created_by
-- =====================================================

-- Drop existing constraint
ALTER TABLE public.projects
DROP CONSTRAINT IF EXISTS projects_created_by_fkey;

-- Re-add with CASCADE DELETE
ALTER TABLE public.projects
ADD CONSTRAINT projects_created_by_fkey
FOREIGN KEY (created_by)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- =====================================================
-- 2. FIX images.uploaded_by
-- =====================================================

-- Drop existing constraint
ALTER TABLE public.images
DROP CONSTRAINT IF EXISTS images_uploaded_by_fkey;

-- Re-add with CASCADE DELETE
ALTER TABLE public.images
ADD CONSTRAINT images_uploaded_by_fkey
FOREIGN KEY (uploaded_by)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- =====================================================
-- SUMMARY
-- =====================================================
-- The following foreign keys now have CASCADE DELETE:
--
-- FROM BASE SCHEMA (already had CASCADE):
-- ✓ profiles.id → auth.users(id) ON DELETE CASCADE
-- ✓ project_contributors.project_id → projects(id) ON DELETE CASCADE
-- ✓ project_contributors.user_id → auth.users(id) ON DELETE CASCADE
--
-- FROM POSTS SYSTEM (already had CASCADE):
-- ✓ posts.author_id → profiles(id) ON DELETE CASCADE
-- ✓ post_blocks.post_id → posts(id) ON DELETE CASCADE
-- ✓ post_upvotes.post_id → posts(id) ON DELETE CASCADE
-- ✓ post_upvotes.user_id → profiles(id) ON DELETE CASCADE
--
-- ADDED IN THIS MIGRATION:
-- ✅ projects.created_by → auth.users(id) ON DELETE CASCADE
-- ✅ images.uploaded_by → auth.users(id) ON DELETE CASCADE
--
-- RESULT:
-- When a user is deleted from Authentication Dashboard:
-- 1. Their profile is deleted (CASCADE)
-- 2. Their projects are deleted (CASCADE - FIXED)
-- 3. Their project contributions are deleted (CASCADE)
-- 4. Their images are deleted (CASCADE - FIXED)
-- 5. Their posts are deleted (CASCADE via profile)
-- 6. Their post blocks are deleted (CASCADE via posts)
-- 7. Their post upvotes are deleted (CASCADE via profile)
--
-- No more "Database error deleting user" errors!
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ CASCADE DELETE migration complete!';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now delete users from Authentication Dashboard';
    RAISE NOTICE 'without encountering foreign key constraint errors.';
    RAISE NOTICE '';
    RAISE NOTICE 'All user-related data will be automatically cleaned up:';
    RAISE NOTICE '  • Profile';
    RAISE NOTICE '  • Projects (created by user)';
    RAISE NOTICE '  • Project contributions';
    RAISE NOTICE '  • Images (uploaded by user)';
    RAISE NOTICE '  • Posts';
    RAISE NOTICE '  • Post blocks';
    RAISE NOTICE '  • Post upvotes';
END $$;
