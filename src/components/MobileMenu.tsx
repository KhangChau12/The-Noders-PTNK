'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAVIGATION_ITEMS } from '@/lib/constants'
import { roleTitle } from '@/lib/memberSummary'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  navItems?: { name: string; href: string }[]
  user: { email?: string } | null
  profile?: { full_name?: string | null; username?: string | null; avatar_url?: string | null; bio?: string | null; role?: string | null } | null
  isAdmin?: boolean
  onSignOut?: () => void
}

/**
 * Full-height sheet: sections first (big, easy thumb targets), then you, then
 * nothing else — contact and legal links live in the footer.
 */
const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, user, profile, isAdmin, onSignOut }) => {
  const pathname = usePathname() || '/'
  const [visible, setVisible] = useState(false)
  const [shown, setShown] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
      document.body.style.overflow = 'hidden'
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
      window.addEventListener('keydown', onKey)
      setTimeout(() => closeRef.current?.focus(), 50)
      return () => {
        window.removeEventListener('keydown', onKey)
        document.body.style.overflow = ''
      }
    }
    setShown(false)
    const t = setTimeout(() => setVisible(false), 200)
    document.body.style.overflow = ''
    return () => clearTimeout(t)
  }, [isOpen, onClose])

  if (!visible) return null

  const active = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const name = profile?.full_name || profile?.username || user?.email?.split('@')[0] || ''
  const initials = name.split(' ').filter(Boolean).map((w) => w[0]).slice(-2).join('').toUpperCase() || '?'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className={cn('fixed inset-0 z-50 flex flex-col bg-ink transition-opacity duration-200 lg:hidden', shown ? 'opacity-100' : 'opacity-0')}
    >
      <div className="flex min-h-[64px] items-center justify-between border-b border-white/[0.08] px-5">
        <Link href="/" onClick={onClose} className="font-brand text-[22px] text-text-primary">The Noders</Link>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close menu" className="h-11 w-11 text-[26px] text-text-primary">×</button>
      </div>

      <nav aria-label="Main" className="overflow-y-auto px-5 pt-3">
        <ul>
          {NAVIGATION_ITEMS.map((item, i) => (
            <li key={item.href} className="stagger-in border-b border-rule" style={{ ['--rv-i' as string]: i }}>
              <Link
                href={item.href}
                onClick={onClose}
                aria-current={active(item.href) ? 'page' : undefined}
                className={cn('flex min-h-[58px] items-center text-[22px] font-semibold tracking-[-0.01em]', active(item.href) ? 'text-white' : 'text-text-secondary')}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/verify" onClick={onClose} className="flex min-h-[50px] items-center text-base font-semibold text-text-secondary">
          Verify a certificate →
        </Link>
      </nav>

      {user ? (
        <div className="mt-auto flex flex-col gap-3.5 bg-paper px-5 pb-[max(22px,env(safe-area-inset-bottom))] pt-[18px]">
          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" className="h-11 w-11 rounded-full object-cover" />
            ) : (
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#2A4B8D] text-sm font-semibold">{initials}</span>
            )}
            <span className="min-w-0">
              <span className="block truncate font-bold">{name}</span>
              <span className="block text-[13px] text-text-tertiary">{roleTitle(profile?.bio, profile?.role)}</span>
            </span>
          </div>
          <div className={cn('grid gap-2', isAdmin ? 'grid-cols-2' : 'grid-cols-1')}>
            <Link href="/dashboard" onClick={onClose} className="flex min-h-[46px] items-center justify-center rounded-md bg-text-primary font-semibold text-ink">Dashboard</Link>
            {isAdmin && (
              <Link href="/admin" onClick={onClose} className="flex min-h-[46px] items-center justify-center rounded-md border border-control font-semibold text-text-primary">Admin</Link>
            )}
          </div>
          <button type="button" onClick={() => { onClose(); onSignOut?.() }} className="self-start text-sm font-semibold text-text-tertiary">Sign out</button>
        </div>
      ) : (
        <div className="mt-auto flex flex-col gap-2.5 bg-navy px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5">
          <Link href={`/login?next=${encodeURIComponent(pathname)}`} onClick={onClose} className="flex min-h-[48px] items-center justify-center rounded-md bg-white font-semibold text-navy-dark">Sign in</Link>
          <p className="text-center text-[13px] text-on-navy">For members of The Noders</p>
        </div>
      )}
    </div>
  )
}

export default MobileMenu
