-- =====================================================
-- 1. DROP EXISTING TABLES (for clean migration)
-- =====================================================

DROP TABLE IF EXISTS public.post_upvotes CASCADE;
DROP TABLE IF EXISTS public.post_blocks CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- Posts table (main content metadata with related posts)
CREATE TABLE public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT CHECK (title IS NULL OR LENGTH(title) <= 100),
    summary TEXT CHECK (summary IS NULL OR LENGTH(summary) <= 300),
    thumbnail_image_id UUID,
    category TEXT CHECK (category IS NULL OR category IN ('News', 'You may want to know', 'Member Spotlight', 'Community Activities')),
    author_id UUID NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    thumbnail_url TEXT, -- Legacy support

    -- Related posts (max 2, stored as columns)
    related_post_id_1 UUID,
    related_post_id_2 UUID,

    -- Metadata
    reading_time INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    upvote_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,

    -- Timestamps
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CHECK (related_post_id_1 != id),
    CHECK (related_post_id_2 != id),
    CHECK (related_post_id_1 != related_post_id_2 OR related_post_id_2 IS NULL)
);

-- Add foreign keys AFTER table creation
ALTER TABLE public.posts
ADD CONSTRAINT posts_thumbnail_image_id_fkey
FOREIGN KEY (thumbnail_image_id)
REFERENCES public.images(id)
ON DELETE SET NULL;

ALTER TABLE public.posts
ADD CONSTRAINT posts_author_id_fkey
FOREIGN KEY (author_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

ALTER TABLE public.posts
ADD CONSTRAINT posts_related_post_id_1_fkey
FOREIGN KEY (related_post_id_1)
REFERENCES public.posts(id)
ON DELETE SET NULL;

ALTER TABLE public.posts
ADD CONSTRAINT posts_related_post_id_2_fkey
FOREIGN KEY (related_post_id_2)
REFERENCES public.posts(id)
ON DELETE SET NULL;

-- Post blocks (flexible content structure)
CREATE TABLE public.post_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'quote', 'image', 'youtube')),
    order_index INTEGER NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(post_id, order_index)
);

-- Add foreign key for post_blocks
ALTER TABLE public.post_blocks
ADD CONSTRAINT post_blocks_post_id_fkey
FOREIGN KEY (post_id)
REFERENCES public.posts(id)
ON DELETE CASCADE;

-- Post upvotes (one vote per user per post)
CREATE TABLE public.post_upvotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(post_id, user_id)
);

-- Add foreign keys for post_upvotes
ALTER TABLE public.post_upvotes
ADD CONSTRAINT post_upvotes_post_id_fkey
FOREIGN KEY (post_id)
REFERENCES public.posts(id)
ON DELETE CASCADE;

ALTER TABLE public.post_upvotes
ADD CONSTRAINT post_upvotes_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_upvote_count ON public.posts(upvote_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_blocks_post_id ON public.post_blocks(post_id, order_index);
CREATE INDEX IF NOT EXISTS idx_post_upvotes_post_id ON public.post_upvotes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_upvotes_user_id ON public.post_upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_upvotes_composite ON public.post_upvotes(post_id, user_id);

-- =====================================================
-- 4. CREATE TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp (reuse if exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_post_blocks_updated_at ON public.post_blocks;
CREATE TRIGGER update_post_blocks_updated_at
    BEFORE UPDATE ON public.post_blocks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_upvotes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES - POSTS
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can view own posts" ON public.posts;
DROP POLICY IF EXISTS "Members can create posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.posts;

-- Public can view published posts
CREATE POLICY "Public can view published posts"
    ON public.posts FOR SELECT
    USING (status = 'published');

-- Authors can view own posts (any status)
CREATE POLICY "Authors can view own posts"
    ON public.posts FOR SELECT
    USING (auth.uid() = author_id);

-- Authenticated members can create posts
CREATE POLICY "Members can create posts"
    ON public.posts FOR INSERT
    WITH CHECK (auth.uid() = author_id);

-- Authors can update own posts
CREATE POLICY "Authors can update own posts"
    ON public.posts FOR UPDATE
    USING (auth.uid() = author_id);

-- Authors can delete own posts
CREATE POLICY "Authors can delete own posts"
    ON public.posts FOR DELETE
    USING (auth.uid() = author_id);

-- =====================================================
-- 7. CREATE RLS POLICIES - POST BLOCKS
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view blocks of accessible posts" ON public.post_blocks;
DROP POLICY IF EXISTS "Post authors can manage blocks" ON public.post_blocks;

-- Users can view blocks of posts they have access to
CREATE POLICY "Users can view blocks of accessible posts"
    ON public.post_blocks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE posts.id = post_blocks.post_id
                AND (posts.status = 'published' OR posts.author_id = auth.uid())
        )
    );

-- Post authors can manage their post blocks (INSERT, UPDATE, DELETE)
CREATE POLICY "Post authors can manage blocks"
    ON public.post_blocks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE posts.id = post_blocks.post_id
                AND posts.author_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE posts.id = post_blocks.post_id
                AND posts.author_id = auth.uid()
        )
    );

-- =====================================================
-- 8. CREATE RLS POLICIES - POST UPVOTES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view upvotes" ON public.post_upvotes;
DROP POLICY IF EXISTS "Authenticated users can insert own upvotes" ON public.post_upvotes;
DROP POLICY IF EXISTS "Users can delete own upvotes" ON public.post_upvotes;

-- Anyone can view upvotes (to see counts)
CREATE POLICY "Anyone can view upvotes"
    ON public.post_upvotes FOR SELECT
    USING (true);

-- Authenticated users can insert their own upvotes
CREATE POLICY "Authenticated users can insert own upvotes"
    ON public.post_upvotes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own upvotes
CREATE POLICY "Users can delete own upvotes"
    ON public.post_upvotes FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_blocks TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.post_upvotes TO authenticated;

-- Grant SELECT to anonymous users (for viewing published posts)
GRANT SELECT ON public.posts TO anon;
GRANT SELECT ON public.post_blocks TO anon;
GRANT SELECT ON public.post_upvotes TO anon;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- To rollback this migration, run:
-- DROP TABLE IF EXISTS public.post_upvotes CASCADE;
-- DROP TABLE IF EXISTS public.post_blocks CASCADE;
-- DROP TABLE IF EXISTS public.posts CASCADE;