'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'
import { PageHero } from '@/components/PageHero'
import { Container, FilterButton, NavySearch } from '@/components/editorial'
import { cn } from '@/lib/utils'

type Person = { full_name?: string | null; username?: string | null; avatar_url?: string | null }

export interface ProductListItem {
  id: string
  title: string
  description?: string | null
  details?: string | null
  thumbnail_url?: string | null
  thumbnail_image?: { public_url: string; alt_text?: string | null } | null
  demo_url?: string | null
  repo_url?: string | null
  tech_stack?: string[] | null
  featured?: boolean | null
  created_at: string
  contributors?: { contribution_percentage?: number | null; profiles?: Person | null }[]
}

type Show = 'all' | 'live' | 'open'
type Sort = 'newest' | 'oldest' | 'az'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const month = (d: string) => `${MONTHS[new Date(d).getUTCMonth()]} ${new Date(d).getUTCFullYear()}`
const host = (u: string) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '')
const imageOf = (p: ProductListItem) => p.thumbnail_image?.public_url || p.thumbnail_url || null
const makersOf = (p: ProductListItem) =>
  (p.contributors || [])
    .slice()
    .sort((a, b) => (b.contribution_percentage || 0) - (a.contribution_percentage || 0))
    .map((c) => c.profiles)
    .filter((x): x is Person => !!x)

/** The bold lead-ins of the write-up's first list ("Get a band estimate", …), for the spotlight. */
function highlights(details?: string | null) {
  const out: string[] = []
  const re = /<li>\s*<strong>([^<]+)<\/strong>/g
  let m: RegExpExecArray | null
  while (details && (m = re.exec(details)) && out.length < 3) out.push(m[1].trim().replace(/[.:]$/, ''))
  return out
}

