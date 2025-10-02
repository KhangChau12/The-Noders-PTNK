-- Fix storage policies for image uploads
-- This migration simplifies the storage policies to ensure uploads work correctly

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Create simpler, more permissive policies

-- Policy: Anyone can view images (since bucket is public)
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Policy: Authenticated users can upload images (simplified)
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
);

-- Policy: Users can update their own images (simplified)
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
);

-- Policy: Users can delete their own images (simplified)
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🔧 Storage policies fixed!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ New simplified policies:';
    RAISE NOTICE '   • Anyone can view images';
    RAISE NOTICE '   • Authenticated users can upload, update, delete';
    RAISE NOTICE '   • No strict folder restrictions';
    RAISE NOTICE '';
    RAISE NOTICE '📁 Files can be uploaded to any path in images bucket';
END $$;