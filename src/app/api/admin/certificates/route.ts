import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// GET /api/admin/certificates - Get all certificates (admin only)
export async function GET(request: NextRequest) {
  try {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const genNumber = searchParams.get('gen')

    // Build query
    let query = supabase
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
      .order('issued_at', { ascending: false })

    // Apply filters
    if (genNumber && genNumber !== 'all') {
      query = query.eq('gen_number', parseInt(genNumber))
    }

    const { data: certificates, error } = await query

    if (error) {
      console.error('Error fetching certificates:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Filter by search in memory (for member name)
    let filteredCerts = certificates || []
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase()
      filteredCerts = filteredCerts.filter(cert =>
        cert.certificate_id.toLowerCase().includes(searchLower) ||
        (cert.member as { full_name?: string })?.full_name?.toLowerCase().includes(searchLower) ||
        (cert.member as { username?: string })?.username?.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      success: true,
      certificates: filteredCerts
    })

  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/certificates - Create new certificate (admin only)
export async function POST(request: NextRequest) {
  try {
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

    // Parse request body
    const body = await request.json()
    const {
      user_id,
      gen_number,
      suffix,
      image_id,
      file_url,
      file_type = 'image',
      title = 'Course Completion Certificate',
      description
    } = body

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'Member (user_id) is required' },
        { status: 400 }
      )
    }

    if (gen_number === undefined || gen_number === null) {
      return NextResponse.json(
        { success: false, error: 'Generation number is required' },
        { status: 400 }
      )
    }

    // Generate or validate suffix
    let finalSuffix = suffix
    if (!finalSuffix) {
      // Generate random 4-character suffix
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      finalSuffix = ''
      for (let i = 0; i < 4; i++) {
        finalSuffix += chars.charAt(Math.floor(Math.random() * chars.length))
      }
    } else {
      // Validate suffix format
      if (!/^[A-Z0-9]{4}$/.test(finalSuffix.toUpperCase())) {
        return NextResponse.json(
          { success: false, error: 'Suffix must be exactly 4 alphanumeric characters' },
          { status: 400 }
        )
      }
      finalSuffix = finalSuffix.toUpperCase()
    }

    // Generate certificate ID
    const certificate_id = `TN-GEN${gen_number}-${finalSuffix}`

    // Check if certificate ID already exists
    const { data: existing } = await supabase
      .from('certificates')
      .select('id')
      .eq('certificate_id', certificate_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Certificate ID ${certificate_id} already exists. Please try a different suffix.` },
        { status: 400 }
      )
    }

    // Create certificate
    const { data: certificate, error: createError } = await supabase
      .from('certificates')
      .insert({
        certificate_id,
        user_id,
        gen_number,
        suffix: finalSuffix,
        image_id: image_id || null,
        file_url: file_url || null,
        file_type,
        title,
        description: description || null,
        issued_by: user.id,
        issued_at: new Date().toISOString()
      })
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
        )
      `)
      .single()

    if (createError) {
      console.error('Error creating certificate:', createError)
      return NextResponse.json(
        { success: false, error: createError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      certificate
    })

  } catch (error) {
    console.error('Error creating certificate:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
