import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/adminAuth'
import { AWARD_RANK, certificateTitle, isAward, type Award, type AwardStyle } from '@/lib/awards'

export const dynamic = 'force-dynamic'

interface Item {
  user_id: string
  award: Award
  file_url: string
  file_type: 'image' | 'pdf'
  image_id?: string | null
}

const CODE = /^C(\d{4})$/

/**
 * POST /api/admin/certificates/batch
 * Issues one event's certificates together: creates the batch (or adds to an
 * existing one), numbers winners first, and inserts every row in one go.
 */
export async function POST(request: NextRequest) {
  const access = await requireAdmin(request)
  if ('error' in access) return access.error

  const body = await request.json().catch(() => ({}))
  const items: Item[] = Array.isArray(body.items) ? body.items : []
  if (!items.length) return NextResponse.json({ success: false, error: 'Add at least one certificate' }, { status: 400 })
  for (const it of items) {
    if (!it?.user_id || !it.file_url || !isAward(it.award) || !['image', 'pdf'].includes(it.file_type)) {
      return NextResponse.json({ success: false, error: 'Every file needs a member, an award and an uploaded file' }, { status: 400 })
    }
  }

  const db: any = createAdminClient()

  // The batch: reuse one, or create it from the event fields
  let batch: { id: string; event_name: string; issued_at: string } | null = null
  if (body.batch_id) {
    const { data } = await db.from('certificate_batches').select('id, event_name, issued_at').eq('id', body.batch_id).maybeSingle()
    if (!data) return NextResponse.json({ success: false, error: 'Batch not found' }, { status: 404 })
    batch = data
  } else {
    const eventName = typeof body.event_name === 'string' ? body.event_name.trim() : ''
    const style: AwardStyle = ['places', 'medals', 'none'].includes(body.award_style) ? body.award_style : 'none'
    if (!eventName) return NextResponse.json({ success: false, error: 'Name the event' }, { status: 400 })
    const issuedAt = body.issued_at ? new Date(body.issued_at).toISOString() : new Date().toISOString()
    const { data, error } = await db
      .from('certificate_batches')
      .insert({ event_name: eventName, contest_slug: body.contest_slug || null, award_style: style, issued_at: issuedAt, created_by: access.userId })
      .select('id, event_name, issued_at')
      .single()
    if (error) {
      const hint = error.code === '42P01' ? ' Run migration 027 first.' : ''
      return NextResponse.json({ success: false, error: error.message + hint }, { status: 500 })
    }
    batch = data
  }

  const ordered = [...items].sort((a, b) => AWARD_RANK[a.award] - AWARD_RANK[b.award])

  // Number them after the highest existing C#### code; retry if someone else issued meanwhile
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: codes, error: codeError } = await db.from('certificates').select('certificate_id').like('certificate_id', 'C%')
    if (codeError) return NextResponse.json({ success: false, error: codeError.message }, { status: 500 })
    const max = (codes || []).reduce((m: number, r: { certificate_id: string }) => {
      const hit = CODE.exec(r.certificate_id)
      return hit ? Math.max(m, parseInt(hit[1], 10)) : m
    }, -1)
    if (max + ordered.length > 9999) return NextResponse.json({ success: false, error: 'Certificate range C0000–C9999 is full' }, { status: 400 })

    const rows = ordered.map((it, i) => {
      const suffix = String(max + 1 + i).padStart(4, '0')
      return {
        certificate_id: `C${suffix}`,
        suffix,
        gen_number: 0,
        user_id: it.user_id,
        award: it.award,
        batch_id: batch!.id,
        title: certificateTitle(it.award, batch!.event_name),
        file_url: it.file_url,
        file_type: it.file_type,
        image_id: it.image_id || null,
        issued_by: access.userId,
        issued_at: batch!.issued_at,
      }
    })

    const { data: created, error } = await db.from('certificates').insert(rows).select('id, certificate_id, user_id, award, title')
    if (!error) {
      return NextResponse.json({ success: true, batch_id: batch!.id, certificates: created })
    }
    if (error.code !== '23505') return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: false, error: 'Codes changed while issuing — try again' }, { status: 409 })
}
