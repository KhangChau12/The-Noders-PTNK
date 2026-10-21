'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container } from '@/components/editorial'

const SECTIONS = [
  { slug: 'products', label: 'Products', note: 'built by members' },
  { slug: 'posts', label: 'Posts', note: 'news and “Do you know?”' },
  { slug: 'contest', label: 'Contests', note: 'NAIC · PAIC' },
  { slug: 'education', label: 'Education', note: 'courses and sessions' },
  { slug: 'members', label: 'Members', note: 'who’s in the club' },
  { slug: 'verify', label: 'Verify a certificate', note: 'by code' },
]
const KNOWN = [...SECTIONS.map((s) => s.slug), 'dashboard', 'admin', 'contact', 'login', 'privacy', 'terms']

function distance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}

/** "/produts/x" → "/products/x"; "/contests" → "/contest". Only when it's a near miss. */
function guess(path: string) {
  const [first, ...rest] = path.replace(/^\/+/, '').split('/')
  if (!first || KNOWN.includes(first.toLowerCase())) return null
  const best = KNOWN.map((k) => ({ k, d: distance(first.toLowerCase(), k) })).sort((a, b) => a.d - b.d)[0]
  return best.d <= 2 ? '/' + [best.k, ...rest].join('/') : null
}

export default function NotFound() {
  const pathname = usePathname() || ''
  const suggestion = guess(pathname)

  return (
    <Container className="flex flex-wrap items-start gap-x-[72px] gap-y-12 pb-28 pt-20">
      <div className="min-w-0 max-w-[640px] flex-[1_1_520px]">
        <p className="mb-3.5 break-all font-mono text-sm text-text-tertiary">404 · {pathname}</p>
        <h1 className="mb-3.5 text-[clamp(32px,3.6vw,46px)] font-bold leading-[1.08] tracking-[-0.03em]">There’s no page at this address.</h1>
        <p className="mb-7 text-lg text-text-secondary">It may have moved, or the link has a typo.{suggestion ? ' This is probably what you were after:' : ''}</p>
        {suggestion && (
          <Link href={suggestion} className="mb-7 flex items-center gap-4 rounded-[10px] bg-paper px-[18px] py-4 text-text-primary hover:bg-[#1A1E26]">
            <span className="min-w-0 flex-auto">
              <span className="block text-[13px] text-text-tertiary">Did you mean</span>
              <span className="block truncate font-mono text-[15px] font-semibold">{suggestion}</span>
            </span>
            <span className="shrink-0 font-semibold text-link">Open →</span>
          </Link>
        )}
        <div className="flex flex-wrap gap-2.5">
          <Link href="/" className="inline-flex min-h-[48px] items-center rounded-md bg-text-primary px-5 font-semibold text-ink hover:bg-white">Go to the homepage</Link>
          <Link href="/contact?topic=bug" className="inline-flex min-h-[48px] items-center rounded-md border border-control px-5 font-semibold text-text-primary hover:border-text-tertiary">Report a broken link</Link>
        </div>
      </div>
      <nav aria-label="Main sections" className="min-w-0 flex-[0_1_360px]">
        <p className="mb-2.5 text-sm font-semibold text-text-secondary">Or start from a section</p>
        <ul className="border-t border-rule">
          {SECTIONS.map((s) => (
            <li key={s.slug} className="border-b border-rule">
              <Link href={`/${s.slug}`} className="flex justify-between gap-4 px-1 py-3.5 font-semibold text-text-primary hover:text-link">
                {s.label} <span className="font-normal text-text-tertiary">{s.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Container>
  )
}
