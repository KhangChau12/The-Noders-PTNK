'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Trophy, GraduationCap, Boxes, Newspaper, Users, ShieldCheck,
  Mail, LayoutDashboard, Shield, LogOut, X, ChevronRight,
} from 'lucide-react'

interface NavChild {
  name: string
  href: string
}

interface NavItem {
  name: string
  href: string
  children?: NavChild[]
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  navItems: NavItem[]
  user: { email?: string } | null
  profile?: { full_name?: string | null; username?: string | null; avatar_url?: string | null } | null
  isAdmin?: boolean
  onSignOut?: () => void
}

// Icons keyed by top-level nav label (mirrors the Competition Platform's drawer).
const NAV_ICON_MAP: Record<string, React.ReactNode> = {
  Contest: <Trophy className="w-5 h-5" />,
  Education: <GraduationCap className="w-5 h-5" />,
  Products: <Boxes className="w-5 h-5" />,
  Posts: <Newspaper className="w-5 h-5" />,
  About: <Users className="w-5 h-5" />,
  Members: <Users className="w-5 h-5" />,
  'Verify Certificate': <ShieldCheck className="w-5 h-5" />,
  Contact: <Mail className="w-5 h-5" />,
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen, onClose, navItems, user, profile, isAdmin, onSignOut,
}) => {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true))
      })
      document.body.style.overflow = 'hidden'
    } else {
      setIsAnimating(false)
      const timeout = setTimeout(() => setIsVisible(false), 300)
      document.body.style.overflow = ''
      return () => clearTimeout(timeout)
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(path)

  if (!isVisible) return null

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0]
  const initials = (displayName?.[0] || user?.email?.[0] || '?').toUpperCase()

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Side panel */}
      <div
        className={`absolute top-0 right-0 h-full w-[300px] max-w-[90vw] bg-dark-bg flex flex-col transition-transform duration-300 ease-out border-l border-dark-border/60 ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-dark-border/60 shrink-0">
          <span className="font-[family-name:var(--font-shrikhand)] text-base text-text-primary">
            The Noders <span className="text-primary-blue">Community</span>
          </span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-dark-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* User card */}
          {user ? (
            <div className="px-4 pt-5 pb-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-surface border border-dark-border/40">
                <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt={displayName || ''} className="w-full h-full object-cover" />
                  ) : initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-text-primary truncate">
                    {displayName}
                  </p>
                  {user.email && <p className="text-xs text-text-tertiary truncate">{user.email}</p>}
                </div>
                {isAdmin && (
                  <span className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-wider text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="px-4 pt-5 pb-2" />
          )}

          {/* Main nav */}
          <nav className="px-3 pb-2" aria-label="Mobile navigation">
            <p className="px-3 mb-2 text-[10px] font-bold text-text-disabled uppercase tracking-[0.18em]">
              Navigate
            </p>
            {navItems.map((item) => {
              // Items with children render as a small labelled group.
              if (item.children && item.children.length > 0) {
                return (
                  <div key={item.name} className="mb-1">
                    <p className="flex items-center gap-3 px-3 pt-3 pb-1 text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                      <span className="text-text-disabled">{NAV_ICON_MAP[item.name] ?? null}</span>
                      {item.name}
                    </p>
                    {item.children.map((child) => {
                      const active = isActive(child.href)
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          className={`flex items-center gap-3 pl-10 pr-3 py-2.5 mb-0.5 rounded-xl text-sm font-medium transition-colors ${
                            active
                              ? 'text-primary-blue bg-primary-blue/10'
                              : 'text-text-secondary hover:text-text-primary hover:bg-dark-surface'
                          }`}
                        >
                          {child.name}
                          {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-blue" />}
                        </Link>
                      )
                    })}
                  </div>
                )
              }

              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-3 mb-0.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'text-primary-blue bg-primary-blue/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-dark-surface'
                  }`}
                >
                  <span className={active ? 'text-primary-blue' : 'text-text-tertiary'}>
                    {NAV_ICON_MAP[item.name] ?? <ChevronRight className="w-5 h-5" />}
                  </span>
                  {item.name}
                  {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-blue" />}
                </Link>
              )
            })}
          </nav>

          {/* Account nav (logged-in only) */}
          {user && (
            <nav className="px-3 pt-3 border-t border-dark-border/40" aria-label="Account navigation">
              <p className="px-3 mb-2 text-[10px] font-bold text-text-disabled uppercase tracking-[0.18em]">
                Account
              </p>
              <Link
                href="/dashboard"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 mb-0.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-dark-surface transition-colors"
              >
                <LayoutDashboard className="w-5 h-5 text-text-tertiary" />
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-3 mb-0.5 rounded-xl text-sm font-medium text-accent-cyan hover:bg-accent-cyan/10 transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  Admin Panel
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* Bottom CTA */}
        <div
          className="px-4 py-4 border-t border-dark-border/60 shrink-0"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          {user ? (
            <button
              onClick={() => { onClose(); onSignOut?.() }}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold text-error border border-error/30 bg-error/5 hover:bg-error/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="block w-full px-4 py-3 text-center text-sm rounded-xl font-semibold text-white bg-gradient-brand shadow-lg shadow-primary-blue/20"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default MobileMenu
