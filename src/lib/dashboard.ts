/**
 * Everything the member dashboard shows, fetched in one parallel round trip
 * keyed by the signed-in user's id (instead of the old session → profile →
 * member API → posts API → certificates waterfall).
 */
import { createClient } from '@/lib/supabase'
import { AWARD_LABEL, AWARD_TONE, isAward } from '@/lib/awards'
import { EMPTY_TERMS, fetchTermsData, type TermsData } from '@/lib/terms'

export interface DashProduct {
  id: string
  title: string
  description: string | null
  details: string | null
  thumbnail: string | null
  video_url: string | null
  demo_url: string | null
  repo_url: string | null
  status: 'active' | 'archived'
  created_by: string
  created_at: string
  share: number | null
  role: string | null
  isCreator: boolean
}

export interface DashPost {
  id: string
  slug: string
  title: string
  title_vi: string | null
  category: string
  status: 'draft' | 'published' | 'archived'
  view_count: number
  upvote_count: number
  published_at: string | null
  created_at: string
  updated_at: string
  thumbnail: string | null
}

export interface DashCertificate {
  id: string
  certificate_id: string
  title: string
  description: string | null
  file_url: string | null
  file_type: 'image' | 'pdf' | null
  issued_at: string
  award?: string | null
  batch_id?: string | null
  batch?: { event_name: string; contest_slug: string | null } | null
}

export interface DashboardData {
  products: DashProduct[]
  posts: DashPost[]
  certificates: DashCertificate[]
  points: number
  memberCount: number
  terms: TermsData
}

export const EMPTY_DASHBOARD: DashboardData = { products: [], posts: [], certificates: [], points: 0, memberCount: 0, terms: EMPTY_TERMS }

const PROJECT_FIELDS = `id, title, description, details, thumbnail_url, video_url, demo_url, repo_url, status, created_by, created_at,
  thumbnail_image:images!projects_thumbnail_image_id_fkey(public_url)`

function toProduct(p: any, userId: string, credit?: { contribution_percentage: number; role_in_project: string }): DashProduct {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    details: p.details,
    thumbnail: p.thumbnail_image?.public_url || p.thumbnail_url || null,
    video_url: p.video_url,
    demo_url: p.demo_url,
    repo_url: p.repo_url,
    status: p.status,
    created_by: p.created_by,
    created_at: p.created_at,
    share: credit ? credit.contribution_percentage : null,
    role: credit ? credit.role_in_project : null,
    isCreator: p.created_by === userId,
  }
}

export async function fetchDashboardData(userId: string): Promise<DashboardData> {
  const supabase: any = createClient()

  const [credits, created, posts, certs, points, members, terms] = await Promise.all([
    supabase
      .from('project_contributors')
      .select(`contribution_percentage, role_in_project, projects!inner(${PROJECT_FIELDS})`)
      .eq('user_id', userId),
    supabase.from('projects').select(PROJECT_FIELDS).eq('created_by', userId),
    supabase
      .from('posts')
      .select(`id, slug, title, title_vi, category, status, view_count, upvote_count, published_at, created_at, updated_at, thumbnail_url,
        thumbnail_image:images!posts_thumbnail_image_id_fkey(public_url)`)
      .eq('author_id', userId)
      .order('published_at', { ascending: false, nullsFirst: true }),
    supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false }),
    supabase.from('task_log_members').select('points').eq('member_id', userId),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    fetchTermsData(supabase),
  ])

  // Credited products, plus any the user created without a credit row
  const byId = new Map<string, DashProduct>()
  for (const c of credits.data || []) {
    byId.set(c.projects.id, toProduct(c.projects, userId, c))
  }
  for (const p of created.data || []) {
    if (!byId.has(p.id)) byId.set(p.id, toProduct(p, userId))
  }

  return {
    products: Array.from(byId.values()).sort((a, b) => b.created_at.localeCompare(a.created_at)),
    posts: (posts.data || []).map((p: any) => ({
      ...p,
      view_count: p.view_count || 0,
      upvote_count: p.upvote_count || 0,
      thumbnail: p.thumbnail_image?.public_url || p.thumbnail_url || null,
    })),
    certificates: await withBatches(supabase, certs.data || []),
    points: (points.data || []).reduce((sum: number, r: { points: number }) => sum + (r.points || 0), 0),
    memberCount: members.count || 0,
    terms,
  }
}

