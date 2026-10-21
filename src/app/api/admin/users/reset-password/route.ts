import { randomInt } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

const WORDS = ['river', 'maple', 'orbit', 'pixel', 'cedar', 'delta', 'ember', 'lotus', 'nova', 'quartz', 'sable', 'tango', 'vector', 'willow', 'zephyr', 'mango', 'harbor', 'falcon', 'meadow', 'comet']
const makePassword = () => `${WORDS[randomInt(WORDS.length)]}-${WORDS[randomInt(WORDS.length)]}-${randomInt(10, 100)}`

/**
 * POST /api/admin/users/reset-password  { id }
 * Sets a new generated password for a member who forgot theirs and returns it
 * once, so the admin can pass it on. Admins can reset members; only the
 * Founder can reset another admin (so a head can't take over a core account).
 */
export async function POST(request: NextRequest) {
  const access = await requireAdmin(request)
  if ('error' in access) return access.error

  const body = await request.json().catch(() => ({}))
  const id = typeof body.id === 'string' ? body.id : ''
  if (!id) return NextResponse.json({ success: false, error: 'Member id is required' }, { status: 400 })
  if (id === access.userId) {
    return NextResponse.json({ success: false, error: 'Change your own password from your dashboard' }, { status: 400 })
  }

  const admin: any = createAdminClient()
  const [{ data: target }, { data: founder }] = await Promise.all([
    admin.from('profiles').select('id, full_name, role').eq('id', id).maybeSingle(),
    admin.from('positions').select('id').eq('kind', 'founder').eq('profile_id', access.userId).maybeSingle(),
  ])
  if (!target) return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 })
  if (target.role === 'admin' && !founder) {
    return NextResponse.json({ success: false, error: 'Only the Founder can reset another admin’s password' }, { status: 403 })
  }

  const password = makePassword()
  const { data, error } = await admin.auth.admin.updateUserById(id, { password })
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, password, email: data.user?.email || null, name: target.full_name })
}
