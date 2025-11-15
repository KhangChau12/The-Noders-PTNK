import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Use anonymous client for public project listing
    const supabase = createClient()

    // Build query with full relationships including thumbnail image
    let query = supabase
      .from('projects')
      .select(`
        *,
        created_by_profile:profiles!projects_created_by_fkey1(
          username,
          full_name,
          avatar_url
        ),
        project_contributors(
          contribution_percentage,
          role_in_project,
          profiles(username, full_name, avatar_url)
        ),
        thumbnail_image:images(
          id,
          filename,
          public_url,
          width,
          height,
          alt_text
        )
      `)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: projects, error } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Map project_contributors to contributors for consistency
    const projectsWithContributors = projects?.map(project => ({
      ...project,
      contributors: project.project_contributors || []
    })) || []

    return NextResponse.json({
      success: true,
      projects: projectsWithContributors,
      total: projectsWithContributors.length
    })

  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const supabase = createClient()

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    // Parse request body
    const projectData = await request.json()
    const {
      title,
      description,
      details,
      thumbnail_url,
      thumbnail_image_id,
      video_url,
      repo_url,
      demo_url,
      tech_stack,
      contributors = []
    } = projectData

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Validate URLs if provided
    const urlFields = { repo_url, demo_url, thumbnail_url, video_url }
    for (const [field, url] of Object.entries(urlFields)) {
      if (url && typeof url === 'string') {
        try {
          new URL(url)
        } catch {
          return NextResponse.json(
            { success: false, error: `Invalid URL for ${field}` },
            { status: 400 }
          )
        }
      }
    }

    // Create project
    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert({
        title,
        description,
        details: details || null,
        thumbnail_url: thumbnail_url || null,
        thumbnail_image_id: thumbnail_image_id || null,
        video_url: video_url || null,
        repo_url: repo_url || null,
        demo_url: demo_url || null,
        tech_stack: tech_stack || [],
        status: 'active',
        created_by: user.id
      })
      .select()
      .single()

    if (projectError) {
      return NextResponse.json(
        { success: false, error: 'Failed to create project: ' + projectError.message },
        { status: 500 }
      )
    }

    // Add contributors if provided
    if (contributors.length > 0) {
      const contributorData = contributors.map((c: any) => ({
        project_id: newProject.id,
        user_id: c.user_id,
        contribution_percentage: c.contribution_percentage || 0,
        role_in_project: c.role_in_project || 'Contributor'
      }))

      const { error: contributorError } = await supabase
        .from('project_contributors')
        .insert(contributorData)

      if (contributorError) {
        console.error('Error adding contributors:', contributorError)
        // Don't fail the entire request if contributors fail
      }
    }

    // Add creator as main contributor
    await supabase
      .from('project_contributors')
      .insert({
        project_id: newProject.id,
        user_id: user.id,
        contribution_percentage: contributors.length > 0 ?
          Math.max(0, 100 - contributors.reduce((sum: number, c: any) => sum + (c.contribution_percentage || 0), 0)) : 100,
        role_in_project: 'Creator'
      })

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      project: newProject
    })

  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}