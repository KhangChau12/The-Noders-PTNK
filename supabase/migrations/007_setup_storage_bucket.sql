-- Setup Supabase Storage bucket for images
-- This migration creates the storage bucket and sets up RLS policies for file access

-- Create the images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'images',
    'images',
    true, -- public access
    5242880, -- 5MB limit per file
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Note: RLS on storage.objects is already enabled by Supabase by default
-- We only need to create policies, not enable RLS

-- Drop existing policies if they exist (safe for re-running migration)
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Policy: Anyone can view images (since bucket is public)
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Policy: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text -- Files must be in user's folder
);

-- Policy: Users can update their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🗄️  Storage bucket setup completed!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Storage configuration:';
    RAISE NOTICE '   • Bucket name: images';
    RAISE NOTICE '   • Public access: enabled';
    RAISE NOTICE '   • File size limit: 5MB per file';
    RAISE NOTICE '   • Allowed types: JPEG, PNG, WebP, GIF';
    RAISE NOTICE '   • User folders: organized by user ID';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Security policies:';
    RAISE NOTICE '   • Anyone can view images (public bucket)';
    RAISE NOTICE '   • Only authenticated users can upload';
    RAISE NOTICE '   • Users can only manage their own files';
    RAISE NOTICE '   • Files organized in user-specific folders';
    RAISE NOTICE '';
    RAISE NOTICE '📁 File structure: /images/{user_id}/{filename}';
END $$;