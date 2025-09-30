import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get projects count
    const { count: projectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get members count
    const { count: membersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // For posts, we'll use a simple count for now since we don't have a posts table yet
    // You can replace this with actual posts count when you have the table
    const postsCount = 25 // This will be replaced with real count later

    // For workshops, we'll set to 1 as requested
    const workshopsCount = 1

    const stats = {
      activeProjects: projectsCount || 0,
      activeMembers: membersCount || 0,
      postsShared: postsCount,
      workshopsHeld: workshopsCount
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}