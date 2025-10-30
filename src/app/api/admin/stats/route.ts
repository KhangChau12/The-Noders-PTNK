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
      postStatsResult,
      postsByCategoryResult,
      recentPostsResult,
      recentProjectsResult,
      newMembersResult
    ] = await Promise.all([
      // Total members and admins
      supabase.from('profiles').select('id, role', { count: 'exact' }),

      // Total projects and active projects
      supabase.from('projects').select('id, status', { count: 'exact' }),

      // Total posts by status
      supabase.from('posts').select('id, status', { count: 'exact' }),

      // Sum of views and upvotes
      supabase.from('posts')
        .select('view_count, upvote_count')
        .eq('status', 'published'),

      // Posts by category
      supabase.from('posts')
        .select('category')
        .eq('status', 'published'),

      // Recent posts (5 latest)
      supabase.from('posts')
        .select(`
          id,
          title,
          title_vi,
          status,
          created_at,
          author:profiles!posts_author_id_fkey(
            full_name,
            username
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5),

      // Recent projects (5 latest)
      supabase.from('projects')
        .select(`
          id,
          title,
          status,
          created_at,
          created_by_profile:profiles!projects_created_by_fkey(
            full_name,
            username
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5),

      // New members (5 latest)
      supabase.from('profiles')
        .select('id, full_name, username, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
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

    // Calculate posts by category
    const postsByCategory = {
      'News': 0,
      'You may want to know': 0,
      'Member Spotlight': 0,
      'Community Activities': 0
    }
    postsByCategoryResult.data?.forEach(post => {
      if (post.category in postsByCategory) {
        postsByCategory[post.category as keyof typeof postsByCategory]++
      }
    })

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
        totalUpvotes,
        postsByCategory
      },
      recentPosts: recentPostsResult.data || [],
      recentProjects: recentProjectsResult.data || [],
      newMembers: newMembersResult.data || []
    })

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
