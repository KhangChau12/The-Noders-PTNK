import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    // Fetch profiles
    let query = supabase
      .from('profiles')
      .select('*')
      .limit(50)

    if (role && role !== 'all') {
      query = query.eq('role', role)
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`)
    }

    const { data: profiles, error: profilesError } = await query

    if (profilesError || !profiles) {
      return NextResponse.json(
        { success: false, error: profilesError?.message || 'Failed to fetch profiles' },
        { status: 500 }
      )
    }

    const memberIds = profiles.map(p => p.id)

    // Fetch project contributions count
    const { data: contributions } = await supabase
      .from('project_contributors')
      .select('user_id')
      .in('user_id', memberIds)

    const contributionCounts: Record<string, number> = {}
    contributions?.forEach(contrib => {
      contributionCounts[contrib.user_id] = (contributionCounts[contrib.user_id] || 0) + 1
    })

    // Fetch posts count
    const { data: posts } = await supabase
      .from('posts')
      .select('author_id')
      .eq('status', 'published')
      .in('author_id', memberIds)

    const postCounts: Record<string, number> = {}
    posts?.forEach(post => {
      postCounts[post.author_id] = (postCounts[post.author_id] || 0) + 1
    })

    console.log(posts);

    // Fetch emails from auth.users using admin client
    const { data: usersData } = await supabase.auth.admin.listUsers()
    const emailMap: Record<string, string> = {}
    usersData?.users?.forEach(user => {
      if (user.email) {
        emailMap[user.id] = user.email
      }
    })

    // Map members with their data
    const membersWithData = profiles.map(member => ({
      ...member,
      email: emailMap[member.id] || null,
      contributed_projects: Array(contributionCounts[member.id] || 0).fill({}),
      posts_count: postCounts[member.id] || 0,
      total_contributions: (contributionCounts[member.id] || 0) + (postCounts[member.id] || 0)
    }))

    // Sort: Admins first, then by total contributions
    const sortedMembers = membersWithData.sort((a, b) => {
      if (a.role === 'admin' && b.role !== 'admin') return -1
      if (a.role !== 'admin' && b.role === 'admin') return 1
      return b.total_contributions - a.total_contributions
    })

    return NextResponse.json(
      { success: true, members: sortedMembers },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  } catch (error: any) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
