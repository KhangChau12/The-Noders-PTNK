import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// GET /api/admin/stats - Get admin dashboard statistics
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

    // Verify user and check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Set session for RLS
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: token
    })

    // Fetch all stats in parallel for better performance
    const [
      membersResult,
      projectsResult,
      postsResult,
      postStatsResult
    ] = await Promise.all([
      // Total members and admins
      supabase.from('profiles').select('id, role', { count: 'exact' }),

      // Total projects and active projects
      supabase.from('projects').select('id, status', { count: 'exact' }),

      // Total posts by status (need to fetch data to filter by status)
      supabase.from('posts').select('id, status'),

      // Sum of views and upvotes
      supabase.from('posts')
        .select('view_count, upvote_count')
        .eq('status', 'published')
    ])

    // Calculate member stats
    const totalMembers = membersResult.count || 0
    const adminCount = membersResult.data?.filter(m => m.role === 'admin').length || 0

    // Calculate project stats
    const totalProjects = projectsResult.count || 0
    const activeProjects = projectsResult.data?.filter(p => p.status === 'active').length || 0

    // Calculate post stats
    const totalPosts = postsResult.data?.filter(p => p.status === 'published').length || 0
    const draftPosts = postsResult.data?.filter(p => p.status === 'draft').length || 0

    // Calculate views and upvotes
    const totalViews = postStatsResult.data?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0
    const totalUpvotes = postStatsResult.data?.reduce((sum, post) => sum + (post.upvote_count || 0), 0) || 0

    return NextResponse.json({
      success: true,
      stats: {
        totalMembers,
        adminCount,
        totalProjects,
        activeProjects,
        totalPosts,
        draftPosts,
        totalViews,
        totalUpvotes
      }
    })

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
