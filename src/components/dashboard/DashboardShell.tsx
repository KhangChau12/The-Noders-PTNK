'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, type ReactNode } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { CONTAINER_CLASS } from '@/components/editorial'
import { contestResultsFor } from '@/lib/programs'
import { activityLine, isDefaultBio, roleTitle } from '@/lib/memberSummary'
import { formatMonth } from '@/lib/dashboard'
import { cn } from '@/lib/utils'
import { useDashboard } from './DashboardContext'
import { MemberAvatar } from './ui'

const TABS = [
  { href: '/dashboard', label: 'Overview', count: null },
  { href: '/dashboard/profile', label: 'Profile', count: null },
  { href: '/dashboard/products', label: 'Products', count: 'products' },
  { href: '/dashboard/posts', label: 'Posts', count: 'posts' },
  { href: '/dashboard/certificates', label: 'Certificates', count: 'certificates' },
] as const

/** Navy identity band + tabs. Editors (post/product) render without it. */
export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/dashboard'
  const isTab = TABS.some((t) => t.href === pathname)
  if (!isTab) return <>{children}</>

  return (
    <>
      <IdentityBand active={pathname} />
      <div className={cn(CONTAINER_CLASS, 'pb-28 pt-10')}>{children}</div>
    </>
  )
}

function IdentityBand({ active }: { active: string }) {
  const { profile, user, isAdmin, signOut } = useAuth()
  const { data, ready, preview } = useDashboard()

  const name = preview?.full_name ?? profile?.full_name ?? ''
  const bio = preview?.bio ?? profile?.bio ?? ''
  const avatar = preview ? preview.avatar_url : profile?.avatar_url
  const published = data.posts.filter((p) => p.status === 'published').length
  const results = contestResultsFor(profile?.full_name)
  const best = results.length ? results.reduce((a, b) => (b.rank < a.rank ? b : a)) : null
  const line = activityLine(
    { products: data.products.length, posts: published, contests: profile?.contest_count || results.length },
    best ? { rank: best.rank, contest: best.contest.shortName } : null
  )
  const since = profile?.created_at || user?.created_at
  const kicker = [profile ? roleTitle(profile.bio, profile.role) : null, since ? `Member since ${formatMonth(since)}` : null]
    .filter(Boolean)
    .join(' · ')

  // Keep the active tab in view when the tab row scrolls on small screens
  const navRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = navRef.current?.querySelector('[aria-current="page"]') as HTMLElement | null
    if (el && navRef.current) navRef.current.scrollLeft = el.offsetLeft - 20
  }, [active])

  const counts: Record<string, number> = {
    products: data.products.length,
    posts: data.posts.length,
    certificates: data.certificates.length,
  }

  return (
    <section className="bg-navy text-white">
      <div className={cn(CONTAINER_CLASS, 'pt-9')}>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-5">
          {profile ? (
            <MemberAvatar name={name} src={avatar} className="h-[84px] w-[84px] shrink-0 rounded-2xl text-[28px]" />
          ) : (
            <span className="h-[84px] w-[84px] shrink-0 animate-pulse rounded-2xl bg-white/10" />
          )}
          <div className="min-w-0 flex-[1_1_420px]">
            <p className="mb-0.5 min-h-[21px] text-sm text-[#AFC3EE]">{kicker}</p>
            <h1 className="min-h-[42px] text-[clamp(28px,3vw,38px)] font-bold leading-[1.12] tracking-[-0.025em]">
              {name || (profile ? 'Your name' : '')}
            </h1>
            {!isDefaultBio(bio) && <p className="mt-1.5 text-base text-white">{bio}</p>}
            <p className="mt-1 min-h-[21px] text-sm text-[#AFC3EE]">
              {ready && (line || 'Nothing here yet. Your products, posts and results appear on this line as you add them.')}
            </p>
            {preview && (
              <p className="mt-3 text-[13px] text-[#AFC3EE]">Live preview — this band is your public header. The last line is generated from your work.</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/dashboard/posts/new" className="inline-flex min-h-[44px] items-center rounded-md bg-white px-[18px] font-semibold text-navy-dark transition-colors hover:bg-on-navy">
              Write a post
            </Link>
            <Link href="/dashboard/products/new" className="inline-flex min-h-[44px] items-center rounded-md border border-white/40 px-[18px] font-semibold text-white transition-colors hover:border-white">
              Add a product
            </Link>
          </div>
        </div>

        <div className="mt-[30px] flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <nav ref={navRef} aria-label="Dashboard" className="-mb-px flex max-w-full gap-0.5 overflow-x-auto text-[15px] font-semibold [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((t) => {
              const on = t.href === active
              const n = t.count ? counts[t.count] : null
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={on ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-[48px] shrink-0 items-center gap-2 whitespace-nowrap rounded-t-[10px] px-[18px] transition-colors',
                    on ? 'bg-ink text-white' : 'text-on-navy hover:bg-white/[0.06] hover:text-white'
                  )}
                >
                  {t.label}
                  {n !== null && ready && (
                    <span className={cn('font-mono text-[13px] font-normal', on ? 'text-text-tertiary' : 'text-[#AFC3EE]')}>{n}</span>
                  )}
                </Link>
              )
            })}
          </nav>
          <div className="order-first flex w-full flex-wrap gap-x-5 gap-y-1 pb-1 text-sm font-medium sm:order-none sm:w-auto sm:pb-3.5">
            {user && (
              <Link href={`/members/${user.id}`} className="text-on-navy hover:text-white">
                Public profile ↗
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="text-on-navy hover:text-white">
                Admin panel
              </Link>
            )}
            <button type="button" onClick={() => signOut()} className="text-[#AFC3EE] hover:text-white">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