/** Whole /products page body: intro with counts and search, featured products, the full list, two CTAs. */
export default function ProjectsClient({ initialProjects }: { initialProjects: ProductListItem[] }) {
  const [q, setQ] = useState('')
  const [show, setShow] = useState<Show>('all')
  const [sort, setSort] = useState<Sort>('newest')
  const listRef = useRef<HTMLElement>(null)

  const all = initialProjects
  const live = all.filter((p) => p.demo_url).length
  const open = all.filter((p) => p.repo_url).length
  const makers = new Set(all.flatMap((p) => makersOf(p).map((m) => m.full_name || m.username))).size

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = all.filter((p) => {
      if (show === 'live' && !p.demo_url) return false
      if (show === 'open' && !p.repo_url) return false
      if (!needle) return true
      const hay = [p.title, p.description, ...(p.tech_stack || []), ...makersOf(p).map((m) => m.full_name)].join(' ').toLowerCase()
      return hay.includes(needle)
    })
    return list.sort((a, b) => (sort === 'az' ? a.title.localeCompare(b.title) : sort === 'oldest' ? a.created_at.localeCompare(b.created_at) : b.created_at.localeCompare(a.created_at)))
  }, [all, q, show, sort])

  // Featured products: newest first; the first gets the spotlight. Hidden while searching or filtering.
  const featured = all.filter((p) => p.featured).sort((a, b) => b.created_at.localeCompare(a.created_at))
  const browsing = !q.trim() && show === 'all'
  const [spot, ...more] = featured

  const showOpenSource = () => {
    setShow('open')
    setQ('')
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div>
      <PageHero
        eyebrow="Products"
        title="Things we’ve shipped."
        description="Apps and tools built by members, most of them for problems we had ourselves as students. Try them, read the code, or build on them."
        aside={
          <div className="flex flex-col gap-5">
            <dl className="flex flex-wrap gap-x-7 gap-y-2">
              {[
                [all.length, all.length === 1 ? 'product' : 'products'],
                [makers, makers === 1 ? 'maker' : 'makers'],
                [live, 'live'],
                [open, 'open source'],
              ].map(([n, l]) => (
                <div key={l} className="flex flex-col-reverse">
                  <dt className="text-[13px] text-on-navy">{l}</dt>
                  <dd className="font-mono text-[26px] leading-tight text-white">{n}</dd>
                </div>
              ))}
            </dl>
            <NavySearch id="product-search" label="Search products" placeholder="Name, idea, tech or maker" value={q} onChange={setQ} />
          </div>
        }
      />

      {browsing && spot && (
        <section aria-label="Featured" className="pt-14 sm:pt-16">
          <Container>
            <div className="grid items-center gap-x-12 gap-y-7 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
              <Link href={`/products/${spot.id}`} className="zoom block">
                <Shot p={spot} sizes="(max-width: 1024px) 100vw, 700px" className="aspect-[16/9.5] rounded-xl" priority />
              </Link>
              <div className="min-w-0">
                <p className="mb-4 flex items-center gap-2.5 text-sm text-text-secondary">
                  <Faces people={makersOf(spot)} size={30} />
                  Featured · by {makersOf(spot).map((m) => m.full_name).join(', ')}
                </p>
                <h2 className="mb-3.5 text-[32px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[44px]">
                  <Link href={`/products/${spot.id}`} className="text-text-primary hover:text-link">{spot.title}</Link>
                </h2>
                {spot.description && <p className="mb-5 text-lg leading-relaxed text-[#C9CED8]">{spot.description}</p>}
                {highlights(spot.details).length > 0 && (
                  <ul className="mb-7 flex flex-col gap-2 text-[15px] text-text-secondary">
                    {highlights(spot.details).map((h) => (
                      <li key={h} className="flex gap-2.5">
                        <span aria-hidden="true" className="text-link">—</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap gap-2.5">
                  {spot.demo_url && (
                    <a href={spot.demo_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[46px] items-center rounded-lg bg-text-primary px-[18px] font-semibold text-ink hover:bg-white">
                      {host(spot.demo_url).length <= 24 ? `Try it at ${host(spot.demo_url)}` : 'Try it live'} ↗
                    </a>
                  )}
                  <Link href={`/products/${spot.id}`} className="inline-flex min-h-[46px] items-center rounded-lg border border-control px-[18px] font-semibold text-text-primary hover:border-text-tertiary">
                    Read more
                  </Link>
                </div>
              </div>
            </div>

            {more.length > 0 && (
              <div data-stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:gap-8">
                {more.map((p) => (
                  <article key={p.id} className="lift zoom grid gap-5 rounded-[14px] bg-paper p-[18px] sm:grid-cols-2">
                    <Link href={`/products/${p.id}`} className="block">
                      <Shot p={p} sizes="(max-width: 768px) 100vw, 300px" className="aspect-[16/10] rounded-lg" />
                    </Link>
                    <div className="flex min-w-0 flex-col gap-2">
                      <span className="text-[13px] text-text-tertiary">Featured · {month(p.created_at)}</span>
                      <h3 className="text-[21px] font-bold leading-tight tracking-[-0.01em]">
                        <Link href={`/products/${p.id}`} className="text-text-primary hover:text-link">{p.title}</Link>
                      </h3>
                      {p.description && <p className="text-sm leading-relaxed text-text-secondary">{p.description}</p>}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2">
                        <Faces people={makersOf(p)} size={24} />
                        <Links p={p} className="text-[13px]" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Container>
        </section>
      )}

      <section ref={listRef} aria-labelledby="all-products" className={cn('scroll-mt-24', browsing && spot ? 'pt-20 sm:pt-24' : 'pt-14')}>
        <Container>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h2 id="all-products" className="text-[26px] font-bold tracking-[-0.02em] sm:text-[30px]">
              {browsing ? 'All products' : `${rows.length} ${rows.length === 1 ? 'product' : 'products'}`}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
                {([
                  ['all', 'All', all.length],
                  ['live', 'Try it live', live],
                  ['open', 'Open source', open],
                ] as const).map(([value, label, n]) => (
                  <FilterButton key={value} active={show === value} onClick={() => setShow(value)}>
                    {label}
                    <span className="font-mono text-xs opacity-75">{n}</span>
                  </FilterButton>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="sr-only">Sort</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="min-h-[40px] rounded-md border border-control bg-paper px-2.5 text-sm text-text-primary focus:border-text-tertiary focus:outline-none"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="az">A–Z</option>
                </select>
              </label>
            </div>
          </div>

          {rows.length ? (
            <ul data-stagger key={`${show}-${sort}`} className="swap-in border-b border-rule">
              {rows.map((p) => {
                const people = makersOf(p)
                return (
                  <li key={p.id} className="grid gap-x-8 gap-y-4 border-t border-rule py-[22px] sm:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)_250px] lg:items-center">
                    <Link href={`/products/${p.id}`} className="zoom block">
                      <Shot p={p} sizes="(max-width: 640px) 100vw, 220px" className="aspect-[16/10] rounded-lg" />
                    </Link>
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="text-[21px] font-bold leading-tight tracking-[-0.01em]">
                          <Link href={`/products/${p.id}`} className="text-text-primary hover:text-link">{p.title}</Link>
                        </h3>
                        <span className="font-mono text-xs text-text-disabled">{month(p.created_at)}</span>
                      </div>
                      {p.description && <p className="max-w-[640px] text-[15px] leading-relaxed text-text-secondary">{p.description}</p>}
                      {!!p.tech_stack?.length && <p className="text-[13px] text-text-disabled">{p.tech_stack.join(' · ')}</p>}
                    </div>
                    <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-2.5 sm:col-start-2 lg:col-start-auto lg:flex-col lg:items-start">
                      {people.length > 0 && (
                        <span className="flex min-w-0 items-center gap-2.5 text-sm text-[#C9CED8]">
                          <Faces people={people} size={26} />
                          <span className="min-w-0">{people.map((m) => m.full_name).join(', ')}</span>
                        </span>
                      )}
                      <Links p={p} className="text-sm" empty="No public link yet" />
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="border-t border-rule py-8">
              <p className="mb-1 font-semibold text-text-primary">Nothing matches{q.trim() ? ` “${q.trim()}”` : ''}.</p>
              <button type="button" onClick={() => { setQ(''); setShow('all') }} className="text-sm font-semibold text-link hover:text-text-primary">
                Show all products
              </button>
            </div>
          )}
        </Container>
      </section>

      <section className="pt-20 pb-20 sm:pt-24 sm:pb-28">
        <Container className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[14px] bg-navy p-7 text-white sm:p-9">
            <h2 className="mb-2 text-2xl font-bold tracking-[-0.01em]">Built something as a member?</h2>
            <p className="mb-6 text-on-navy">Add it from your dashboard — screenshots, links and who did what.</p>
            <Link href="/dashboard/products/new" className="inline-flex min-h-[44px] items-center rounded-lg bg-white px-[18px] font-semibold text-navy-dark hover:bg-on-navy">
              Add your product
            </Link>
          </div>
          {open > 0 && (
            <div className="rounded-[14px] bg-paper p-7 sm:p-9">
              <h2 className="mb-2 text-2xl font-bold tracking-[-0.01em] text-text-primary">Learn from the code</h2>
              <p className="mb-6 text-text-secondary">
                {open} of these {open === 1 ? 'is' : 'are'} open source. Read how they work, run them yourself, or open an issue — the makers are members you can ask.
              </p>
              <button type="button" onClick={showOpenSource} className="inline-flex min-h-[44px] items-center rounded-lg border border-control px-[18px] font-semibold text-text-primary hover:border-text-tertiary">
                Show open-source products
              </button>
            </div>
          )}
        </Container>
      </section>
    </div>
  )
}

function Shot({ p, sizes, className, priority }: { p: ProductListItem; sizes: string; className?: string; priority?: boolean }) {
  const src = imageOf(p)
  return (
    <span className={cn('relative block overflow-hidden bg-paper', className)}>
      {src ? (
        <Image src={src} alt={p.thumbnail_image?.alt_text || `${p.title} screenshot`} fill sizes={sizes} priority={priority} className="object-cover object-top" />
      ) : (
        <span className="flex h-full items-center justify-center font-mono text-sm text-text-tertiary">{p.title}</span>
      )}
    </span>
  )
}

function Faces({ people, size }: { people: Person[]; size: number }) {
  return (
    <span className="flex shrink-0">
      {people.slice(0, 4).map((m, i) => {
        const initials = (m.full_name || m.username || '?').split(' ').filter(Boolean).map((w) => w[0]).slice(-2).join('').toUpperCase()
        const style = { width: size, height: size, marginLeft: i ? -8 : 0 }
        return m.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={m.avatar_url} alt="" style={style} className="rounded-full border-2 border-ink object-cover" />
        ) : (
          <span key={i} aria-hidden="true" style={{ ...style, fontSize: size * 0.38 }} className="inline-flex items-center justify-center rounded-full border-2 border-ink bg-[#2A4B8D] font-semibold text-white">
            {initials}
          </span>
        )
      })}
    </span>
  )
}

function Links({ p, className, empty }: { p: ProductListItem; className?: string; empty?: string }) {
  if (!p.demo_url && !p.repo_url) return empty ? <span className={cn('text-text-disabled', className)}>{empty}</span> : null
  return (
    <span className={cn('flex items-center gap-2.5 font-semibold', className)}>
      {p.demo_url && (
        <a href={p.demo_url} target="_blank" rel="noopener noreferrer" className="text-link hover:text-text-primary">
          Try it ↗<span className="sr-only"> {p.title} (opens in a new tab)</span>
        </a>
      )}
      {p.demo_url && p.repo_url && <span aria-hidden="true" className="text-control">·</span>}
      {p.repo_url && (
        <a href={p.repo_url} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary">
          Code ↗<span className="sr-only"> for {p.title} (opens in a new tab)</span>
        </a>
      )}
    </span>
  )
}
