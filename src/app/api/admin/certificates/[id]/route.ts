import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// DELETE /api/admin/certificates/[id] - Delete a certificate (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Set session for RLS
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: token
    })

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Delete certificate
    const { error: deleteError } = await supabase
      .from('certificates')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting certificate:', deleteError)
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Certificate deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting certificate:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/admin/certificates/[id] - Get single certificate (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Set session for RLS
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: token
    })

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get certificate
    const { data: certificate, error } = await supabase
      .from('certificates')
      .select(`
        id,
        certificate_id,
        gen_number,
        suffix,
        file_url,
        file_type,
        title,
        description,
        issued_at,
        created_at,
        member:profiles!certificates_user_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        ),
        issuer:profiles!certificates_issued_by_fkey(
          id,
          username,
          full_name
        ),
        image:images!certificates_image_id_fkey(
          id,
          public_url,
          mime_type
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching certificate:', error)
      return NextResponse.json(
        { success: false, error: 'Certificate not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      certificate
    })

  } catch (error) {
    console.error('Error fetching certificate:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
