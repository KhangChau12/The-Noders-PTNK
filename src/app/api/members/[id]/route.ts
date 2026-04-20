import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { MemberTaskStat, ProfileWithProjects } from '@/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const [profileResult, projectsResult, taskRowsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single(),
      supabase
        .from('project_contributors')
        .select(`
          id,
          project_id,
          user_id,
          contribution_percentage,
          role_in_project,
          created_at,
          projects (
            *
          )
        `)
        .eq('user_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('task_log_members')
        .select(`
          points,
          task_logs (
            task_name,
            task_description,
            points
          )
        `)
        .eq('member_id', id)
    ])

    const { data: profile, error: profileError } = profileResult
    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      )
    }

    const { data: contributions, error: projectsError } = projectsResult
    if (projectsError) {
      return NextResponse.json(
        { success: false, error: projectsError.message },
        { status: 500 }
      )
    }

    const { data: taskRows, error: taskRowsError } = taskRowsResult
    if (taskRowsError) {
      return NextResponse.json(
        { success: false, error: taskRowsError.message },
        { status: 500 }
      )
    }

    const taskStatsMap = new Map<string, MemberTaskStat>()
    let totalPoints = 0

    ;(taskRows || []).forEach((row: any) => {
      const taskName = row.task_logs?.task_name || 'Untitled Task'
      const awardedPoints = Number(row.points ?? row.task_logs?.points ?? 0)

      totalPoints += awardedPoints

      const existing = taskStatsMap.get(taskName)
      if (existing) {
        existing.repetitions += 1
        existing.total_points += awardedPoints
      } else {
        taskStatsMap.set(taskName, {
          task_name: taskName,
          repetitions: 1,
          total_points: awardedPoints,
        })
      }
    })

    const taskStats = Array.from(taskStatsMap.values()).sort(
      (a, b) => b.total_points - a.total_points || b.repetitions - a.repetitions || a.task_name.localeCompare(b.task_name)
    )

    const member: ProfileWithProjects = {
      ...(profile as ProfileWithProjects),
      contributed_projects: (contributions || []) as ProfileWithProjects['contributed_projects'],
      total_points: totalPoints,
      task_stats: taskStats,
    }

    return NextResponse.json({
      success: true,
      member,
      task_stats: taskStats,
      total_points: totalPoints,
    })
  } catch (error) {
    console.error('Error fetching member detail:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
