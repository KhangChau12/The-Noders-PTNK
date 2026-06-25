'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from './AuthProvider'
import MobileMenu from './MobileMenu'
import { NAVIGATION_ITEMS } from '@/lib/constants'
import {
  LayoutDashboard, Shield, LogOut, ChevronDown,
  Trophy, GraduationCap, Boxes, Newspaper, Users,
} from 'lucide-react'

const NAV_ICON_MAP: Record<string, React.ReactNode> = {
  Contest: <Trophy className="w-4 h-4" />,
  Education: <GraduationCap className="w-4 h-4" />,
  Products: <Boxes className="w-4 h-4" />,
  Posts: <Newspaper className="w-4 h-4" />,
  About: <Users className="w-4 h-4" />,
}

export function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, profile, signOut, isAdmin } = useAuth()
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (href: string) => {
    if (href === '/' || href === '#') return false
    return pathname === href || pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    await signOut()
    setShowMobileMenu(false)
    setShowUserMenu(false)
  }

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'User'
  const avatarUrl = profile?.avatar_url

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-dark-bg/70 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_0_0_rgba(255,255,255,0.04)]">
        <div className="relative h-16 w-full px-4 sm:px-6 lg:px-12">
          {/* Logo - Absolute Left */}
          <div className="absolute left-4 sm:left-6 lg:left-12 top-1/2 -translate-y-1/2 max-w-[calc(100%-72px)] lg:max-w-none">
            <Link href="/" className="flex items-center">
              <span className="text-lg sm:text-2xl lg:text-[1.65rem] leading-none font-[family-name:var(--font-shrikhand)] text-text-primary whitespace-nowrap">
                The Noders <span className="text-primary-blue">Community</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Absolutely Centered */}
          <nav
            className="hidden lg:flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            aria-label="Main navigation"
            ref={dropdownRef}
          >
            <div className="flex items-center gap-1">
              {NAVIGATION_ITEMS.map((item) => {
                const hasChildren = 'children' in item && item.children
                const active =
                  isActive(item.href) ||
                  (hasChildren && item.children?.some((child) => isActive(child.href)))
                const icon = NAV_ICON_MAP[item.name]

                if (hasChildren) {
                  return (
                    <div key={item.name} className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                        className={cn(
                          'relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors duration-200 group',
                          active ? 'text-text-primary' : 'text-text-tertiary hover:text-text-primary'
                        )}
                      >
                        {icon && <span className={cn('shrink-0 transition-colors duration-200', active ? 'text-primary-blue' : 'text-text-tertiary group-hover:text-text-secondary')}>{icon}</span>}
                        {item.name}
                        <ChevronDown
                          className={cn(
                            'w-3.5 h-3.5 transition-transform duration-200',
                            openDropdown === item.name && 'rotate-180'
                          )}
                        />
                        <span
                          className={cn(
                            'absolute bottom-0 left-4 right-7 h-0.5 rounded-full bg-gradient-brand transition-transform duration-300 origin-left',
                            active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                          )}
                        />
                      </button>

                      {openDropdown === item.name && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 py-2 bg-dark-surface/95 backdrop-blur-md border border-dark-border rounded-xl shadow-xl min-w-[180px] z-50">
                          {item.children?.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setOpenDropdown(null)}
                              className={cn(
                                'block px-4 py-2 text-sm font-medium transition-colors duration-200',
                                isActive(child.href)
                                  ? 'text-primary-blue bg-primary-blue/10'
                                  : 'text-text-secondary hover:text-text-primary hover:bg-dark-border/50'
                              )}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors duration-200 group',
                      active ? 'text-text-primary' : 'text-text-tertiary hover:text-text-primary'
                    )}
                  >
                    {icon && <span className={cn('shrink-0 transition-colors duration-200', active ? 'text-primary-blue' : 'text-text-tertiary group-hover:text-text-secondary')}>{icon}</span>}
                    {item.name}
                    <span
                      className={cn(
                        'absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-brand transition-transform duration-300 origin-left',
                        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      )}
                    />
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Desktop Actions - Absolute Right */}
          <div className="hidden lg:flex items-center gap-2 absolute right-4 sm:right-6 lg:right-12 top-1/2 -translate-y-1/2">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors duration-200 group"
                >
                  {/* Avatar */}
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-semibold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className={cn('w-3.5 h-3.5 text-text-tertiary transition-transform duration-200', showUserMenu && 'rotate-180')} />
                </button>

                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-52 py-1.5 bg-dark-surface/95 backdrop-blur-md border border-dark-border rounded-xl shadow-xl z-50">
                    <div className="px-4 py-2 border-b border-dark-border/60 mb-1">
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
                    <div className="border-t border-dark-border/60 mt-1 pt-1">
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
                className="px-4 py-2 text-sm font-medium bg-gradient-brand text-white rounded-lg hover:shadow-lg hover:shadow-primary-blue/30 transition-all duration-300"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button - Absolute Right */}
          <button
            className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors absolute right-4 top-1/2 -translate-y-1/2"
            onClick={() => setShowMobileMenu(true)}
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu — lives outside <header>: its backdrop-blur creates a
          containing block that would trap the menu's fixed positioning */}
      <MobileMenu
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        navItems={NAVIGATION_ITEMS}
        user={user ? { email: user.email } : null}
        profile={profile}
        isAdmin={isAdmin}
        onSignOut={handleSignOut}
      />
    </>
  )
}
