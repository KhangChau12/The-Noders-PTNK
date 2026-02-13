import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase'

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No auth token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient()

    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      )
    }

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

    const body = await request.json()
    const { userId, contest_count } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    if (typeof contest_count !== 'number' || contest_count < 0 || !Number.isInteger(contest_count)) {
      return NextResponse.json(
        { success: false, error: 'contest_count must be a non-negative integer' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()
    const { data, error: updateError } = await adminSupabase
      .from('profiles')
      .update({ contest_count })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to update contest count: ' + updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      contest_count: data.contest_count
    })
  } catch (error) {
    console.error('Error updating contest count:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
