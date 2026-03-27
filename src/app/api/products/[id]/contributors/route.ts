import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// Helper function to check if user is project owner
async function isProjectOwner(supabase: any, projectId: string, userId: string): Promise<boolean> {
  const { data: project } = await supabase
    .from('projects')
    .select('created_by')
    .eq('id', projectId)
    .single()

  return project?.created_by === userId
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = createClient()

    const { data: contributors, error } = await supabase
      .from('project_contributors')
      .select(`
        id,
        contribution_percentage,
        role_in_project,
        created_at,
        profiles(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('project_id', id)
      .order('contribution_percentage', { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      contributors: contributors || []
    })

  } catch (error) {
    console.error('Error fetching contributors:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: projectId } = params

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

    // Check if user is project owner
    const isOwner = await isProjectOwner(supabase, projectId, user.id)
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Only project owners can manage contributors' },
        { status: 403 }
      )
    }

    // Parse request body
    const contributorData = await request.json()
    const { user_id, contribution_percentage = 0, role_in_project = 'Contributor' } = contributorData

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate contribution percentage
    if (contribution_percentage < 0 || contribution_percentage > 100) {
      return NextResponse.json(
        { success: false, error: 'Contribution percentage must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: userExists } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user_id)
      .single()

    if (!userExists) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is already a contributor
    const { data: existingContributor } = await supabase
      .from('project_contributors')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', user_id)
      .single()

    if (existingContributor) {
      return NextResponse.json(
        { success: false, error: 'User is already a contributor to this project' },
        { status: 400 }
      )
    }

    // Check total contribution percentage doesn't exceed 100%
    const { data: currentContributors } = await supabase
      .from('project_contributors')
      .select('contribution_percentage')
      .eq('project_id', projectId) as { data: any[] | null }

    const totalPercentage = (currentContributors || [])
      .reduce((sum, c) => sum + (c.contribution_percentage || 0), 0) + contribution_percentage

    if (totalPercentage > 100) {
      return NextResponse.json(
        { success: false, error: `Total contribution percentage would exceed 100% (current: ${totalPercentage - contribution_percentage}%)` },
        { status: 400 }
      )
    }

    // Add contributor
    const { data: newContributor, error: insertError } = await supabase
      .from('project_contributors')
      .insert({
        project_id: projectId,
        user_id,
        contribution_percentage,
        role_in_project
      } as any)
      .select(`
        id,
        contribution_percentage,
        role_in_project,
        created_at,
        profiles(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (insertError) {
      return NextResponse.json(
        { success: false, error: 'Failed to add contributor: ' + insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Contributor added successfully',
      contributor: newContributor
    })

  } catch (error) {
    console.error('Error adding contributor:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: projectId } = params

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

    // Check if user is project owner
    const isOwner = await isProjectOwner(supabase, projectId, user.id)
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Only project owners can manage contributors' },
        { status: 403 }
      )
    }

    // Parse request body
    const updates = await request.json()
    const { contributor_id, contribution_percentage, role_in_project } = updates

    if (!contributor_id) {
      return NextResponse.json(
        { success: false, error: 'Contributor ID is required' },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: any = {}
    if (contribution_percentage !== undefined) {
      if (contribution_percentage < 0 || contribution_percentage > 100) {
        return NextResponse.json(
          { success: false, error: 'Contribution percentage must be between 0 and 100' },
          { status: 400 }
        )
      }
      updateData.contribution_percentage = contribution_percentage
    }
    if (role_in_project !== undefined) {
      updateData.role_in_project = role_in_project
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid update fields provided' },
        { status: 400 }
      )
    }

    // Update contributor
    const { data: updatedContributor, error: updateError } = await (supabase as any)
      .from('project_contributors')
      .update(updateData)
      .eq('id', contributor_id)
      .eq('project_id', projectId)
      .select(`
        id,
        contribution_percentage,
        role_in_project,
        created_at,
        profiles(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to update contributor: ' + updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Contributor updated successfully',
      contributor: updatedContributor
    })

  } catch (error) {
    console.error('Error updating contributor:', error)
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
    const { id: projectId } = params
    const { searchParams } = new URL(request.url)
    const contributorId = searchParams.get('contributor_id')

    if (!contributorId) {
      return NextResponse.json(
        { success: false, error: 'Contributor ID is required' },
        { status: 400 }
      )
    }

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

    // Check if user is project owner
    const isOwner = await isProjectOwner(supabase, projectId, user.id)
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Only project owners can manage contributors' },
        { status: 403 }
      )
    }

    // Check if contributor exists and belongs to this project
    const { data: contributor } = await supabase
      .from('project_contributors')
      .select('user_id')
      .eq('id', contributorId)
      .eq('project_id', projectId)
      .single() as { data: { user_id: string } | null }

    if (!contributor) {
      return NextResponse.json(
        { success: false, error: 'Contributor not found in this project' },
        { status: 404 }
      )
    }

    // Prevent removing the project creator
    if (contributor.user_id === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove project creator from contributors' },
        { status: 400 }
      )
    }

    // Remove contributor
    const { error: deleteError } = await supabase
      .from('project_contributors')
      .delete()
      .eq('id', contributorId)
      .eq('project_id', projectId)

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: 'Failed to remove contributor: ' + deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Contributor removed successfully'
    })

  } catch (error) {
    console.error('Error removing contributor:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}