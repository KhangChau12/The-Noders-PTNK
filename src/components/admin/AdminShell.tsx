'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, type ReactNode } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { CONTAINER_CLASS } from '@/components/editorial'
import { cn } from '@/lib/utils'
import { AdminProvider, useAdmin } from './AdminContext'

const TABS = [
  { href: '/admin', label: 'Overview', count: null },
  { href: '/admin/terms', label: 'Terms', count: 'terms' },
  { href: '/admin/users', label: 'Members', count: 'members' },
  { href: '/admin/products', label: 'Products', count: 'products' },
  { href: '/admin/posts', label: 'Posts', count: 'posts' },
  { href: '/admin/certificates', label: 'Certificates', count: 'certificates' },
  { href: '/admin/activity', label: 'Club points', count: 'logs' },
  { href: '/admin/network', label: 'Network', count: null },
] as const

export function AdminFrame({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requireAdmin>
      <AdminProvider>
        <AdminBand />
        <div className={cn(CONTAINER_CLASS, 'pb-28 pt-9')}>{children}</div>
      </AdminProvider>
    </ProtectedRoute>
  )
}

function AdminBand() {
  const pathname = usePathname() || '/admin'
  const { data, ready } = useAdmin()
  const active = TABS.filter((t) => pathname === t.href || pathname.startsWith(t.href + '/')).sort((a, b) => b.href.length - a.href.length)[0]?.href
  const navRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = navRef.current?.querySelector('[aria-current="page"]') as HTMLElement | null
    if (el && navRef.current) navRef.current.scrollLeft = el.offsetLeft - 20
  }, [active])

  const counts: Record<string, number> = {
    members: data.members.length,
    products: data.products.length,
    posts: data.posts.length,
    certificates: data.certificates.length,
    logs: data.logs.length,
    terms: data.terms.terms.length,
  }

  const action = 'inline-flex min-h-[42px] items-center rounded-md px-4 text-[15px] font-semibold transition-colors'
  return (
    <section className="bg-navy-dark text-white">
      <div className={cn(CONTAINER_CLASS, 'pt-7')}>
        <div className="flex flex-wrap items-center justify-between gap-x-7 gap-y-4">
          <div>
            <p className="text-sm text-[#AFC3EE]">Core team</p>
            <h1 className="text-[clamp(26px,2.6vw,32px)] font-bold leading-tight tracking-[-0.02em]">Club admin</h1>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/admin/activity" className={cn(action, 'bg-white text-navy-dark hover:bg-on-navy')}>Log points</Link>
            <Link href="/admin/certificates/new" className={cn(action, 'border border-white/40 text-white hover:border-white')}>Issue certificates</Link>
            <Link href="/admin/users?add=1" className={cn(action, 'border border-white/40 text-white hover:border-white')}>Add member</Link>
          </div>
        </div>
        <div className="mt-[22px] flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
          <nav ref={navRef} aria-label="Admin" className="-mb-px flex max-w-full gap-0.5 overflow-x-auto text-[15px] font-semibold [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((t) => {
              const on = t.href === active
              const n = t.count ? counts[t.count] : null
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={on ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-[46px] shrink-0 items-center gap-2 whitespace-nowrap rounded-t-[10px] px-4 transition-colors',
                    on ? 'bg-ink text-white' : 'text-on-navy hover:bg-white/[0.06] hover:text-white'
                  )}
                >
                  {t.label}
                  {n !== null && ready && <span className={cn('font-mono text-[13px] font-normal', on ? 'text-text-tertiary' : 'text-[#AFC3EE]')}>{n}</span>}
                </Link>
              )
            })}
          </nav>
          <Link href="/dashboard" className="order-first w-full pb-1 text-sm font-medium text-on-navy hover:text-white sm:order-none sm:w-auto sm:pb-3">
            ← Your dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}
