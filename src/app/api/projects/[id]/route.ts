import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Helper function to check if user can modify project
async function canUserModifyProject(supabase: any, projectId: string, userId: string): Promise<{ canModify: boolean, isOwner: boolean, error?: string }> {
  // Check if user is the creator
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('created_by')
    .eq('id', projectId)
    .single()

  if (projectError) {
    return { canModify: false, isOwner: false, error: 'Project not found' }
  }

  const isOwner = project.created_by === userId

  if (isOwner) {
    return { canModify: true, isOwner: true }
  }

  // Check if user is a contributor
  const { data: contributor } = await supabase
    .from('project_contributors')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single()

  return { canModify: !!contributor, isOwner: false }
}

// GET method removed - now using direct database queries in queries.ts

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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

    // Check permissions
    const { canModify, isOwner, error: permError } = await canUserModifyProject(supabase, id, user.id)
    if (!canModify) {
      return NextResponse.json(
        { success: false, error: permError || 'You do not have permission to modify this project' },
        { status: 403 }
      )
    }

    // Parse request body
    const updates = await request.json()
    const allowedFields = [
      'title', 'description', 'details', 'thumbnail_url', 'thumbnail_image_id', 'video_url',
      'repo_url', 'demo_url', 'tech_stack', 'status'
    ]

    // Filter only allowed fields
    const projectUpdates: any = {}
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        projectUpdates[key] = updates[key]
      }
    })

    // Only owners can change certain fields
    const ownerOnlyFields = ['status']
    if (!isOwner) {
      ownerOnlyFields.forEach(field => {
        delete projectUpdates[field]
      })
    }

    // Validate URLs if provided
    const urlFields = ['repo_url', 'demo_url', 'thumbnail_url', 'video_url']
    for (const field of urlFields) {
      if (projectUpdates[field] && typeof projectUpdates[field] === 'string') {
        try {
          new URL(projectUpdates[field])
        } catch {
          return NextResponse.json(
            { success: false, error: `Invalid URL for ${field}` },
            { status: 400 }
          )
        }
      }
    }

    // Add updated timestamp
    projectUpdates.updated_at = new Date().toISOString()

    // Update project
    const { data: updatedProject, error: updateError } = await (supabase as any)
      .from('projects')
      .update(projectUpdates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to update project: ' + updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    })

  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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

    // Check if user is owner (only owners can delete)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('created_by')
      .eq('id', id)
      .single()

    if (projectError) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    if ((project as any).created_by !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Only project creators can delete projects' },
        { status: 403 }
      )
    }

    // Delete project (contributors will be cascade deleted)
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete project: ' + deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}