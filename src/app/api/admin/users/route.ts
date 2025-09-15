import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check auth token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No auth token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient()

    // Get current user to verify admin access
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if current user is admin
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single() as { data: { role: string } | null }

    if (!currentProfile || currentProfile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    // Get all auth users using admin client
    const adminSupabase = createAdminClient()
    const { data: authUsers, error: listUsersError } = await adminSupabase.auth.admin.listUsers()

    if (listUsersError) {
      return NextResponse.json(
        { success: false, error: listUsersError.message },
        { status: 500 }
      )
    }

    // Get all profiles using admin client
    const { data: profiles, error: profilesError } = await adminSupabase
      .from('profiles')
      .select('*') as { data: any[] | null, error: any }

    if (profilesError) {
      return NextResponse.json(
        { success: false, error: profilesError.message },
        { status: 500 }
      )
    }

    // Combine auth users with profiles
    const users = authUsers.users.map(authUser => {
      const profile = profiles?.find(p => p.id === authUser.id)
      return {
        id: authUser.id,
        email: authUser.email,
        email_confirmed_at: authUser.email_confirmed_at,
        last_sign_in_at: authUser.last_sign_in_at,
        created_at: authUser.created_at,
        profile: profile || null
      }
    })

    return NextResponse.json({
      success: true,
      users,
      total: users.length
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // Check auth token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No auth token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient()

    // Get current user to verify admin access
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if current user is admin
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single() as { data: { role: string } | null }

    if (!currentProfile || currentProfile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    // Prevent admin from deleting themselves
    if (userId === currentUser.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Delete user's profile first using admin client
    const adminSupabaseForDelete = createAdminClient()
    const { error: profileError } = await adminSupabaseForDelete
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete profile: ' + profileError.message },
        { status: 500 }
      )
    }

    // Delete auth user using admin client
    const adminSupabase = createAdminClient()
    const { error: deleteUserError } = await adminSupabase.auth.admin.deleteUser(userId)

    if (deleteUserError) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete user: ' + deleteUserError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}