import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// GET /api/admin/posts - Get all posts (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient()

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Set session for RLS FIRST
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: token
    })

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const category = searchParams.get('category')

    // Build query
    let query = supabase
      .from('posts')
      .select(`
        id,
        title,
        title_vi,
        summary,
        summary_vi,
        slug,
        status,
        category,
        created_at,
        updated_at,
        view_count,
        upvote_count,
        reading_time,
        featured,
        author:profiles!posts_author_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        ),
        thumbnail_image:images!posts_thumbnail_image_id_fkey(
          id,
          public_url,
          alt_text
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (search && search.trim() !== '') {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,title_vi.ilike.%${search}%,summary_vi.ilike.%${search}%`)
    }

    const { data: posts, error } = await query

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      posts: posts || []
    })

  } catch (error) {
    console.error('Error fetching admin posts:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
