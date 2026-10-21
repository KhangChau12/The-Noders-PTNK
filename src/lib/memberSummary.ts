/**
 * Small, shared rules for how a member is described on /members and on
 * their profile. Everything here is derived from data — no hand-written copy.
 */

/** Bios still set to the default "Member of Generation N" say nothing; hide them. */
export function isDefaultBio(bio?: string | null) {
  return !bio || /^member of generation \d+\.?$/i.test(bio.trim())
}

/** Short role title from the bio ("Head of AI Department_Generation 1" → "Head of AI"). */
export function roleTitle(bio?: string | null, role?: string | null) {
  const b = bio || ''
  if (/founder/i.test(b) && !/co-?founder/i.test(b)) return 'Founder'
  if (/co-?founder/i.test(b)) return 'Co-founder'
  const head = b.match(/head of ([a-z ]+?)(?: department|_|$)/i)
  if (head) return `Head of ${head[1].trim()}`
  if (/advisor/i.test(b)) return 'Advisor'
  return role === 'admin' ? 'Core team' : 'Member'
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

/** "Built 4 products · Wrote 12 posts · 3rd in NAIC 2025" — only the non-zero parts. */
export function activityLine(
  stats: { products: number; posts: number; contests: number },
  bestResult?: { rank: number; contest: string } | null
) {
  const parts: string[] = []
  if (stats.products) parts.push(`Built ${plural(stats.products, 'product')}`)
  if (stats.posts) parts.push(`Wrote ${plural(stats.posts, 'post')}`)
  if (bestResult) parts.push(`${ordinal(bestResult.rank)} in ${bestResult.contest}`)
  else if (stats.contests) parts.push(`Competed in ${plural(stats.contests, 'contest')}`)
  return parts.join(' · ')
}

/** Compact version for directory cards: "1 product · 3 posts · 2 contests". */
export function activitySummary(stats: { products: number; posts: number; contests: number }) {
  const parts: string[] = []
  if (stats.products) parts.push(plural(stats.products, 'product'))
  if (stats.posts) parts.push(plural(stats.posts, 'post'))
  if (stats.contests) parts.push(plural(stats.contests, 'contest'))
  return parts.join(' · ')
}

export function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
