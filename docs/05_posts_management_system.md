# Posts Management System - Implementation Plan

## Overview
This document outlines the implementation of a dynamic posts/news management system for The Noders PTNK website. The system will replace the current file-based Markdown approach with a database-driven, block-based content editor that allows members to create and manage posts through the dashboard.

## Current State Analysis

### Existing News System
- **File-based CMS** using Markdown files in `/content/news/`
- **Gray-matter** for frontmatter parsing
- **Categories**: announcement, project, member-spotlight, technical, event
- **Features**: Search, filtering, featured posts, related posts
- **Static generation** from Markdown files

### Architecture Foundation
- **Database**: Supabase PostgreSQL with RLS policies
- **Authentication**: Role-based (admin/member) with Supabase Auth
- **Image System**: Centralized images table with Supabase Storage
- **API Pattern**: RESTful with Bearer token authentication
- **UI Components**: Custom design system with Tailwind CSS

## Authentication Pattern - Lessons Learned

### Critical: Auth vs Operations Client Separation

**Learn from the Avatar Upload Bug Fix:**

In [src/app/api/upload/image/route.ts:38](src/app/api/upload/image/route.ts#L38), we discovered the proper pattern:

```typescript
// ✅ CORRECT PATTERN (Fixed)
const authClient = createClient()  // For authentication only
const { data: { user }, error: authError } = await authClient.auth.getUser(token)

if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Use admin client for database operations to bypass RLS
const supabase = createAdminClient()
```

**Why This Pattern?**

1. **Authentication Verification**: Use regular `createClient()` with `auth.getUser(token)` to verify user identity
2. **Database Operations**: Use `createAdminClient()` to bypass RLS when performing privileged operations
3. **Never Mix Session Management**: NEVER use `setSession()` with the same token for both access and refresh - this caused the logout bug

### Applied to Projects System

All project API routes follow this pattern:

```typescript
// From src/app/api/projects/route.ts:88-98
const token = authHeader.replace('Bearer ', '')
const supabase = createClient()

// Verify user
const { data: { user }, error: authError } = await supabase.auth.getUser(token)
if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Then use same client for operations (projects have RLS policies setup)
```

**For Posts System:**

- Use `createClient()` for auth verification via `getUser(token)`
- For normal operations: Continue using the same client (if RLS policies are properly configured)
- For admin-only operations (moderation, force publish): Use `createAdminClient()`
- NEVER use `setSession()` in API routes

## New Posts System Requirements

### Content Structure
**Required Fields:**
1. **Thumbnail Image** - Using existing image upload system
2. **Post Title** - Text input, max 100 characters
3. **Summary** - 2-sentence description for previews and SEO

**Content Blocks:**
1. **Text Block** - Rich text, max 800 words
2. **Quote Block** - Highlighted quotes/callouts
3. **Image Block** - Image with optional caption
4. **YouTube Block** - Embedded YouTube videos

**Categories:**
- "News" - General club updates and announcements
- "You may want to know" - Educational content, tutorials
- "Member Spotlight" - Member achievements and interviews
- "Community Activities" - Workshops, events, competitions

### Content Constraints
- **Text blocks**: Maximum 800 words each
- **Image blocks**: Maximum 5 per post
- **Block ordering**: No consecutive text blocks allowed
- **Related posts**: 1-2 posts can be linked at the end
- **Auto-save**: Draft saves every 30 seconds
- **URL validation**: YouTube URLs must be valid

### Upvote System
**Purpose:** Allow members to vote on posts. When 2 members write about the same topic, the post with more upvotes can be chosen for publishing to Facebook.

**Features:**
- **One vote per user per post** - Users can upvote or remove their vote
- **Real-time vote count** - Display total upvotes on post cards and detail pages
- **Sorting by votes** - Ability to sort posts by upvote count

## Database Schema Design (Optimized - 3 Tables)

### Core Tables

```sql
-- Posts table (main content metadata with related posts)
CREATE TABLE public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
    title TEXT NOT NULL CHECK (LENGTH(title) <= 100),
    summary TEXT NOT NULL CHECK (LENGTH(summary) <= 300), -- ~2 sentences
    thumbnail_image_id UUID REFERENCES public.images(id),
    category TEXT NOT NULL CHECK (category IN ('News', 'You may want to know', 'Member Spotlight', 'Community Activities')),
    author_id UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),

    -- Related posts (max 2, stored as columns instead of separate table)
    related_post_id_1 UUID REFERENCES public.posts(id) ON DELETE SET NULL,
    related_post_id_2 UUID REFERENCES public.posts(id) ON DELETE SET NULL,

    -- Metadata
    reading_time INTEGER, -- calculated from content
    view_count INTEGER DEFAULT 0,
    upvote_count INTEGER DEFAULT 0, -- cached count for performance
    featured BOOLEAN DEFAULT false,

    -- Timestamps
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Prevent self-reference in related posts
    CHECK (related_post_id_1 != id),
    CHECK (related_post_id_2 != id),
    CHECK (related_post_id_1 != related_post_id_2 OR related_post_id_2 IS NULL)
);

-- Post blocks (flexible content structure)
CREATE TABLE public.post_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('text', 'quote', 'image', 'youtube')),
    order_index INTEGER NOT NULL, -- 0-based ordering
    content JSONB NOT NULL, -- Flexible content based on block type
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, order_index)
);

-- Post upvotes (one vote per user per post)
-- CANNOT be in metadata because:
-- 1. Need UNIQUE constraint on (post_id, user_id) to prevent duplicate votes
-- 2. Need efficient queries: "get all posts user X upvoted"
-- 3. Need atomic toggle operations without race conditions
-- 4. upvote_count in posts table is already the cached metadata optimization
CREATE TABLE public.post_upvotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id) -- Critical constraint for one-vote-per-user
);

-- Indexes for performance
CREATE INDEX idx_posts_slug ON public.posts(slug);
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_category ON public.posts(category);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_published_at ON public.posts(published_at DESC);
CREATE INDEX idx_posts_upvote_count ON public.posts(upvote_count DESC);
CREATE INDEX idx_post_blocks_post_id ON public.post_blocks(post_id, order_index);
CREATE INDEX idx_post_upvotes_post_id ON public.post_upvotes(post_id);
CREATE INDEX idx_post_upvotes_user_id ON public.post_upvotes(user_id);
CREATE INDEX idx_post_upvotes_composite ON public.post_upvotes(post_id, user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_blocks_updated_at BEFORE UPDATE ON public.post_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Why 3 Tables (Not Less)?

1. **posts** - Core metadata with simple fields (related posts are just 2 UUIDs)
2. **post_blocks** - Variable-length content that can't be flattened (1-15 blocks per post)
3. **post_upvotes** - Requires unique constraints and efficient querying that JSONB can't provide

**Why upvotes can't be metadata:**
- If stored as `{"voter_ids": ["uuid1", "uuid2"]}` in JSONB:
  - ❌ No way to enforce unique constraint at DB level
  - ❌ Slow queries for "all posts user X voted on" (must scan entire posts table)
  - ❌ Race conditions on concurrent vote toggles
  - ❌ No way to efficiently check if user already voted
- Current solution: Cached `upvote_count` in posts table IS the metadata optimization

### Block Content Structure

```typescript
// Text block content
{
  "html": "<p>Rich text content...</p>",
  "word_count": 450
}

// Quote block content
{
  "quote": "The quoted text here",
  "author": "Optional author name",
  "source": "Optional source"
}

// Image block content
{
  "image_id": "uuid-of-image",
  "caption": "Optional image caption",
  "alt_text": "Accessibility description"
}

// YouTube block content
{
  "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "video_id": "VIDEO_ID",
  "title": "Video title from YouTube API",
  "thumbnail": "YouTube thumbnail URL"
}
```

## API Endpoints Design

### Posts CRUD Operations

```typescript
// GET /api/posts - List posts with filtering
// Query params: category, status, author, limit, offset, search, sort_by (created_at|upvote_count)
// Auth: Optional (public posts only if not authenticated)
Response: {
  posts: Post[],
  total: number,
  pagination: { page, limit, hasMore }
}

// GET /api/posts/[slug] - Get specific post with blocks
// Auth: Optional (must be published OR user is author OR user is admin)
Response: {
  post: Post,
  blocks: PostBlock[],
  related_posts: Post[],
  author: Profile,
  user_has_upvoted: boolean // if authenticated
}

// POST /api/posts - Create new post (members only)
// Auth: Required (Bearer token)
Body: { title, summary, thumbnail_image_id, category }
Response: { post: Post }

// PUT /api/posts/[id] - Update post metadata (author/admin only)
// Auth: Required (Bearer token)
Body: Partial<Post> (can include related_post_id_1, related_post_id_2)
Response: { post: Post }

// DELETE /api/posts/[id] - Delete post (author/admin only)
// Auth: Required (Bearer token)
Response: { success: boolean }
```

### Block Management

```typescript
// GET /api/posts/[id]/blocks - Get all blocks for a post
// Auth: Optional (must be published OR user is author OR user is admin)
Response: { blocks: PostBlock[] }

// POST /api/posts/[id]/blocks - Add new block
// Auth: Required (must be author or admin)
Body: { type, content, order_index }
Response: { block: PostBlock }

// PUT /api/posts/[id]/blocks/[blockId] - Update block
// Auth: Required (must be author or admin)
Body: { content, order_index? }
Response: { block: PostBlock }

// DELETE /api/posts/[id]/blocks/[blockId] - Delete block
// Auth: Required (must be author or admin)
Response: { success: boolean }

// POST /api/posts/[id]/blocks/reorder - Reorder all blocks
// Auth: Required (must be author or admin)
Body: { blocks: Array<{ id, order_index }> }
Response: { success: boolean }
```

### Upvote Management

```typescript
// POST /api/posts/[id]/upvote - Toggle upvote (add or remove)
// Auth: Required (Bearer token)
// Pattern: Check if exists -> DELETE or INSERT
Response: {
  upvoted: boolean, // true if upvoted, false if removed
  upvote_count: number
}

// Implementation:
// 1. Verify auth with createClient().auth.getUser(token)
// 2. Try INSERT with ON CONFLICT DO NOTHING
// 3. If affected rows = 0, then DELETE instead
// 4. Update cached upvote_count in posts table
// 5. Return new state

// GET /api/posts/[id]/upvotes - Get upvote status
// Auth: Optional
Response: {
  upvote_count: number,
  user_has_upvoted: boolean // only if authenticated
}
```

## Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_upvotes ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Public can view published posts"
  ON public.posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors can view own posts"
  ON public.posts FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Members can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = author_id);

-- Post blocks policies (inherit from post ownership)
CREATE POLICY "Users can view blocks of accessible posts"
  ON public.post_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_blocks.post_id
        AND (posts.status = 'published' OR posts.author_id = auth.uid())
    )
  );

CREATE POLICY "Post authors can manage blocks"
  ON public.post_blocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_blocks.post_id
        AND posts.author_id = auth.uid()
    )
  );

-- Upvotes policies
CREATE POLICY "Anyone can view upvotes"
  ON public.post_upvotes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert own upvotes"
  ON public.post_upvotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own upvotes"
  ON public.post_upvotes FOR DELETE
  USING (auth.uid() = user_id);
```

## Dashboard Integration

### User Dashboard Enhancements

**New Section: "My Posts"**
- Location: `/dashboard/posts`
- Similar to Projects Dashboard pattern in [src/app/dashboard/projects/page.tsx](src/app/dashboard/projects/page.tsx)
- Features:
  - List user's posts (draft, published, archived)
  - Quick actions: Edit, Delete, Publish/Unpublish
  - Post statistics: views, reading time, **upvote count**
  - Search and filter by category/status
  - Tabs: "My Posts" | "All Posts" (with upvote comparison)

**Post Editor:**
- Location: `/dashboard/posts/new` and `/dashboard/posts/[id]/edit`
- Block-based editor with drag & drop reordering
- Real-time word count validation
- Auto-save functionality
- Preview mode
- Related posts selector (dropdown showing max 2)

### Admin Dashboard Enhancements

**Posts Management Section:**
- Location: `/admin/posts`
- Features:
  - All posts overview with moderation capabilities
  - Bulk actions (publish, archive, delete)
  - Featured posts management
  - Category-based filtering
  - Author performance analytics
  - Sort by upvote count

## Frontend Components

### Editor Components

```typescript
// Main post editor
<PostEditor
  post={post}
  onSave={handleSave}
  onPublish={handlePublish}
  autoSave={true}
/>

// Block editor with constraint validation
<BlockEditor
  blocks={blocks}
  onBlockAdd={handleAddBlock}
  onBlockUpdate={handleUpdateBlock}
  onBlockDelete={handleDeleteBlock}
  onReorder={handleReorder}
  constraints={{
    maxTextWords: 800,
    maxImages: 5,
    noConsecutiveText: true
  }}
/>

// Individual block components
<TextBlock content={content} onUpdate={onUpdate} />
<QuoteBlock content={content} onUpdate={onUpdate} />
<ImageBlock content={content} onUpdate={onUpdate} />
<YouTubeBlock content={content} onUpdate={onUpdate} />

// Upvote button component (similar to like button pattern)
<UpvoteButton
  postId={postId}
  upvoteCount={upvoteCount}
  hasUpvoted={hasUpvoted}
  onToggle={handleUpvoteToggle}
  disabled={!isAuthenticated}
/>

// Related posts selector
<RelatedPostsSelector
  currentPostId={postId}
  selectedIds={[related_post_id_1, related_post_id_2]}
  onSelect={handleSelectRelated}
  maxSelections={2}
/>
```

### Content Validation

```typescript
// Block validation rules
const VALIDATION_RULES = {
  text: {
    maxWords: 800,
    requireContent: true
  },
  quote: {
    maxQuoteLength: 500,
    requireQuote: true
  },
  image: {
    requireImageId: true,
    maxCaptionLength: 200
  },
  youtube: {
    requireValidUrl: true,
    urlPattern: /^https:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+/
  }
}

// Post-level validation
const POST_CONSTRAINTS = {
  maxImageBlocks: 5,
  noConsecutiveTextBlocks: true,
  minBlocks: 1,
  maxBlocks: 15,
  maxRelatedPosts: 2,
  requiredFields: ['title', 'summary', 'thumbnail_image_id', 'category']
}

// Validation helper
function validateBlocks(blocks: PostBlock[]): ValidationResult {
  let imageCount = 0
  let previousWasText = false

  for (const block of blocks) {
    if (block.type === 'image') {
      imageCount++
      if (imageCount > POST_CONSTRAINTS.maxImageBlocks) {
        return { valid: false, error: `Maximum ${POST_CONSTRAINTS.maxImageBlocks} images allowed` }
      }
    }

    if (block.type === 'text') {
      if (previousWasText) {
        return { valid: false, error: 'Cannot have consecutive text blocks' }
      }
      previousWasText = true
    } else {
      previousWasText = false
    }
  }

  return { valid: true }
}
```

## Implementation Phases

### Phase 1: Database & API Foundation (Week 1)
1. **Database Migration**
   - Create posts, post_blocks, post_upvotes tables
   - Set up RLS policies
   - Create indexes for performance
   - Test constraints and triggers

2. **Basic API Routes**
   - Posts CRUD operations (`/api/posts`, `/api/posts/[id]`)
   - Block management endpoints (`/api/posts/[id]/blocks`)
   - Upvote toggle endpoint (`/api/posts/[id]/upvote`)
   - Follow Projects authentication pattern with `getUser(token)`

### Phase 2: Block Editor System (Week 2)
1. **Block Components**
   - Text editor with word count (using rich text library like TipTap or Lexical)
   - Quote input component
   - Image upload integration (use existing system)
   - YouTube URL validation

2. **Editor Interface**
   - Block reordering with drag & drop (using dnd-kit or react-beautiful-dnd)
   - Constraint validation with real-time feedback
   - Auto-save functionality (debounced, every 30s)

### Phase 3: Dashboard Integration (Week 3)
1. **User Dashboard**
   - Posts management page (`/dashboard/posts`)
   - Post editor interface (`/dashboard/posts/[id]/edit`)
   - Draft/publish workflow
   - Preview mode

2. **Admin Dashboard**
   - Posts moderation interface (`/admin/posts`)
   - Featured posts management
   - User upvote comparison view

### Phase 4: Public Interface & Migration (Week 4)
1. **Public Pages**
   - Updated news listing page (`/news`) with sort by upvotes
   - Individual post display (`/news/[slug]`) with upvote button
   - Related posts functionality
   - SEO optimization

2. **Content Migration**
   - Script to migrate existing Markdown files to database
   - Preserve existing URLs with redirects
   - Verify SEO metadata

## Technical Considerations

### Performance Optimization
- **Pagination** for posts listing (20 per page)
- **Lazy loading** for block content
- **Image optimization** using existing Next.js Image component
- **Caching** for published posts (cached upvote_count for fast sorting)
- **Search indexing** for content discovery (PostgreSQL full-text search)
- **Database indexes** on frequently queried columns

### Security & Validation
- **RLS policies** for post access control and upvote operations
- **Content sanitization** for XSS prevention (DOMPurify for HTML content)
- **Rate limiting** for API endpoints (especially upvote to prevent spam)
- **File upload validation** through existing image system
- **YouTube API integration** for video metadata validation
- **Duplicate upvote prevention** via database unique constraints
- **Authentication required** for upvoting

### SEO & Accessibility
- **Meta tags generation** from post metadata (title, summary, thumbnail)
- **Structured data** for rich snippets (Article schema)
- **Alt text support** for images
- **Reading time calculation** (250 words per minute average)
- **Sitemap generation** for posts

### Migration Strategy
- **Gradual rollout** starting with new posts
- **Backward compatibility** for existing URLs
- **Content export/import** tools for admins
- **Rollback plan** if issues arise

## Success Metrics

### User Engagement
- **Post creation rate** by members
- **Content consumption** (views, reading time)
- **User retention** in dashboard
- **Feature adoption** rate
- **Upvote participation rate** - % of users who vote on posts
- **Average upvotes per post**

### Content Quality
- **Post completion rate** (draft to published)
- **Block usage distribution**
- **Content length and engagement correlation**
- **Related posts click-through rate**
- **Upvote-to-view ratio** - quality indicator

### Technical Performance
- **Page load times** for posts (target: < 2s)
- **API response times** (target: < 200ms)
- **Auto-save reliability** (target: 99% success rate)
- **Image upload success rate** (target: 99%)

---

This comprehensive plan provides the foundation for implementing a modern, user-friendly posts management system that integrates seamlessly with the existing The Noders PTNK architecture while providing the flexibility and features needed for dynamic content creation.