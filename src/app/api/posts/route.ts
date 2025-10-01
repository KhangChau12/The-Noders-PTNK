import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// GET /api/posts - List posts with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const author = searchParams.get('author')
    const search = searchParams.get('search')
    const slug = searchParams.get('slug')
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = createClient()

    // Build query
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        ),
        thumbnail_image:images!posts_thumbnail_image_id_fkey(
          id,
          filename,
          public_url,
          width,
          height,
          alt_text
        )
      `, { count: 'exact' })

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    } else {
      // By default, only show published posts for non-authenticated users
      // RLS will handle showing drafts to authors
      query = query.eq('status', 'published')
    }

    if (author) {
      query = query.eq('author_id', author)
    }

    if (slug) {
      query = query.eq('slug', slug)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`)
    }

    // Apply sorting
    if (sortBy === 'upvote_count') {
      query = query.order('upvote_count', { ascending: false })
    } else if (sortBy === 'view_count') {
      query = query.order('view_count', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    const { data: posts, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      posts: posts || [],
      total: count || 0,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No auth token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Create client for authentication check
    const authClient = createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    // Create a new client with the session for RLS
    const supabase = createClient()
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: token // Using same token as refresh for API routes
    })

    // Parse request body
    const postData = await request.json()
    const {
      title,
      summary,
      thumbnail_image_id,
      category,
      slug
    } = postData

    // Validate title length (optional but if provided must be valid)
    if (title && title.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Title must be 100 characters or less' },
        { status: 400 }
      )
    }

    // Validate summary length (optional but if provided must be valid)
    if (summary && summary.length > 300) {
      return NextResponse.json(
        { success: false, error: 'Summary must be 300 characters or less' },
        { status: 400 }
      )
    }

    // Validate category (optional but if provided must be valid)
    const validCategories = ['News', 'You may want to know', 'Member Spotlight', 'Community Activities']
    if (category && !validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Generate slug from title if not provided
    const postSlug = slug || (title
      ? title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          + '-' + Date.now()
      : 'untitled-' + Date.now())

    // Create post
    const { data: newPost, error: postError } = await supabase
      .from('posts')
      .insert({
        title: title || null,
        summary: summary || null,
        thumbnail_image_id: thumbnail_image_id || null,
        category: category || null,
        slug: postSlug,
        author_id: user.id,
        status: 'draft',
        reading_time: 0,
        view_count: 0,
        upvote_count: 0,
        featured: false
      })
      .select()
      .single()

    if (postError) {
      return NextResponse.json(
        { success: false, error: 'Failed to create post: ' + postError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      post: newPost
    })

  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}