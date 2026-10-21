/**
 * Terms, departments and positions (migration 028).
 * Every role shown on the site — Founder, Advisor, President, Head of AI,
 * Member, Alumni, Generation N — is derived from these rows, never from bios.
 */

export type PositionKind = 'founder' | 'advisor' | 'president' | 'vice_president' | 'head' | 'member'

export interface Term {
  id: string
  number: number
  name: string
  starts_on: string | null
  ends_on: string | null
  is_current: boolean
}

export interface Department {
  id: string
  term_id: string
  name: string
  sort: number
}

export interface Position {
  id: string
  term_id: string | null
  kind: PositionKind
  department_id: string | null
  profile_id: string | null
  display_name: string | null
  display_title: string | null
  avatar_url: string | null
  sort: number
}

export interface TermsData {
  terms: Term[]
  departments: Department[]
  positions: Position[]
  /** false until migration 028 has been run */
  ready: boolean
}

export const EMPTY_TERMS: TermsData = { terms: [], departments: [], positions: [], ready: false }

export async function fetchTermsData(db: any): Promise<TermsData> {
  const [t, d, p] = await Promise.all([
    db.from('terms').select('*').order('number', { ascending: false }),
    db.from('term_departments').select('*').order('sort'),
    db.from('positions').select('*').order('sort'),
  ])
  if (t.error) return EMPTY_TERMS
  return { terms: t.data || [], departments: d.data || [], positions: p.data || [], ready: true }
}

/** Leadership order on the page. */
export const KIND_RANK: Record<PositionKind, number> = { founder: 0, advisor: 1, president: 2, vice_president: 3, head: 4, member: 9 }
export const LEADING: PositionKind[] = ['president', 'vice_president', 'head']

export const currentTerm = (d: TermsData) => d.terms.find((t) => t.is_current) || null
export const termById = (d: TermsData, id: string | null) => d.terms.find((t) => t.id === id) || null
export const departmentsOf = (d: TermsData, termId: string) => d.departments.filter((x) => x.term_id === termId).sort((a, b) => a.sort - b.sort)

export function positionLabel(p: Pick<Position, 'kind' | 'department_id'>, d: TermsData) {
  switch (p.kind) {
    case 'founder':
      return 'Founder'
    case 'advisor':
      return 'Advisor'
    case 'president':
      return 'President'
    case 'vice_president':
      return 'Vice President'
    case 'head': {
      const dept = d.departments.find((x) => x.id === p.department_id)
      return dept ? `Head of ${dept.name}` : 'Head'
    }
    default:
      return 'Member'
  }
}

export const positionsOf = (d: TermsData, profileId: string) => d.positions.filter((p) => p.profile_id === profileId)

/** Advisors are shown on the Members page only; they have no profile page. */
export function isAdvisorOnly(d: TermsData, profileId: string) {
  const mine = positionsOf(d, profileId)
  return mine.length > 0 && mine.every((p) => p.kind === 'advisor')
}

/** The first term someone held any position in (used to tell members from people with no term yet). */
export function generationOf(d: TermsData, profileId: string) {
  const nums = positionsOf(d, profileId)
    .map((p) => termById(d, p.term_id)?.number)
    .filter((n): n is number => typeof n === 'number')
  return nums.length ? Math.min(...nums) : null
}

/** Newest first; the founder row first of all. */
export function roleHistory(d: TermsData, profileId: string) {
  return positionsOf(d, profileId)
    .map((p) => ({ p, term: termById(d, p.term_id) }))
    .sort((a, b) => (a.p.kind === 'founder' ? -1 : b.p.kind === 'founder' ? 1 : (b.term?.number || 0) - (a.term?.number || 0) || KIND_RANK[a.p.kind] - KIND_RANK[b.p.kind]))
    .map(({ p, term }) => ({ label: positionLabel(p, d), term: term?.name || null, kind: p.kind, current: !!term?.is_current }))
}

/**
 * One line for headers and cards:
 * "Founder", "Head of AI · Term 1", "Member · Term 2", "Alumni · Term 1" (their last term).
 * Falls back to `fallback` before migration 028 or for people with no positions.
 */
export function roleLine(d: TermsData, profileId: string, fallback = 'Member') {
  if (!d.ready) return fallback
  const mine = positionsOf(d, profileId)
  if (mine.some((p) => p.kind === 'founder')) return 'Founder'
  const cur = currentTerm(d)
  const now = mine.filter((p) => cur && p.term_id === cur.id).sort((a, b) => KIND_RANK[a.kind] - KIND_RANK[b.kind])[0]
  if (now && cur) return `${positionLabel(now, d)} · ${cur.name}`
  const last = mine
    .filter((p) => p.kind !== 'advisor')
    .map((p) => termById(d, p.term_id))
    .filter((t): t is Term => !!t)
    .sort((a, b) => b.number - a.number)[0]
  if (last) return `Alumni · ${last.name}`
  return fallback
}
