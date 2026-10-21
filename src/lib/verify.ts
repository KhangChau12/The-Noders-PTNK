/** Server-side certificate lookups for /verify (anon key; certificates are public). */
import { createClient } from '@/lib/supabase'
import { withBatches } from '@/lib/dashboard'

export interface VerifiedCertificate {
  id: string
  certificate_id: string
  title: string
  description: string | null
  file_url: string | null
  file_type: 'image' | 'pdf' | null
  issued_at: string
  award?: string | null
  batch?: { event_name: string; contest_slug: string | null } | null
  member: { id: string; full_name: string | null; username: string; avatar_url: string | null } | null
}

export async function getCertificate(code: string): Promise<VerifiedCertificate | null> {
  const supabase: any = createClient()
  const { data: cert } = await supabase
    .from('certificates')
    .select('*, image:images!certificates_image_id_fkey(public_url)')
    .eq('certificate_id', code)
    .maybeSingle()
  if (!cert) return null

  const [{ data: member }, [withBatch]] = await Promise.all([
    supabase.from('profiles').select('id, full_name, username, avatar_url').eq('id', cert.user_id).maybeSingle(),
    withBatches(supabase, [cert]),
  ])

  return {
    id: cert.id,
    certificate_id: cert.certificate_id,
    title: cert.title,
    description: cert.description,
    file_url: cert.file_url || cert.image?.public_url || null,
    file_type: cert.file_type,
    issued_at: cert.issued_at,
    award: cert.award ?? null,
    batch: (withBatch as any).batch,
    member: member || null,
  }
}

/** Count and first issue date, for the landing page. */
export async function getCertificateStats() {
  const supabase: any = createClient()
  const [count, first, sample] = await Promise.all([
    supabase.from('certificates').select('id', { count: 'exact', head: true }),
    supabase.from('certificates').select('issued_at').order('issued_at', { ascending: true }).limit(1),
    supabase.from('certificates').select('file_url').eq('file_type', 'image').not('file_url', 'is', null).order('issued_at', { ascending: true }).limit(1),
  ])
  return {
    count: count.count || 0,
    since: first.data?.[0]?.issued_at || null,
    sampleImage: sample.data?.[0]?.file_url || null,
  }
}
