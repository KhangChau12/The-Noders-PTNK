import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get recent projects with contributors and creator info
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        created_by_profile:profiles!projects_created_by_fkey(
          username,
          full_name,
          avatar_url
        ),
        project_contributors(
          id,
          contribution_percentage,
          role_in_project,
          profiles(
            id,
            username,
            full_name,
            avatar_url
          )
        ),
        thumbnail_image:images(
          id,
          public_url,
          alt_text
        )
      `)
      .in('status', ['active', 'completed'])
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('Error fetching recent projects:', error)
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const transformedProjects = projects?.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      details: project.details,
      tech_stack: project.tech_stack || [],
      status: project.status,
      repo_url: project.repo_url,
      demo_url: project.demo_url,
      thumbnail_url: project.thumbnail_url,
      video_url: project.video_url,
      created_at: project.created_at,
      updated_at: project.updated_at,
      contributors: project.project_contributors || [],
      created_by_profile: project.created_by_profile,
      thumbnail_image: project.thumbnail_image
    })) || []

    return NextResponse.json({
      projects: transformedProjects,
      total: transformedProjects.length
    })
  } catch (error) {
    console.error('Error fetching recent projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}