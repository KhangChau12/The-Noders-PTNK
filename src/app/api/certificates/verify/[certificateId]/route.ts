import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// GET /api/certificates/verify/[certificateId] - Public verify certificate
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params

    if (!certificateId) {
      return NextResponse.json(
        { valid: false, error: 'Certificate ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Try to find certificate by certificate_id
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
        user_id,
        issued_by
      `)
      .eq('certificate_id', certificateId.toUpperCase())
      .single()

    if (error || !certificate) {
      return NextResponse.json({
        valid: false,
        error: 'Certificate not found'
      })
    }

    // Member, issuer and image are independent: fetch them together
    const [{ data: member }, issuerRes, imageRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, social_links')
        .eq('id', certificate.user_id)
        .single(),
      certificate.issued_by
        ? supabase.from('profiles').select('id, username, full_name').eq('id', certificate.issued_by).single()
        : Promise.resolve({ data: null }),
      certificate.file_url
        ? Promise.resolve({ data: null })
        : supabase
            .from('certificates')
            .select('image:images!certificates_image_id_fkey(id, public_url, mime_type)')
            .eq('id', certificate.id)
            .single(),
    ])
    const issuer = (issuerRes as any).data
    const img = (imageRes as any).data?.image as { public_url?: string } | undefined
    const imageUrl = certificate.file_url || img?.public_url || null

    return NextResponse.json({
      valid: true,
      certificate: {
        id: certificate.id,
        certificate_id: certificate.certificate_id,
        title: certificate.title,
        description: certificate.description,
        gen_number: certificate.gen_number,
        file_url: imageUrl,
        file_type: certificate.file_type,
        issued_at: certificate.issued_at
      },
      member: member ? {
        id: member.id,
        username: member.username,
        full_name: member.full_name,
        avatar_url: member.avatar_url,
        bio: member.bio,
        social_links: member.social_links
      } : null,
      issuer: issuer ? {
        id: issuer.id,
        username: issuer.username,
        full_name: issuer.full_name
      } : null
    })

  } catch (error) {
    console.error('Error verifying certificate:', error)
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
