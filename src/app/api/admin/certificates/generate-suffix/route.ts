import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const SIMPLE_CERTIFICATE_PATTERN = /^C(\d{4})$/

// GET /api/admin/certificates/generate-suffix - Get next sequential certificate number
export async function GET(request: NextRequest) {
  try {
    // Check authentication
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

    const { data, error } = await supabase
      .from('certificates')
      .select('certificate_id')
      .like('certificate_id', 'C%')

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    let maxSequence = -1
    for (const row of data || []) {
      const match = SIMPLE_CERTIFICATE_PATTERN.exec(row.certificate_id)
      if (!match) continue

      const sequence = parseInt(match[1], 10)
      if (!Number.isNaN(sequence)) {
        maxSequence = Math.max(maxSequence, sequence)
      }
    }

    if (maxSequence >= 9999) {
      return NextResponse.json(
        { success: false, error: 'Certificate range is full (C0000-C9999)' },
        { status: 400 }
      )
    }

    const suffix = String(maxSequence + 1).padStart(4, '0')

    return NextResponse.json({
      success: true,
      suffix,
      certificate_id: `C${suffix}`
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error generating suffix:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  }
}
