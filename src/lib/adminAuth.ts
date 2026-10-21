/**
 * Admin check for API routes, in one round trip.
 * The token is verified (getUser) while the role is read in parallel, using
 * the user id from the token itself; both must agree before anything runs.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createTokenClient } from '@/lib/supabase'

function tokenSubject(token: string): string | null {
  try {
    const payload = token.split('.')[1]
    const json = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    return JSON.parse(json).sub || null
  } catch {
    return null
  }
}

export type AdminAccess =
  | { error: NextResponse }
  | { supabase: ReturnType<typeof createTokenClient>; userId: string; token: string }

export async function requireAdmin(request: NextRequest): Promise<AdminAccess> {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) }
  }
  const token = header.slice(7)
  const sub = tokenSubject(token)
  if (!sub) {
    return { error: NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 }) }
  }

  const supabase = createTokenClient(token)
  const [{ data: auth, error: authError }, { data: profile }] = await Promise.all([
    supabase.auth.getUser(token),
    (supabase as any).from('profiles').select('role').eq('id', sub).maybeSingle(),
  ])

  if (authError || !auth?.user || auth.user.id !== sub) {
    return { error: NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 }) }
  }
  if (profile?.role !== 'admin') {
    return { error: NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 }) }
  }
  return { supabase, userId: sub, token }
}
