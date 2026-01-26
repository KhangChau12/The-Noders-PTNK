import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/admin/certificates/generate-suffix - Generate unique random suffix
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

    // Get gen_number from query params (optional, for checking uniqueness)
    const { searchParams } = new URL(request.url)
    const genNumber = searchParams.get('gen')

    // Generate random 4-character suffix
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let suffix = ''
    let attempts = 0
    const maxAttempts = 100

    while (attempts < maxAttempts) {
      suffix = ''
      for (let i = 0; i < 4; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length))
      }

      // If gen_number is provided, check if the certificate ID already exists
      if (genNumber) {
        const certificateId = `TN-GEN${genNumber}-${suffix}`
        const { data: existing } = await supabase
          .from('certificates')
          .select('id')
          .eq('certificate_id', certificateId)
          .single()

        if (!existing) {
          // Unique suffix found
          break
        }
      } else {
        // No gen_number provided, just return random suffix
        break
      }

      attempts++
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { success: false, error: 'Could not generate unique suffix' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      suffix
    })

  } catch (error) {
    console.error('Error generating suffix:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
