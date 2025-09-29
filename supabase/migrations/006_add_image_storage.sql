-- Add image storage system to The Noders PTNK
-- This migration adds a central images table and updates existing tables to use image references
-- Safe migration: only adds new tables and columns, doesn't modify existing data

-- Create images table for centralized image storage
CREATE TABLE public.images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif')),
    width INTEGER,
    height INTEGER,
    file_path TEXT NOT NULL, -- path trong Supabase Storage
    public_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    usage_type TEXT DEFAULT 'general' CHECK (usage_type IN ('avatar', 'project_thumbnail', 'news_image', 'general')),
    alt_text TEXT, -- for accessibility
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE public.images IS 'Central storage for all uploaded images with metadata and file information';
COMMENT ON COLUMN public.images.file_path IS 'Relative path in Supabase Storage bucket';
COMMENT ON COLUMN public.images.public_url IS 'Full public URL for accessing the image';
COMMENT ON COLUMN public.images.usage_type IS 'Categorizes image usage: avatar, project_thumbnail, news_image, general';
COMMENT ON COLUMN public.images.alt_text IS 'Alternative text for accessibility and SEO';

-- Create index for better performance
CREATE INDEX idx_images_uploaded_by ON public.images(uploaded_by);
CREATE INDEX idx_images_usage_type ON public.images(usage_type);
CREATE INDEX idx_images_created_at ON public.images(created_at);

-- Enable RLS on images table
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- RLS policies for images
CREATE POLICY "Images are viewable by everyone"
    ON public.images FOR SELECT
    USING (true);

CREATE POLICY "Users can upload images"
    ON public.images FOR INSERT
    WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update own images"
    ON public.images FOR UPDATE
    USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own images"
    ON public.images FOR DELETE
    USING (auth.uid() = uploaded_by);

-- Add image reference columns to existing tables

-- Add avatar image support to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_image_id UUID REFERENCES public.images(id);
COMMENT ON COLUMN public.profiles.avatar_image_id IS 'Reference to uploaded avatar image, preferred over avatar_url';

-- Add thumbnail image support to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS thumbnail_image_id UUID REFERENCES public.images(id);
COMMENT ON COLUMN public.projects.thumbnail_image_id IS 'Reference to uploaded thumbnail image, preferred over thumbnail_url';

-- Create function to get image URL (helper function for queries)
CREATE OR REPLACE FUNCTION get_image_url(image_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    image_url TEXT;
BEGIN
    SELECT public_url INTO image_url
    FROM public.images
    WHERE id = image_id;

    RETURN image_url;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_image_url TO authenticated, anon;

-- Create function to clean up orphaned images (admin function)
CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete images that are not referenced by any table
    DELETE FROM public.images
    WHERE id NOT IN (
        SELECT avatar_image_id FROM public.profiles WHERE avatar_image_id IS NOT NULL
        UNION
        SELECT thumbnail_image_id FROM public.projects WHERE thumbnail_image_id IS NOT NULL
    )
    AND created_at < NOW() - INTERVAL '7 days'; -- Only delete images older than 7 days

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$$;

-- Grant execute permission to authenticated users (admins can call this)
GRANT EXECUTE ON FUNCTION cleanup_orphaned_images TO authenticated;

-- Grant necessary permissions
GRANT ALL ON public.images TO authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Create updated_at trigger for images table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_images_updated_at
    BEFORE UPDATE ON public.images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🖼️  Image storage system added successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Features added:';
    RAISE NOTICE '   • Central images table with metadata';
    RAISE NOTICE '   • Image reference columns for profiles (avatar_image_id)';
    RAISE NOTICE '   • Image reference columns for projects (thumbnail_image_id)';
    RAISE NOTICE '   • RLS policies for secure image access';
    RAISE NOTICE '   • Helper functions for image URL retrieval';
    RAISE NOTICE '   • Cleanup function for orphaned images';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Next steps:';
    RAISE NOTICE '   1. Setup Supabase Storage bucket named "images"';
    RAISE NOTICE '   2. Create ImageUpload component';
    RAISE NOTICE '   3. Build upload API route';
    RAISE NOTICE '   4. Integrate into forms (avatar, thumbnails)';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Supported image types: JPEG, PNG, WebP, GIF';
    RAISE NOTICE '🔧 Usage types: avatar, project_thumbnail, news_image, general';
END $$;