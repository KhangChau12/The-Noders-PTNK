'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from './AuthProvider'
import MobileMenu from './MobileMenu'
import { NAVIGATION_ITEMS, SECONDARY_NAV_ITEMS } from '@/lib/constants'
import { CONTAINER_CLASS } from './editorial'
import { LayoutDashboard, Shield, LogOut, ChevronDown } from 'lucide-react'

// Mobile drawer gets the primary items plus the utility links as one group.
const MOBILE_NAV_ITEMS = [
  ...NAVIGATION_ITEMS,
  { name: 'More', href: '#', children: SECONDARY_NAV_ITEMS },
]

export function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, profile, signOut, isAdmin } = useAuth()
  const pathname = usePathname()
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (href: string) => {
    if (href === '/' || href === '#') return false
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const handleSignOut = async () => {
    await signOut()
    setShowMobileMenu(false)
    setShowUserMenu(false)
  }

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'User'
  const avatarUrl = profile?.avatar_url
  const nameParts = displayName.trim().split(/\s+/)
  const initials = ((nameParts[0]?.[0] || '') + (nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '')).toUpperCase()

  return (
    <>
      {/* Sticky glass bar — deliberately separate from the navy page intro below it. */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-ink/[0.72] backdrop-blur-[14px] backdrop-saturate-150">
        <div className={cn(CONTAINER_CLASS, 'flex min-h-[68px] items-center gap-11')}>
          <Link href="/" className="font-brand text-[23px] leading-none text-text-primary whitespace-nowrap">
            The Noders
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex flex-1 items-center gap-7" aria-label="Main navigation">
            {NAVIGATION_ITEMS.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'text-[15px] font-medium transition-colors duration-200 underline-offset-[10px] decoration-2 decoration-link',
                    active ? 'text-white underline' : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/verify"
              className={cn(
                'text-[15px] font-medium transition-colors',
                isActive('/verify') ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
              )}
            >
              Verify certificate
            </Link>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="group flex min-h-[44px] items-center gap-2.5"
                  aria-expanded={showUserMenu}
                  aria-haspopup="menu"
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-[#2A4B8D] flex items-center justify-center text-white text-[13px] font-semibold">
                      {initials}
                    </span>
                  )}
                  <span className="whitespace-nowrap text-[15px] font-medium text-text-primary group-hover:text-white">{displayName}</span>
                  <ChevronDown className={cn('w-3.5 h-3.5 text-text-tertiary transition-transform duration-200', showUserMenu && 'rotate-180')} />
                </button>

                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 min-w-[13rem] py-1.5 bg-paper border border-control rounded-lg shadow-xl z-50">
                    <div className="px-4 py-2 border-b border-rule mb-1">
                      <p className="text-xs font-medium text-text-primary truncate">{displayName}</p>
                      <p className="text-xs text-text-tertiary truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 shrink-0" />
                      Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors"
                      >
                        <Shield className="w-4 h-4 shrink-0" />
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-rule mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-text-tertiary hover:text-red-400 hover:bg-red-500/[0.06] transition-colors"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex min-h-[42px] items-center rounded-md border border-[#3A3F4B] px-4 text-[15px] font-medium text-text-primary hover:border-text-tertiary transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden ml-auto flex h-11 w-11 items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            onClick={() => setShowMobileMenu(true)}
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <MobileMenu
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        navItems={MOBILE_NAV_ITEMS}
        user={user ? { email: user.email } : null}
        profile={profile}
        isAdmin={isAdmin}
        onSignOut={handleSignOut}
      />
    </>
  )
}