/* ---------- Derived, display-only helpers ---------- */

export const TOPIC: Record<string, { label: string; color: string }> = {
  'Community Activities': { label: 'Community', color: '#5B7FD6' },
  'You may want to know': { label: 'Do you know?', color: '#BD8532' },
  News: { label: 'News', color: '#7E8798' },
  'Tech Sharing': { label: 'Tech sharing', color: '#3E9C8A' },
  'Member Spotlight': { label: 'Member spotlight', color: '#9A6FB0' },
}

export const topicOf = (category: string) => TOPIC[category] || { label: category, color: '#7E8798' }

/** What a product page still needs, in the order visitors notice it. */
export function productChecklist(p: DashProduct) {
  const hasWriteup = !!p.details && p.details.replace(/<[^>]+>/g, '').trim().length > 40
  return [
    { key: 'writeup', label: 'Write-up', done: hasWriteup },
    { key: 'live', label: 'Live link', done: !!p.demo_url },
    { key: 'video', label: 'Video', done: !!p.video_url },
    { key: 'screenshot', label: 'Screenshot', done: !!p.thumbnail },
  ]
}

export const doneCount = (p: DashProduct) => productChecklist(p).filter((c) => c.done).length

// Fixed month names: ICU versions disagree on "Sep" vs "Sept", and server/client must match.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatDay(iso?: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${String(d.getUTCDate()).padStart(2, '0')} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export function formatMonth(iso?: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export interface CertificateFacts {
  title: string
  award?: string | null
  batch?: { event_name: string; contest_slug: string | null } | null
}

/**
 * Award + programme + contest link for a certificate. Uses the award and batch
 * columns (migration 027) when present, otherwise reads them from the title,
 * e.g. "Bronze Medal Certificate of NAIC 2026".
 */
export function describeCertificate(input: string | CertificateFacts) {
  const c: CertificateFacts = typeof input === 'string' ? { title: input } : input
  const t = c.title.trim().replace(/\.$/, '')
  if (c.batch && isAward(c.award)) {
    const award = c.award === 'participation' ? 'Participation' : AWARD_LABEL[c.award]
    const href = c.batch.contest_slug ? `/contest/${c.batch.contest_slug}` : null
    return { award, program: c.batch.event_name, href, tone: c.award === 'participation' ? '#8DB1FF' : AWARD_TONE[c.award] }
  }
  const medal = t.match(/^(Gold|Silver|Bronze) Medal/i)
  const isNaic = /\bNAIC\b/i.test(t)
  const isPaic = /\bPAIC\b/i.test(t)
  let award = 'Certificate'
  if (medal) award = `${medal[1][0].toUpperCase()}${medal[1].slice(1).toLowerCase()} Medal`
  else if (/particip/i.test(t)) award = 'Participation'
  const program = isNaic
    ? 'Noders AI Challenge 2025'
    : isPaic
      ? 'PTNK AI Challenge 2026'
      : (t.match(/\bin\s+(.+)$/i)?.[1] || t.match(/\bof\s+(.+)$/i)?.[1] || t)
  const href = isNaic ? '/contest/naic-2025' : isPaic ? '/contest/paic-2026' : null
  const tone = medal ? ({ gold: '#E8C25A', silver: '#C9CED8', bronze: '#E0B26A' } as Record<string, string>)[medal[1].toLowerCase()] : '#8DB1FF'
  return { award, program, href, tone }
}

/** Attach batch info to certificate rows (tolerates the table not existing yet). */
export async function withBatches<T extends { batch_id?: string | null }>(db: any, rows: T[]) {
  const ids = Array.from(new Set(rows.map((r) => r.batch_id).filter(Boolean))) as string[]
  if (!ids.length) return rows.map((r) => ({ ...r, batch: null }))
  const { data } = await db.from('certificate_batches').select('id, event_name, contest_slug').in('id', ids)
  const byId = new Map((data || []).map((b: any) => [b.id, b]))
  return rows.map((r) => ({ ...r, batch: (r.batch_id && byId.get(r.batch_id)) || null }))
}
