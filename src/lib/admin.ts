/**
 * Everything the admin area shows, read straight from Supabase in one
 * parallel round trip (row-level security lets admins read it all).
 * Writes still go through /api/admin/* or the existing product/post APIs.
 */
import { createClient } from '@/lib/supabase'
import { isDefaultBio } from '@/lib/memberSummary'
import { isAward, type Award } from '@/lib/awards'

export interface AdminMember {
  id: string
  full_name: string | null
  username: string
  role: 'admin' | 'member'
  contest_count: number
  bio: string | null
  avatar_url: string | null
  social_links: Record<string, string | undefined> | null
  created_at: string
}

export interface AdminPost {
  id: string
  slug: string
  title: string
  status: 'draft' | 'published' | 'archived'
  category: string
  view_count: number
  upvote_count: number
  published_at: string | null
  created_at: string
  updated_at: string
  author_id: string
}

export interface AdminProduct {
  id: string
  title: string
  status: 'active' | 'archived'
  featured: boolean
  created_by: string
  details: string | null
  demo_url: string | null
  video_url: string | null
  thumbnail: string | null
  created_at: string
}

export interface AdminCertificate {
  id: string
  certificate_id: string
  user_id: string
  title: string
  award?: string | null
  batch_id?: string | null
  file_url: string | null
  file_type: 'image' | 'pdf' | null
  issued_at: string
}

export interface AdminBatch {
  id: string
  event_name: string
  contest_slug: string | null
  award_style: 'places' | 'medals' | 'none'
  issued_at: string
}

export interface AdminLog {
  id: string
  task_template_id: string | null
  task_name: string
  points: number
  created_at?: string | null
  post_id?: string | null
}

export interface AdminData {
  members: AdminMember[]
  posts: AdminPost[]
  products: AdminProduct[]
  credits: { project_id: string; user_id: string }[]
  certificates: AdminCertificate[]
  batches: AdminBatch[] | null // null = migration 027 not applied yet
  templates: { id: string; name: string; description: string | null }[]
  logs: AdminLog[]
  logMembers: { task_log_id: string; member_id: string; points: number }[]
}

export const EMPTY_ADMIN: AdminData = {
  members: [], posts: [], products: [], credits: [], certificates: [], batches: [], templates: [], logs: [], logMembers: [],
}

export async function fetchAdminData(): Promise<AdminData> {
  const db: any = createClient()
  const [members, posts, products, credits, certificates, batches, templates, logs, logMembers] = await Promise.all([
    db.from('profiles').select('id, full_name, username, role, contest_count, bio, avatar_url, social_links, created_at').order('full_name'),
    db.from('posts').select('id, slug, title, status, category, view_count, upvote_count, published_at, created_at, updated_at, author_id').order('published_at', { ascending: false, nullsFirst: true }),
    db.from('projects').select('id, title, status, featured, created_by, details, demo_url, video_url, thumbnail_url, created_at, thumbnail_image:images!projects_thumbnail_image_id_fkey(public_url)').order('created_at', { ascending: false }),
    db.from('project_contributors').select('project_id, user_id'),
    db.from('certificates').select('*').order('certificate_id'),
    db.from('certificate_batches').select('*').order('issued_at', { ascending: false }),
    db.from('task_templates').select('id, name, description').order('name'),
    db.from('task_logs').select('*'),
    db.from('task_log_members').select('task_log_id, member_id, points'),
  ])
  return {
    members: members.data || [],
    posts: (posts.data || []).map((p: any) => ({ ...p, view_count: p.view_count || 0, upvote_count: p.upvote_count || 0 })),
    products: (products.data || []).map((p: any) => ({ ...p, thumbnail: p.thumbnail_image?.public_url || p.thumbnail_url || null })),
    credits: credits.data || [],
    certificates: certificates.data || [],
    batches: batches.error ? null : batches.data || [],
    templates: templates.data || [],
    logs: logs.data || [],
    logMembers: logMembers.data || [],
  }
}

/* ---------- Derived facts ---------- */

export const hasWriteup = (p: { details: string | null }) => !!p.details && p.details.replace(/<[^>]+>/g, '').trim().length > 40

export function productGaps(p: AdminProduct) {
  return [
    { key: 'write-up', ok: hasWriteup(p) },
    { key: 'live link', ok: !!p.demo_url },
    { key: 'video', ok: !!p.video_url },
    { key: 'screenshot', ok: !!p.thumbnail },
  ]
}

export function profileGaps(m: AdminMember) {
  const links = Object.values(m.social_links || {}).filter(Boolean).length
  return { photo: !!m.avatar_url, bio: !isDefaultBio(m.bio), link: links > 0 }
}

export function pointsByMember(d: AdminData) {
  const map = new Map<string, number>()
  for (const r of d.logMembers) map.set(r.member_id, (map.get(r.member_id) || 0) + (r.points || 0))
  return map
}

export const nameOf = (d: AdminData, id?: string | null) => d.members.find((m) => m.id === id)?.full_name || 'Unknown member'

/** Median of a list (used to prefill points for a new log). */
export function median(xs: number[]) {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2)
}

export interface CertificateGroup {
  key: string
  batchId: string | null
  name: string
  contestSlug: string | null
  issuedAt: string
  certs: AdminCertificate[]
}

/** Certificates by batch; before migration 027, by event + issue date read from the title. */
export function certificateGroups(d: AdminData, describe: (c: AdminCertificate) => { program: string; href: string | null }): CertificateGroup[] {
  const groups = new Map<string, CertificateGroup>()
  for (const c of d.certificates) {
    const batch = c.batch_id ? (d.batches || []).find((b) => b.id === c.batch_id) : null
    const info = describe(c)
    const key = batch ? batch.id : `${info.program}|${c.issued_at.slice(0, 10)}`
    const g = groups.get(key) || {
      key,
      batchId: batch?.id || null,
      name: batch?.event_name || info.program,
      contestSlug: batch?.contest_slug ?? (info.href ? info.href.replace('/contest/', '') : null),
      issuedAt: batch?.issued_at || c.issued_at,
      certs: [],
    }
    g.certs.push(c)
    groups.set(key, g)
  }
  return Array.from(groups.values()).sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))
}

/** Award for a row: the column when present (027), otherwise read from the title. */
export function awardOf(c: AdminCertificate): Award {
  if (isAward(c.award)) return c.award
  const m = c.title.match(/^(Gold|Silver|Bronze) Medal/i)
  return m ? (m[1].toLowerCase() as Award) : 'participation'
}
